import EmbraceLogger from '../../src/logger';
const fs = require('fs');

import { embraceJSON, getBuildGradlePatchable } from '../util/android';
import { FileUpdatable } from '../util/file';
import {
  bundlePhaseRE,
  embraceNativePod,
  embracePlistPatchable,
  exportSourcemapRNVariable,
  getPodFile,
  xcodePatchable,
} from '../util/ios';
import Wizard, { Step } from '../util/wizard';
import { androidEmbraceSwazzlerPlugin, androidGenericVersion } from './android';
import { findNameWithCaseSensitiveFromPath } from './ios';
import { SUPPORTED_LANGUAGES } from './patches/common';
import {
  getTextToAddWithBreakingLine,
  SUPPORTED_PATCHES,
} from './patches/patch';

const packageJson = require('../../../../../../package.json');

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
  stepName: 'Removing Embrace code in build.gradle',
  fileName: 'android/build.gradle',
  textsToDelete: [
    {
      ITextToDelete: `${androidGenericVersion}`,
    },
  ],
  findFileFunction: () => getBuildGradlePatchable(['android', 'build.gradle']),
  docUrl: '',
};

const UNINSTALL_ANDROID_SWAZZLER_APPLY: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in app/build.gradle',
  fileName: 'app/build.gradle',
  textsToDelete: [
    {
      ITextToDelete: `${androidEmbraceSwazzlerPlugin}\n`,
    },
  ],
  findFileFunction: () =>
    getBuildGradlePatchable(['android', 'app', 'build.gradle']),
  docUrl: '',
};

const UNINSTALL_IOS_PODFILE: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in Podfile',
  fileName: 'Podfile',
  textsToDelete: [
    {
      ITextToDelete: `${embraceNativePod}\n`,
    },
  ],
  findFileFunction: getPodFile,
  docUrl: '',
};

type UNLINK_EMBRACE_CODE = 'swazzlerImport' | 'swazzlerApply' | 'podFileImport';
type SupportedPatches = {
  [key in UNLINK_EMBRACE_CODE]: IUnlinkEmbraceCode;
};

const UNLINK_EMBRACE_CODE: SupportedPatches = {
  swazzlerImport: UNINSTALL_ANDROID_SWAZZLER_IMPORT,
  swazzlerApply: UNINSTALL_ANDROID_SWAZZLER_APPLY,
  podFileImport: UNINSTALL_IOS_PODFILE,
};

export const removeEmbraceLinkFromFile = (
  patch: UNLINK_EMBRACE_CODE
): boolean => {
  if (UNLINK_EMBRACE_CODE[patch] === undefined) {
    logger.warn('This language is not supported');
    return false;
  }

  const { fileName, textsToDelete, findFileFunction } =
    UNLINK_EMBRACE_CODE[patch];

  const file = findFileFunction();

  if (!file) {
    logger.warn('The file to be patched not found');
    return false;
  }

  const result = textsToDelete.map((item) => {
    const { ITextToDelete } = item;
    logger.log(`Deleting ${ITextToDelete} from ${fileName}`);
    file.deleteLine(ITextToDelete);
    return ITextToDelete;
  });
  const hasToPatch = result.some((item) => item);
  if (hasToPatch) {
    file.patch();
  }
  return hasToPatch;
};

export const removeEmbraceImportAndStartFromFile = (
  patch: SUPPORTED_LANGUAGES
): boolean => {
  if (SUPPORTED_PATCHES[patch] === undefined) {
    logger.warn('This language is not supported');
    return false;
  }

  const { fileName, textsToAdd, findFileFunction } = SUPPORTED_PATCHES[patch];

  const file = findFileFunction(patch, packageJson.name);

  if (!file) {
    logger.warn('The file to be patched not found');
    return false;
  }

  const result = textsToAdd.map((item) => {
    const { textToAdd, breakingLine } = item;

    logger.log(`Deleting ${textToAdd} from ${fileName}`);
    // let padding = "";
    // if (searchText.toString().includes("{")) {
    //   padding = file
    //     .getPaddingAfterStringToTheNextString(textToAdd)
    //     ?.replace(textToAdd, "");
    // } else {
    //   padding = file.getPaddingFromString(textToAdd)?.replace(textToAdd, "");
    // }
    const padding = file.getPaddingFromString(textToAdd)?.replace(textToAdd, '');
    const finalTextToDelet = getTextToAddWithBreakingLine(
      `${padding}${textToAdd}`,
      breakingLine
    );
    console.log('WEEE', `${padding?.length}`);
    console.log('WEEE', `${finalTextToDelet}`);
    file.deleteLine(finalTextToDelet);
    return textToAdd;
  });
  const hasToPatch = result.some((item) => item);
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
      'Could not find embrace-config.json, Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually '
    );
  }
};

export const removeEmbraceConfigFileIos = async (projectName: string) => {
  try {
    const iosConifgFile = await embracePlistPatchable({ name: projectName });
    fs.unlinkSync(iosConifgFile.path);
  } catch (_) {
    logger.error(
      'Could not find Embrace-Info.plist, Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually '
    );
  }
};

export const removeEmbraceFromXcode = () => {
  return new Promise((resolve) => {
    xcodePatchable(packageJson)
      .then((project) => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          logger.error(
            'Could not find bundle phase, Please refer to the docs at https://embrace.io/docs/react-native/integration/upload-symbol-files/'
          );
        }
        const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
          project.path,
          packageJson.name
        );

        project.removeResourceFile(
          nameWithCaseSensitive,
          `${nameWithCaseSensitive}/Embrace-Info.plist`
        );
        project.findAndRemovePhase('Upload Debug Symbols to Embrace');
        project.modifyPhase(
          bundlePhaseKey,
          `${exportSourcemapRNVariable}\n`,
          ''
        );
        project.findAndRemovePhase('/EmbraceIO/run.sh');
        project.sync();
        project.patch();
        resolve(project);
      })
      .catch((r) => {
        logger.error(
          'Could not find bundle phase, Please refer to the docs at https://embrace.io/docs/react-native/integration/upload-symbol-files/'
        );
      });
  });
};

const getRemoveEmbraceFromXcodeStep = () => {
  return {
    name: 'Removing Embrace in Xcode',
    run: (wizard: Wizard) => removeEmbraceFromXcode(),
    docURL: '',
  };
};
const getRemoveEmbraceConfigFileAndroidStep = () => {
  return {
    name: 'Removing Andoird Embrace Config File',
    run: (wizard: Wizard) =>
      new Promise((resolve) => {
        resolve(removeEmbraceConfigFileAndroid());
      }),
    docURL:
      'https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually',
  };
};
const getRemoveEmbraceConfigFileIosStep = () => {
  return {
    name: 'Removing iOS Embrace Config File',
    run: (wizard: Wizard) =>
      new Promise((resolve) => {
        resolve(removeEmbraceConfigFileIos(packageJson));
      }),
    docURL:
      'https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually',
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
  return Object.entries(SUPPORTED_PATCHES).map(([key, value]) => {
    const run = (wizard: Wizard) =>
      new Promise((resolve, reject) => {
        try {
          resolve(
            removeEmbraceImportAndStartFromFile(key as SUPPORTED_LANGUAGES)
          );
        } catch (e) {
          reject(e);
        }
      });
    return {
      name: `Removing Embrace code in ${value.fileName}`,
      run,
      docURL:
        'https://embrace.io/docs/react-native/integration/session-reporting/#starting-embrace-sdk-from-android--ios',
    } as Step;
  });
};

const transformUninstalFunctionsToSteps = (): Step[] => {
  const steps = getUnlinkFilesStep();
  steps.push(...getUnlinkImportStartFilesStep());
  steps.push(getRemoveEmbraceConfigFileAndroidStep());
  steps.push(getRemoveEmbraceConfigFileIosStep());
  steps.push(getRemoveEmbraceFromXcodeStep());
  return steps;
};

const run = () => {
  const wiz = new Wizard();
  [...transformUninstalFunctionsToSteps()].map((step) =>
    wiz.registerStep(step)
  );
  wiz.runSteps();
};

run();
