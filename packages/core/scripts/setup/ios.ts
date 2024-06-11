const semverGte = require('semver/functions/gte');
const fs = require('fs');
const path = require('path');

import EmbraceLogger from '../../src/logger';
import {
  appDelegatePatchable,
  bundlePhaseExtraArgs,
  bundlePhaseRE,
  embraceImport,
  embraceNativePod,
  embracePlistPatchable,
  embRunScript,
  formatEmbraceInitializer,
  podfilePatchable,
  xcodePatchable,
} from '../util/ios';
import Wizard from '../util/wizard';
import { apiToken, iosAppID, packageJSON } from './common';

const logger = new EmbraceLogger(console);

export const iosImportEmbrace = {
  name: 'iOS import Embrace',
  run: (wizard: Wizard): Promise<any> =>
    wizard
      .fieldValue(packageJSON)
      .then((json) => appDelegatePatchable(json))
      .then((appDelegate) => {
        logger.log('patching AppDelegate with Embrace import');
        if (appDelegate.hasLine(embraceImport)) {
          logger.warn('already imported Embrace');
          return false;
        }
        appDelegate.addAfter('#import "AppDelegate.h"', embraceImport);
        appDelegate.patch();
        return true;
      }),
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually',
};

export const iosInitializeEmbrace = {
  name: 'iOS initialize Embrace',
  run: (wizard: Wizard): Promise<any> =>
    wizard
      .fieldValue(packageJSON)
      .then((json) => appDelegatePatchable(json))
      .then((appDelegate) => {
        logger.log('patching AppDelegate with Embrace initialize');
        if (appDelegate.hasLine('[[Embrace sharedInstance] start')) {
          logger.warn('already initializing Embrace');
          return false;
        }
        const embraceInitializer = formatEmbraceInitializer();
        const DID_LAUNCH_REGEX =
          /(-\s*\(BOOL\)\s*application:\s*\(UIApplication\s\*\)\s*(app|application)\s+didFinishLaunchingWithOptions:\s*\(NSDictionary\s*\*\)launchOptions\s*\{\s*)/;

        appDelegate.addAfter(DID_LAUNCH_REGEX, embraceInitializer);
        appDelegate.patch();
        return true;
      }),
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=ios#manually',
};

export const iosPodfile = {
  name: 'Podfile patch (ONLY React Native Version < 0.6)',
  run: (wizard: Wizard): Promise<any> =>
    wizard.fieldValue(packageJSON).then((json) => {
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
        podfile.addAfter(embraceRNPod, embraceNativePod);
        return podfile.patch();
      });
    }),
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

        if (project.hasLine(bundlePhaseKey, bundlePhaseExtraArgs)) {
          logger.warn('already patched Xcode React Native bundle phase');
          return;
        }
        logger.log('Patching Xcode React Native bundle phase');
        project.modifyPhase(
          bundlePhaseKey,
          /^.*?\/(packager|scripts)\/react-native-xcode\.sh\s*/m,
          `${bundlePhaseExtraArgs}\n`
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
              shellScript: `export REACT_NATIVE_MAP_PATH="$CONFIGURATION_BUILD_DIR/main.jsbundle.map"
              EMBRACE_ID=${id} EMBRACE_TOKEN=${token} ${embRunScript}`,
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

const findNameWithCaseSensitiveFromPath = (path: string, name: string) => {
  const pathSplitted = path.split('/');
  const nameInLowerCase = name.toLocaleLowerCase();
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

const embraceRNPod =
  'pod \'RNEmbrace\', :path => \'../node_modules/@embrace-io_react-native\'';

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
