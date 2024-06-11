const semverGte = require('semver/functions/gte');
const fs = require('fs');
const path = require('path');

import EmbraceLogger from '../../src/logger';
import {
  bundlePhaseRE,
  embraceNativePod,
  embracePlistPatchable,
  embRunScript,
  exportSourcemapRNVariable,
  getAppDelegateByIOSLanguage,
  podfilePatchable,
  xcodePatchable,
} from '../util/ios';
import Wizard from '../util/wizard';
import { apiToken, iosAppID, IPackageJson, packageJSON } from './common';
import patchAppDelegateObjectiveC from './patches/ios/ios.objectivec';
import patchAppDelegateSwift from './patches/ios/ios.swift';

const logger = new EmbraceLogger(console);

export const tryToPatchAppDelegate = async ({
  name,
}: {
  name: string;
}): Promise<boolean> => {
  const appDelegate = getAppDelegateByIOSLanguage(name, 'objectivec');
  if (!appDelegate) {
    const appDelegateSwift = getAppDelegateByIOSLanguage(name, 'swift');
    if (!appDelegateSwift) {
      logger.format(
        'Couldn\'t find AppDelegate. Please refer to the docs at https://embrace.io/docs/react-native/integration/add-embrace-sdk/?rn-platform=ios&platform=ios to update manually.'
      );
      return false;
    }
    return await patchAppDelegateSwift(appDelegateSwift);
  }
  return (await patchAppDelegateObjectiveC(appDelegate)) || false;
};

export const iosInitializeEmbrace = {
  name: 'iOS initialize Embrace',
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then(tryToPatchAppDelegate),
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually',
};

export const patchPodfile = (json: IPackageJson) => {
  const rnVersion = (json.dependencies || {})['react-native'];
  if (!rnVersion) {
    throw Error('react-native dependency was not found');
  }
  const rnVersionSanitized = rnVersion.replace('^', '');

  // If 6.0.0, autolink should have linked the Pod.
  if (semverGte('6.0.0', rnVersionSanitized)) {
    logger.log(
      'skipping patching Podfile since react-native is on an autolink supported version'
    );
    return;
  }
  return podfilePatchable().then((podfile) => {
    if (podfile.hasLine(embraceNativePod)) {
      logger.warn('Already has EmbraceIO pod');
      return;
    }
    podfile.addBefore('use_react_native', `${embraceNativePod}\n`);

    return podfile.patch();
  });
};

export const iosPodfile = {
  name: 'Podfile patch (ONLY React Native Version < 0.6)',
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then(patchPodfile),
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#native-modules',
};

export const patchXcodeBundlePhase = {
  name: 'Update bundle phase',
  run: (wizard: Wizard): Promise<any> =>
    wizard
      .fieldValue(packageJSON)
      .then((json) => xcodePatchable(json))
      .then((project) => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          logger.error('Could not find Xcode React Native bundle phase');
          return;
        }

        if (project.hasLine(bundlePhaseKey, exportSourcemapRNVariable)) {
          logger.warn('already patched Xcode React Native bundle phase');
          return;
        }
        logger.log('Patching Xcode React Native bundle phase');
        project.modifyPhase(
          bundlePhaseKey,
          /^.*?\/(packager|scripts)\/react-native-xcode\.sh\s*/m,
          `${exportSourcemapRNVariable}\n`
        );
        project.sync();
        return project.patch();
      }),
  docURL:
    'https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-source-maps',
};

export const addUploadBuildPhase = {
  name: 'Add upload phase',
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then((json) => {
      return xcodePatchable(json).then((project) => {
        const uploadBuildPhaseKey = project.findPhase(embRunScript);
        if (uploadBuildPhaseKey) {
          logger.warn('already added upload phase');
          return;
        }
        return wizard.fieldValueList([iosAppID, apiToken]).then((list) => {
          const [id, token] = list;
          const proj = project.project;
          proj.addBuildPhase(
            [],
            'PBXShellScriptBuildPhase',
            'Upload Debug Symbols to Embrace',
            null,
            {
              shellPath: '/bin/sh',
              shellScript: `REACT_NATIVE_MAP_PATH="$CONFIGURATION_BUILD_DIR/main.jsbundle.map" EMBRACE_ID=${id} EMBRACE_TOKEN=${token} ${embRunScript}`,
            }
          );
          project.sync();
          return project.patch();
        });
      });
    }),
  docURL:
    'https://embrace.io/docs/react-native/integration/upload-symbol-files/#uploading-native-and-javascript-symbol-files',
};

export const findNameWithCaseSensitiveFromPath = (
  path: string,
  name: string
) => {
  const pathSplitted = path.split('/');
  const nameInLowerCase = name.toLocaleLowerCase();
  console.log('AASD', pathSplitted);
  console.log('AASD nameInLowerCase', nameInLowerCase);

  const nameFounded = pathSplitted.find(
    (element) => element.toLocaleLowerCase() === `${nameInLowerCase}.xcodeproj`
  );
  if (nameFounded) {
    return nameFounded.replace('.xcodeproj', '');
  }

  logger.warn('the xcodeproj file does not match with your project\'s name');
  logger.warn(
    `skipping adding Embrace-Info.plist to ${name}, this should be added to the project manually.
    You can go https://embrace.io/docs/ios/integration/session-reporting/#import-embrace for more information`
  );
  return name;
};

export const createEmbracePlist = {
  name: 'Create Embrace plist file',
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then(({ name }) => {
      const p = path.join('ios', name, 'Embrace-Info.plist');
      if (fs.existsSync(p)) {
        logger.warn('already has Embrace-Info.json file');
        return;
      }

      fs.closeSync(fs.openSync(p, 'a'));

      return xcodePatchable({ name })
        .then((project) => {
          const nameWithCaseSensitive = findNameWithCaseSensitiveFromPath(
            project.path,
            name
          );
          project.addFile(
            nameWithCaseSensitive,
            `${nameWithCaseSensitive}/Embrace-Info.plist`
          );
          project.sync();
          project.patch();
        })
        .then(() => embracePlistPatchable({ name }))
        .then((file) =>
          wizard.fieldValue(iosAppID).then((iosAppIDValue) => {
            file.contents = plistContents(iosAppIDValue);
            return file.patch();
          })
        );
    }),
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/#manually',
};

const plistContents = (iosAppIDValue: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>API_KEY</key>
    <string>${iosAppIDValue}</string>
    <key>CRASH_REPORT_ENABLED</key>
    <true/>
  </dict>
</plist>`;
};
