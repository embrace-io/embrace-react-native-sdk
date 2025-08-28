import Wizard from "../util/wizard";
import {
  BUNDLE_PHASE_REGEXP,
  EMBR_NATIVE_POD,
  EMBR_RUN_SCRIPT,
  EXPORT_SOURCEMAP_RN_VAR,
  podfilePatchable,
  xcodePatchable,
  findNameWithCaseSensitiveFromPath,
  MKDIR_SOURCEMAP_DIR,
  EMBR_KSCRASH_MODULAR_HEADER_POD,
} from "../util/ios";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import patch from "./patches/patch";
import {
  apiToken,
  iosAppID,
  iosProjectFolderName,
  IPackageJson,
  packageJSON,
} from "./common";

const path = require("path");
const fs = require("fs");

const semverGte = require("semver/functions/gte");

const LOGGER = new EmbraceLogger(console);

const tryToPatchAppDelegate = async (
  iOSProjectName: string,
): Promise<boolean> => {
  const project = await xcodePatchable(iOSProjectName);
  const bridgingHeader = project.getBridgingHeaderName(iOSProjectName);
  const response = patch("objectivec", iOSProjectName, {bridgingHeader});

  if (response) {
    return project.addBridgingHeader(iOSProjectName);
  }

  return patch("swift", iOSProjectName) || false;
};

/**
 * Getting iOS project name either from user's input ('CustomBeautifulApp') or from package.json ({ name: 'custom.beautiful.app' })
 */
const getIOSProjectName = async (wizard: Wizard) => {
  const [customProjectName, pJSON] = await wizard.fieldValueList([
    iosProjectFolderName,
    packageJSON,
  ]);

  return customProjectName && customProjectName !== ""
    ? customProjectName // if the user decided to customize the project's name when creating the app using the RN cli
    : pJSON.name; // fallback to what package.json contains as name
};

const iosInitializeEmbrace = {
  name: "iOS initialize Embrace",
  run: async (wizard: Wizard) => {
    const name = await getIOSProjectName(wizard);
    return tryToPatchAppDelegate(name);
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually",
};

const patchPodFileWithKSCrash = async () => {
  return podfilePatchable().then(podfile => {
    if (podfile.hasLine(EMBR_KSCRASH_MODULAR_HEADER_POD)) {
      LOGGER.warn("Already has 'KSCrash' pod with modular headers enabled");
      return;
    }

    podfile.addBefore(
      "linkage = ENV['USE_FRAMEWORKS']",
      `${EMBR_KSCRASH_MODULAR_HEADER_POD}\n`,
    );

    return podfile.patch();
  });
};

const patchPodfile = (json: IPackageJson) => {
  const rnVersion = (json.dependencies || {})["react-native"];

  if (!rnVersion) {
    throw Error("react-native dependency was not found");
  }

  const rnVersionSanitized = rnVersion.replace("^", "");

  // If 6.0.0, autolink should have linked the Pod.
  if (semverGte("6.0.0", rnVersionSanitized)) {
    LOGGER.log(
      "Skipping patching Podfile since react-native is on an autolink supported version",
    );

    return;
  }

  return podfilePatchable().then(podfile => {
    if (podfile.hasLine(EMBR_NATIVE_POD)) {
      LOGGER.warn("Already has 'EmbraceIO' pod");
      return;
    }

    podfile.addBefore("use_react_native", `${EMBR_NATIVE_POD}\n`);

    return podfile.patch();
  });
};

const iOSPodfilePatch = {
  name: "Podfile patch (Only React Native v < 0.6)",
  run: async (wizard: Wizard): Promise<any> => {
    return wizard.fieldValue(packageJSON).then(patchPodfile);
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#native-modules",
};

const iosPodfileKSCrashPatch = {
  name: "KSCrash enabling modular headers",
  run: async (_wizard: Wizard): Promise<any> => {
    return patchPodFileWithKSCrash();
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#native-modules",
};

const patchXcodeBundlePhase = {
  name: "Update bundle phase",
  run: async (wizard: Wizard): Promise<any> => {
    return getIOSProjectName(wizard)
      .then(xcodePatchable)
      .then(project => {
        const bundlePhaseKey = project.findPhase(BUNDLE_PHASE_REGEXP);

        if (!bundlePhaseKey) {
          LOGGER.error("Could not find Xcode React Native bundle phase");
          return;
        }

        if (project.hasLine(bundlePhaseKey, EXPORT_SOURCEMAP_RN_VAR)) {
          LOGGER.warn("Already patched Xcode React Native bundle phase");
          return;
        }

        LOGGER.log("Patching Xcode React Native bundle phase");

        project.modifyPhase(
          bundlePhaseKey,
          BUNDLE_PHASE_REGEXP,
          `${MKDIR_SOURCEMAP_DIR}\n${EXPORT_SOURCEMAP_RN_VAR}\n`,
        );

        return project.patch();
      });
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-source-maps",
};

const addUploadBuildPhase = {
  name: "Add upload phase",
  run: (wizard: Wizard): Promise<any> =>
    getIOSProjectName(wizard).then(async name => {
      return xcodePatchable(name).then(project => {
        const uploadBuildPhaseKey = project.findPhase(EMBR_RUN_SCRIPT);

        if (uploadBuildPhaseKey) {
          LOGGER.warn("Already added upload phase");
          return;
        }

        return wizard.fieldValueList([iosAppID, apiToken]).then(list => {
          const [id, token] = list;
          const proj = project.project;

          proj.addBuildPhase(
            [],
            "PBXShellScriptBuildPhase",
            "Upload Debug Symbols to Embrace",
            null,
            {
              shellPath: "/bin/sh",
              shellScript: `REACT_NATIVE_MAP_PATH="$CONFIGURATION_BUILD_DIR/embrace-assets/main.jsbundle.map" EMBRACE_ID=${id} EMBRACE_TOKEN=${token} ${EMBR_RUN_SCRIPT}`,
            },
          );

          return project.patch();
        });
      });
    }),
  docURL:
    "https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-native-and-javascript-symbol-files",
};

const addEmbraceInitializerSwift = {
  name: "Adding EmbraceInitializer.swift",
  run: async (wizard: Wizard): Promise<any> => {
    const appId = await wizard.fieldValue(iosAppID);
    const name = await getIOSProjectName(wizard);
    const project = await xcodePatchable(name);

    const filePath = path.join("ios", name, "EmbraceInitializer.swift");

    try {
      const fd = fs.openSync(filePath, "wx");
      fs.writeFileSync(fd, getEmbraceInitializerContents(appId));
    } catch (e) {
      if (e instanceof Error && e.message.includes("EEXIST")) {
        LOGGER.warn("EmbraceInitializer.swift already exists");
        return;
      } else if (e instanceof Error && e.message.includes("ENOENT")) {
        const ENOENT_CUSTOM_MESSAG =
          "It seems like the name in package.json doesn't match with the project name in the iOS native project. Perhaps the app was created using a custom package name? (using --package-name flag). Please verify that the name of the iOS project and try it again.";

        throw `${e}. ${ENOENT_CUSTOM_MESSAG}`;
      } else {
        throw e;
      }
    }

    const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
      project.path,
      name,
    );

    project.addFile(
      nameWithCaseSensitive,
      `${nameWithCaseSensitive}/EmbraceInitializer.swift`,
      "source",
    );

    return project.patch();
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually",
};

const getEmbraceInitializerContents = (appId: string) => {
  return `import Foundation
import EmbraceIO

@objcMembers class EmbraceInitializer: NSObject {
    // Start the EmbraceSDK with the minimum required settings, for more advanced configuration options see:
    // https://embrace.io/docs/ios/open-source/integration/embrace-options/
    static func start() -> Void {
        do {
            try Embrace
                .setup(
                    options: Embrace.Options(
                        appId: "${appId}",
                        platform: .reactNative
                    )
                )
                .start()
        } catch let e {
            print("Error starting Embrace \\(e.localizedDescription)")
        }
    }
}
`;
};

export {
  tryToPatchAppDelegate,
  patchPodfile,
  getIOSProjectName,
  iosInitializeEmbrace,
  iOSPodfilePatch,
  iosPodfileKSCrashPatch,
  patchXcodeBundlePhase,
  addUploadBuildPhase,
  addEmbraceInitializerSwift,
};
