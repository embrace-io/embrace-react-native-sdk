import EmbraceLogger from '../../src/logger';
const fs = require('fs');

import {
  embraceJSON,
  getBuildGradlePatchable,
  getMainApplicationPatchable,
} from '../util/android';
import { FileUpdatable } from '../util/file';
import {
  bundlePhaseRE,
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
  embraceNativePod,
  embracePlistPatchable,
  exportSourcemapRNVariable,
  getAppDelegateByIOSLanguage,
  getPodFile,
  xcodePatchable,
} from '../util/ios';
import Wizard, { Step } from '../util/wizard';
import {
  androidEmbraceSwazzlerPluginRE,
  androidGenericVersion,
} from './android';
import { MAIN_CLASS_BY_LANGUAGE } from './patches/common';

const packageJson = require('../../../../package.json');

export const EMBRACE_IMPORT_SWIFT = 'import Embrace';

export const EMBRACE_INIT_SWIFT =
  'Embrace.sharedInstance().start(launchOptions: launchOptions, framework:.reactNative)';

export const EMBRACE_IMPORT_JAVA =
  'import io.embrace.android.embracesdk.Embrace;';

export const EMBRACE_INIT_JAVA =
  'Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE);';

export const EMBRACE_IMPORT_KOTLIN =
  'import io.embrace.android.embracesdk.Embrace';

export const EMBRACE_INIT_KOTLIN =
  'Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE)';

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

const UNINSTALL_IOS_SWIFT_APPDELEGATE: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in AppDelegate',
  fileName: MAIN_CLASS_BY_LANGUAGE.swift,
  textsToDelete: [
    {
      ITextToDelete: `${EMBRACE_IMPORT_SWIFT}\n`,
    },
    {
      ITextToDelete: `${EMBRACE_INIT_SWIFT}\n`,
    },
  ],
  findFileFunction: () =>
    getAppDelegateByIOSLanguage(packageJson.name, 'swift'),
  docUrl: '',
};
const UNINSTALL_IOS_OBJECTIVEC_APPDELEGATE: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in AppDelegate',
  fileName: MAIN_CLASS_BY_LANGUAGE.objectivec,
  textsToDelete: [
    {
      ITextToDelete: EMBRACE_IMPORT_OBJECTIVEC,
    },
    {
      ITextToDelete: EMBRACE_INIT_OBJECTIVEC,
    },
  ],
  findFileFunction: () =>
    getAppDelegateByIOSLanguage(packageJson.name, 'objectivec'),
  docUrl: '',
};

const UNINSTALL_ANDROID_KOTLIN_MAIN_ACTIVITTY: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in Main Activity',
  fileName: MAIN_CLASS_BY_LANGUAGE.kotlin,
  textsToDelete: [
    {
      ITextToDelete: `\n${EMBRACE_IMPORT_KOTLIN}`,
    },
    {
      ITextToDelete: `${EMBRACE_INIT_KOTLIN}\n`,
    },
  ],
  findFileFunction: () => getMainApplicationPatchable('kotlin'),
  docUrl: '',
};
const UNINSTALL_ANDROID_JAVA_MAIN_ACTIVITTY: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in Main Activity',
  fileName: MAIN_CLASS_BY_LANGUAGE.java,
  textsToDelete: [
    {
      ITextToDelete: `\n${EMBRACE_IMPORT_JAVA}`,
    },
    {
      ITextToDelete: `${EMBRACE_INIT_JAVA}\n`,
    },
  ],
  findFileFunction: () => getMainApplicationPatchable('java'),
  docUrl: '',
};

const UNINSTALL_ANDROID_SWAZZLER_IMPORT: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in build.gradle',
  fileName: MAIN_CLASS_BY_LANGUAGE.java,
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
  fileName: MAIN_CLASS_BY_LANGUAGE.java,
  textsToDelete: [
    {
      ITextToDelete: `${androidEmbraceSwazzlerPluginRE}\n`,
    },
  ],
  findFileFunction: () =>
    getBuildGradlePatchable(['android', 'app', 'build.gradle']),
  docUrl: '',
};

const UNINSTALL_IOS_PODFILE: IUnlinkEmbraceCode = {
  stepName: 'Removing Embrace code in Podfile',
  fileName: MAIN_CLASS_BY_LANGUAGE.java,
  textsToDelete: [
    {
      ITextToDelete: `${embraceNativePod}\n`,
    },
  ],
  findFileFunction: getPodFile,
  docUrl: '',
};

type UNLINK_EMBRACE_CODE =
  | 'objectivecImportStart'
  | 'swiftImportStart'
  | 'javaImportStart'
  | 'kotlinImportStart'
  | 'swazzlerImport'
  | 'swazzlerApply'
  | 'podFileImport';
type SupportedPatches = {
  [key in UNLINK_EMBRACE_CODE]: IUnlinkEmbraceCode;
};

const UNLINK_EMBRACE_CODE: SupportedPatches = {
  objectivecImportStart: UNINSTALL_IOS_OBJECTIVEC_APPDELEGATE,
  swiftImportStart: UNINSTALL_IOS_SWIFT_APPDELEGATE,
  javaImportStart: UNINSTALL_ANDROID_JAVA_MAIN_ACTIVITTY,
  kotlinImportStart: UNINSTALL_ANDROID_KOTLIN_MAIN_ACTIVITTY,
  swazzlerImport: UNINSTALL_ANDROID_SWAZZLER_IMPORT,
  swazzlerApply: UNINSTALL_ANDROID_SWAZZLER_APPLY,
  podFileImport: UNINSTALL_IOS_PODFILE,
};

export const removeEmbraceImportAndStartFromFile = (
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

export const removeEmbraceConfigFiles = async (projectName?: string) => {
  const androidConfigFile = await embraceJSON();
  fs.unlinkSync(androidConfigFile.path);

  if (projectName) {
    const iosConifgFile = await embracePlistPatchable({ name: projectName });
    fs.unlinkSync(iosConifgFile.path);
  }
};

export const removeEmbraceFromXcode = () => {
  return new Promise((resolve, reject) => {
    xcodePatchable(packageJson)
      .then((project) => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          logger.error('Could not find bundle phase.');
          reject();
        }
        project.modifyPhase(bundlePhaseKey, exportSourcemapRNVariable, '');
        project.findAndRemovePhase('/EmbraceIO/run.sh');
        project.sync();
        project.patch();
        resolve(project);
      })
      .catch((r) => {
        reject(r);
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
const getRemoveEmbraceConfigFilesStep = () => {
  return {
    name: 'Removing Embrace Config Files',
    run: (wizard: Wizard) =>
      new Promise((resolve, reject) => {
        try {
          resolve(removeEmbraceConfigFiles());
        } catch (e) {
          reject(e);
        }
      }),
    docURL: '',
  };
};

const getUnlinkFilesStep = () => {
  return Object.entries(UNLINK_EMBRACE_CODE).map(([key, value]) => {
    const run = (wizard: Wizard) =>
      new Promise((resolve, reject) => {
        try {
          resolve(
            removeEmbraceImportAndStartFromFile(key as UNLINK_EMBRACE_CODE)
          );
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

const transformUninstalFunctionsToSteps = (): Step[] => {
  const steps = getUnlinkFilesStep();
  steps.push(getRemoveEmbraceConfigFilesStep());
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

export default run;
