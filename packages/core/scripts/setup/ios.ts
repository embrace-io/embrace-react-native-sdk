import Wizard from "../util/wizard";
import {
  bundlePhaseRE,
  embraceNativePod,
  embRunScript,
  exportSourcemapRNVariable,
  podfilePatchable,
  xcodePatchable,
} from "../util/ios";
import EmbraceLogger from "../../src/logger";

import patch from "./patches/patch";
import {apiToken, iosAppID, IPackageJson, packageJSON} from "./common";

const semverGte = require("semver/functions/gte");

const logger = new EmbraceLogger(console);

export const tryToPatchAppDelegate = async ({
  name,
  appId,
}: {
  name: string;
  appId: string;
}): Promise<boolean> => {
  const response = patch("objectivec", name, appId);
  if (!response) {
    return patch("swift", name, appId) || false;
  }
  return response;
};

export const iosInitializeEmbrace = {
  name: "iOS initialize Embrace",
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValueList([iosAppID, packageJSON]).then(list => {
      const [appId, packageJSON] = list;
      const name = (packageJSON as IPackageJson).name;
      return tryToPatchAppDelegate({name, appId});
    }),
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
        project.sync();
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
          project.sync();
          return project.patch();
        });
      });
    }),
  docURL:
    "https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-native-and-javascript-symbol-files",
};

export const findNameWithCaseSensitiveFromPath = (
  path: string,
  name: string,
) => {
  const pathSplitted = path.split("/");
  const nameInLowerCase = name.toLocaleLowerCase();

  const nameFounded = pathSplitted.find(
    element => element.toLocaleLowerCase() === `${nameInLowerCase}.xcodeproj`,
  );
  if (nameFounded) {
    return nameFounded.replace(".xcodeproj", "");
  }

  return name;
};
