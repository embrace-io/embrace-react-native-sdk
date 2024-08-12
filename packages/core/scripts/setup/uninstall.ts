import Wizard, {Step} from "../util/wizard";
import {
  bundlePhaseRE,
  embraceNativePod,
  embracePlistPatchable,
  exportSourcemapRNVariable,
  findNameWithCaseSensitiveFromPath,
  getPodFile,
  xcodePatchable,
} from "../util/ios";
import {FileUpdatable} from "../util/file";
import {embraceJSON, getBuildGradlePatchable} from "../util/android";
import EmbraceLogger from "../../src/logger";

import {
  getText,
  getTextToAddWithBreakingLine,
  SUPPORTED_REMOVALS,
} from "./patches/patch";
import {SUPPORTED_LANGUAGES} from "./patches/common";
import {androidEmbraceSwazzlerPlugin, androidGenericVersion} from "./android";

const fs = require("fs");

const glob = require("glob");

const packageJson = require("../../../../../../package.json");

const logger = new EmbraceLogger(console);

interface ITextToDelete {
  ITextToDelete: string | RegExp;
}

type FindFileFunction = () => FileUpdatable | undefined;

interface IUnlinkEmbraceCode {
  stepName: string;
  fileName: string;
  textsToDelete: ITextToDelete[];
  findFileFunction: FindFileFunction;
  docUrl: string;
}

const UNINSTALL_ANDROID_SWAZZLER_IMPORT: IUnlinkEmbraceCode = {
  stepName: "Removing Embrace code in build.gradle",
  fileName: "android/build.gradle",
  textsToDelete: [
    {
      ITextToDelete: `${androidGenericVersion}`,
    },
  ],
  findFileFunction: () => getBuildGradlePatchable(["android", "build.gradle"]),
  docUrl: "",
};

const UNINSTALL_ANDROID_SWAZZLER_APPLY: IUnlinkEmbraceCode = {
  stepName: "Removing Embrace code in app/build.gradle",
  fileName: "app/build.gradle",
  textsToDelete: [
    {
      ITextToDelete: `${androidEmbraceSwazzlerPlugin}\n`,
    },
  ],
  findFileFunction: () =>
    getBuildGradlePatchable(["android", "app", "build.gradle"]),
  docUrl: "",
};

const UNINSTALL_IOS_PODFILE: IUnlinkEmbraceCode = {
  stepName: "Removing Embrace code in Podfile",
  fileName: "Podfile",
  textsToDelete: [
    {
      ITextToDelete: `${embraceNativePod}\n`,
    },
  ],
  findFileFunction: getPodFile,
  docUrl: "",
};

type UNLINK_EMBRACE_CODE = "swazzlerImport" | "swazzlerApply" | "podFileImport";
type SupportedPatches = {
  [key in UNLINK_EMBRACE_CODE]: IUnlinkEmbraceCode;
};

const UNLINK_EMBRACE_CODE: SupportedPatches = {
  swazzlerImport: UNINSTALL_ANDROID_SWAZZLER_IMPORT,
  swazzlerApply: UNINSTALL_ANDROID_SWAZZLER_APPLY,
  podFileImport: UNINSTALL_IOS_PODFILE,
};

export const removeEmbraceLinkFromFile = (
  patch: UNLINK_EMBRACE_CODE,
): boolean => {
  if (UNLINK_EMBRACE_CODE[patch] === undefined) {
    logger.warn("This language is not supported");
    return false;
  }

  const {fileName, textsToDelete, findFileFunction} =
    UNLINK_EMBRACE_CODE[patch];

  const file = findFileFunction();

  if (!file) {
    logger.warn("The file to be patched not found");
    return false;
  }

  const result = textsToDelete.map(item => {
    const {ITextToDelete} = item;
    logger.log(`Deleting ${ITextToDelete} from ${fileName}`);
    file.deleteLine(ITextToDelete);
    return ITextToDelete;
  });
  const hasToPatch = result.some(item => item);
  if (hasToPatch) {
    file.patch();
  }
  return hasToPatch;
};

export const removeEmbraceImportAndStartFromFile = (
  patch: SUPPORTED_LANGUAGES,
): boolean => {
  const definition = SUPPORTED_REMOVALS[patch];
  if (definition === undefined) {
    logger.warn("This language is not supported");
    return false;
  }

  const {fileName, textsToAdd, findFileFunction} = definition;

  const file = findFileFunction(patch, packageJson.name);

  if (!file) {
    logger.warn("The file to be patched not found");
    return false;
  }

  let hasToPatch = false;
  textsToAdd.map(item => {
    const {breakingLine} = item;
    const textToAdd = getText(item);
    const toDelete = Array.isArray(textToAdd) ? textToAdd : [textToAdd];

    console.log(item.textToAdd);

    toDelete.forEach(line => {
      logger.log(`Deleting ${line} from ${fileName}`);

      const padding = file.getPaddingFromString(line)?.replace(line, "");
      const finalTextToDelete = getTextToAddWithBreakingLine(
        `${padding}${line}`,
        breakingLine,
      );
      file.deleteLine(finalTextToDelete);

      hasToPatch = true;
    });
  });

  if (hasToPatch) {
    file.patch();
  }
  return hasToPatch;
};

export const removeEmbraceConfigFileAndroid = async () => {
  try {
    const androidConfigFile = await embraceJSON();
    fs.unlinkSync(androidConfigFile.path);
  } catch (_) {
    logger.error(
      "Could not find embrace-config.json, Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually ",
    );
  }
};

export const removeEmbraceConfigFileIos = async () => {
  try {
    const iosConfigFile = await embracePlistPatchable();
    fs.unlinkSync(iosConfigFile.path);
  } catch (_) {
    // Only apps uninstalling from iOS 5.x would have this file so ignore if it's missing
  }
};

export const removeEmbraceInitializerFileIos = async () => {
  try {
    const p = glob.sync("ios/**/EmbraceInitializer.swift")[0];
    if (!p) {
      logger.format("Could not find EmbraceInitializer.swift");
      return false;
    }
    fs.unlinkSync(p);
    return true;
  } catch (_) {
    return false;
  }
};

export const removeEmbraceFromXcode = () => {
  return new Promise(resolve => {
    xcodePatchable(packageJson)
      .then(project => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          logger.error(
            "Could not find bundle phase, Please refer to the docs at https://embrace.io/docs/react-native/integration/upload-symbol-files/",
          );
        }
        const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
          project.path,
          packageJson.name,
        );

        // Plist longer exists on iOS 6.x, keep this step to for 5.x upgrades
        project.removeResourceFile(
          nameWithCaseSensitive,
          `${nameWithCaseSensitive}/Embrace-Info.plist`,
        );
        project.removeResourceFile(
          nameWithCaseSensitive,
          `${nameWithCaseSensitive}/EmbraceInitializer.swift`,
        );
        project.findAndRemovePhase("Upload Debug Symbols to Embrace");
        project.modifyPhase(
          bundlePhaseKey,
          `${exportSourcemapRNVariable}\n`,
          "",
        );
        project.findAndRemovePhase("/EmbraceIO/run.sh");
        project.patch();
        resolve(project.writeSync());
      })
      .catch(r => {
        console.log(r);
        logger.error(
          "Could not find bundle phase, Please refer to the docs at https://embrace.io/docs/react-native/integration/upload-symbol-files/",
        );
      });
  });
};

const getRemoveEmbraceFromXcodeStep = () => {
  return {
    name: "Removing Embrace in Xcode",
    run: (wizard: Wizard) => removeEmbraceFromXcode(),
    docURL: "",
  };
};
const getRemoveEmbraceConfigFileAndroidStep = () => {
  return {
    name: "Removing Andoird Embrace Config File",
    run: (wizard: Wizard) =>
      new Promise(resolve => {
        resolve(removeEmbraceConfigFileAndroid());
      }),
    docURL:
      "https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually",
  };
};

const getRemoveEmbraceConfigFileIosStep = () => {
  return {
    name: "Removing iOS Embrace Config File",
    run: (wizard: Wizard) =>
      new Promise(resolve => {
        resolve(removeEmbraceConfigFileIos());
      }),
    docURL:
      "https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually",
  };
};

const getRemoveEmbraceInitializerIosStep = () => {
  return {
    name: "Removing iOS Embrace Initializer File",
    run: (wizard: Wizard) =>
      new Promise(resolve => {
        resolve(removeEmbraceInitializerFileIos());
      }),
    docURL:
      "https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually",
  };
};

const getUnlinkFilesStep = () => {
  return Object.entries(UNLINK_EMBRACE_CODE).map(([key, value]) => {
    const run = (wizard: Wizard) =>
      new Promise((resolve, reject) => {
        try {
          resolve(removeEmbraceLinkFromFile(key as UNLINK_EMBRACE_CODE));
        } catch (e) {
          reject(e);
        }
      });
    return {
      name: value.stepName,
      run,
      docURL: value.docUrl,
    } as Step;
  });
};

const getUnlinkImportStartFilesStep = () => {
  return Object.entries(SUPPORTED_REMOVALS).map(([key, value]) => {
    const run = (wizard: Wizard) =>
      new Promise((resolve, reject) => {
        try {
          resolve(
            removeEmbraceImportAndStartFromFile(key as SUPPORTED_LANGUAGES),
          );
        } catch (e) {
          reject(e);
        }
      });

    return {
      name: `Removing Embrace code in ${value?.fileName}`,
      run,
      docURL:
        "https://embrace.io/docs/react-native/integration/session-reporting/#starting-embrace-sdk-from-android--ios",
    } as Step;
  });
};

const transformUninstalFunctionsToSteps = (): Step[] => {
  const steps = getUnlinkFilesStep();
  steps.push(...getUnlinkImportStartFilesStep());
  steps.push(getRemoveEmbraceConfigFileAndroidStep());
  steps.push(getRemoveEmbraceConfigFileIosStep()); // Plist longer exists on iOS 6.x, keep this step to for 5.x upgrades
  steps.push(getRemoveEmbraceInitializerIosStep());
  steps.push(getRemoveEmbraceFromXcodeStep());
  return steps;
};

const run = () => {
  const wiz = new Wizard();
  [...transformUninstalFunctionsToSteps()].map(step => wiz.registerStep(step));
  wiz.runSteps();
};

run();
