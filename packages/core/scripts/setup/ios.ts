import Wizard from "../util/wizard";
import {
  bundlePhaseRE,
  embraceNativePod,
  embRunScript,
  exportSourcemapRNVariable,
  podfilePatchable,
  xcodePatchable,
  findNameWithCaseSensitiveFromPath,
  makeSourcemapDirectory,
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

const logger = new EmbraceLogger(console);

const tryToPatchAppDelegate = async (
  iOSProjectName: string,
): Promise<boolean> => {
  const project = await xcodePatchable(iOSProjectName);
  console.log("tryToPatchAppDelegate", project);
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
    console.log("iosInitializeEmbrace", name);
    return tryToPatchAppDelegate(name);
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually",
};

const patchPodfile = (json: IPackageJson) => {
  const rnVersion = (json.dependencies || {})["react-native"];

  if (!rnVersion) {
    throw Error("react-native dependency was not found");
  }

  const rnVersionSanitized = rnVersion.replace("^", "");

  // If 6.0.0, autolink should have linked the Pod.
  if (semverGte("6.0.0", rnVersionSanitized)) {
    logger.log(
      "Skipping patching Podfile since react-native is on an autolink supported version",
    );

    return;
  }

  return podfilePatchable().then(podfile => {
    if (podfile.hasLine(embraceNativePod)) {
      logger.warn("Already has EmbraceIO pod");
      return;
    }

    podfile.addBefore("use_react_native", `${embraceNativePod}\n`);

    return podfile.patch();
  });
};

const iosPodfile = {
  name: "Podfile patch (Only React Native v < 0.6)",
  run: async (wizard: Wizard): Promise<any> => {
    const name = await getIOSProjectName(wizard);
    return patchPodfile(name);
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
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);

        if (!bundlePhaseKey) {
          logger.error("Could not find Xcode React Native bundle phase");
          return;
        }

        if (project.hasLine(bundlePhaseKey, exportSourcemapRNVariable)) {
          logger.warn("Already patched Xcode React Native bundle phase");
          return;
        }

        logger.log("Patching Xcode React Native bundle phase");

        project.modifyPhase(
          bundlePhaseKey,
          /^.*?\/(packager|scripts)\/react-native-xcode\.sh\s*/m,
          `${makeSourcemapDirectory}\n${exportSourcemapRNVariable}\n`,
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
        const uploadBuildPhaseKey = project.findPhase(embRunScript);

        if (uploadBuildPhaseKey) {
          logger.warn("Already added upload phase");
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
              shellScript: `REACT_NATIVE_MAP_PATH="$CONFIGURATION_BUILD_DIR/embrace-assets/main.jsbundle.map" EMBRACE_ID=${id} EMBRACE_TOKEN=${token} ${embRunScript}`,
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
        logger.warn("EmbraceInitializer.swift already exists");
        return;
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
  iosInitializeEmbrace,
  iosPodfile,
  patchXcodeBundlePhase,
  addUploadBuildPhase,
  addEmbraceInitializerSwift,
};
