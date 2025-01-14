import Wizard from "../util/wizard";
import {
  bundlePhaseRE,
  embraceNativePod,
  embRunScript,
  exportSourcemapRNVariable,
  podfilePatchable,
  xcodePatchable,
  findNameWithCaseSensitiveFromPath,
} from "../util/ios";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import patch from "./patches/patch";
import {apiToken, iosAppID, IPackageJson, packageJSON} from "./common";

const path = require("path");
const fs = require("fs");

const semverGte = require("semver/functions/gte");

const logger = new EmbraceLogger(console);

export const tryToPatchAppDelegate = async ({
  name,
}: {
  name: string;
}): Promise<boolean> => {
  const project = await xcodePatchable({name});
  const bridgingHeader = project.getBridgingHeaderName(name);
  const response = patch("objectivec", name, {bridgingHeader});
  if (response) {
    return project.addBridgingHeader(name);
  } else {
    return patch("swift", name) || false;
  }
};

export const iosInitializeEmbrace = {
  name: "iOS initialize Embrace",
  run: async (wizard: Wizard) => {
    const pJSON = await wizard.fieldValue(packageJSON);
    const name = (pJSON as IPackageJson).name;

    return tryToPatchAppDelegate({name});
  },
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually",
};

export const patchPodfile = (json: IPackageJson) => {
  const rnVersion = (json.dependencies || {})["react-native"];
  if (!rnVersion) {
    throw Error("react-native dependency was not found");
  }
  const rnVersionSanitized = rnVersion.replace("^", "");

  // If 6.0.0, autolink should have linked the Pod.
  if (semverGte("6.0.0", rnVersionSanitized)) {
    logger.log(
      "skipping patching Podfile since react-native is on an autolink supported version",
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

export const iosPodfile = {
  name: "Podfile patch (ONLY React Native Version < 0.6)",
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then(patchPodfile),
  docURL:
    "https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#native-modules",
};

export const patchXcodeBundlePhase = {
  name: "Update bundle phase",
  run: (wizard: Wizard): Promise<any> =>
    wizard
      .fieldValue(packageJSON)
      .then(json => xcodePatchable(json))
      .then(project => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          logger.error("Could not find Xcode React Native bundle phase");
          return;
        }

        if (project.hasLine(bundlePhaseKey, exportSourcemapRNVariable)) {
          logger.warn("already patched Xcode React Native bundle phase");
          return;
        }
        logger.log("Patching Xcode React Native bundle phase");
        project.modifyPhase(
          bundlePhaseKey,
          /^.*?\/(packager|scripts)\/react-native-xcode\.sh\s*/m,
          `${exportSourcemapRNVariable}\n`,
        );
        return project.patch();
      }),
  docURL:
    "https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-source-maps",
};

export const addUploadBuildPhase = {
  name: "Add upload phase",
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then(json => {
      return xcodePatchable(json).then(project => {
        const uploadBuildPhaseKey = project.findPhase(embRunScript);
        if (uploadBuildPhaseKey) {
          logger.warn("already added upload phase");
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
              shellScript: `REACT_NATIVE_MAP_PATH="$CONFIGURATION_BUILD_DIR/main.jsbundle.map" EMBRACE_ID=${id} EMBRACE_TOKEN=${token} ${embRunScript}`,
            },
          );
          return project.patch();
        });
      });
    }),
  docURL:
    "https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-native-and-javascript-symbol-files",
};

export const addEmbraceInitializerSwift = {
  name: "Adding EmbraceInitializer.swift",
  run: async (wizard: Wizard): Promise<any> => {
    const [appId, json] = await wizard.fieldValueList([iosAppID, packageJSON]);
    const {name} = json;
    const project = await xcodePatchable({name});

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
    // https://embrace.io/docs/ios/open-source/embrace-options/
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
