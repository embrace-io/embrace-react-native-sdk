const fs = require('fs');
const path = require('path');

import EmbraceLogger from '../../src/logger';
import {
  buildAppGradlePatchable,
  buildGradlePatchable,
  embraceJSON,
  embraceJSONContents,
} from '../util/android';
import { NoopFile } from '../util/file';
import { FileUpdatable } from '../util/file';
import Wizard from '../util/wizard';
import { androidAppID, apiToken, packageJSON } from './common';
import patchJavaMainApplication from './patches/android/patch.java';
import patchKotlinMainApplication from './patches/android/patch.kotlin';

const logger = new EmbraceLogger(console);

const androidToolsBuildGradleRE =
  /(\s+)classpath(\(|\s)("|')com\.android\.tools\.build:gradle(?::\d+(?:\.\d+)*)?("|')\)/;

export const androidEmbraceSwazzler =
  /classpath(\(|\s)('|")io\.embrace:embrace-swazzler:.*('|")\)?/;

const androidGenericVersion =
  'classpath "io.embrace:embrace-swazzler:${findProject(\':embrace-io_react-native\').properties[\'emb_android_sdk\']}"';

export const patchBuildGradle = {
  name: 'patch build.gradle',
  run: (wizard: Wizard): Promise<any> => {
    return buildGradlePatchable().then((file) => {
      if (file.hasLine(androidToolsBuildGradleRE)) {
        if (file.hasLine(androidEmbraceSwazzler)) {
          file.deleteLine(androidEmbraceSwazzler);
        }
        logger.log('Patching build.gradle file');
        file.addAfter(androidToolsBuildGradleRE, androidGenericVersion);
        file.patch();
        return;
      }

      logger.warn('Can\'t find file with com.android.tools.build:gradle');
      return;
    });
  },
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=android#manually',
};

const androidPlugin = /apply plugin: ("|')com.android.application("|')/;
export const androidEmbraceSwazzlerPluginRE =
  /apply plugin: ('|")embrace-swazzler('|")/;
const androidEmbraceSwazzlerPlugin = 'apply plugin: \'embrace-swazzler\'';

export const patchAppBuildGradle = {
  name: 'patch app/build.gradle',
  run: (wizard: Wizard): Promise<any> => {
    return buildAppGradlePatchable().then((file) => {
      if (file.hasLine(androidPlugin)) {
        if (file.hasLine(androidEmbraceSwazzlerPluginRE)) {
          logger.warn('already has Embrace Swazzler plugin');
        } else {
          logger.log('patching app/build.gradle file');
          file.addAfter(androidPlugin, '\n' + androidEmbraceSwazzlerPlugin);
        }

        file.patch();
        return;
      }
      logger.warn('Can\'t find line: apply plugin: "com.android.application"');
      return;
    });
  },
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=android#manually',
};

export const createEmbraceJSON = {
  name: 'create Embrace JSON file',
  run: (wizard: Wizard): Promise<any> => {
    return new Promise<FileUpdatable>((resolve: any) => {
      const p = path.join(
        'android',
        'app',
        'src',
        'main',
        'embrace-config.json'
      );
      if (fs.existsSync(p)) {
        logger.log('already has embrace-config.json file');
        return resolve(NoopFile);
      }
      fs.closeSync(fs.openSync(p, 'a'));
      return resolve(embraceJSON());
    }).then((file: FileUpdatable) => {
      if (file === NoopFile) {
        return;
      }
      return wizard
        .fieldValueList([androidAppID, apiToken])
        .then((list) => {
          const [id, token] = list;
          file.contents = embraceJSONContents({ appID: id, apiToken: token });
          return file.patch();
        })
        .then(() => {
          logger.log('adding embrace-config.json file in android/app/src/main');
        });
    });
  },
  docURL:
    'https://embrace.io/docs/react-native/integration/add-embrace-sdk/?platform=android#manually',
};

const tryToPatchMainApplication = async () => {
  // In the future there will be more apps with kotlin than java so I start looking up by kotlin
  const response = await patchKotlinMainApplication();
  if (!response) {
    return patchJavaMainApplication();
  }
};

export const patchMainApplication = {
  name: 'patch MainApplication.kt file',
  run: (wizard: Wizard): Promise<any> => {
    return wizard.fieldValue(packageJSON).then(() => {
      return tryToPatchMainApplication();
    });
  },
  docURL:
    'https://embrace.io/docs/react-native/integration/session-reporting/#import-embrace',
};
