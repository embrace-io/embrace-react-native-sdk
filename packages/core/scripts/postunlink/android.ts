const fs = require('fs');
import EmbraceLogger from '../../src/logger';
import {
  androidEmbraceSwazzler,
  androidEmbraceSwazzlerPluginRE,
} from '../setup/android';
import { unlinkJava } from '../setup/patches/android/unlink.java';
import { unlinkKotlin } from '../setup/patches/android/unlink.kotlin';
import {
  buildAppGradlePatchable,
  buildGradlePatchable,
  embraceJSON,
} from '../util/android';

import { FileUpdatable, patchFiles } from '../util/file';

const embLogger = new EmbraceLogger(console);

const unlinkSwazzlerImport = (): Promise<FileUpdatable> => {
  return new Promise((resolve) =>
    buildGradlePatchable().then((file) => {
      file.deleteLine(androidEmbraceSwazzler);
      resolve(file);
    })
  );
};

const unlinkSwazzlerApply = (): Promise<FileUpdatable> => {
  return new Promise((resolve) =>
    buildAppGradlePatchable().then((file) => {
      file.deleteLine(androidEmbraceSwazzlerPluginRE);
      resolve(file);
    })
  );
};

const removeEmbraceConfigFile = (): Promise<boolean> =>
  new Promise((resolve, reject) =>
    embraceJSON()
      .then((file) => {
        fs.unlinkSync(file.path);
        resolve(true);
      })
      .catch(() => reject(false))
  );

export default () => {
  embLogger.log('Running android unlink script');
  return patchFiles(
    () => unlinkKotlin().catch(unlinkJava),
    () => unlinkSwazzlerImport(),
    () => unlinkSwazzlerApply()
  ).then(removeEmbraceConfigFile);
};
