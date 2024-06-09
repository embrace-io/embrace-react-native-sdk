const fs = require('fs');
import EmbraceLogger from '../../src/logger';

import { unlinkObjectiveC } from '../setup/patches/ios/unlink.objectivec';
import { unlinkSwift } from '../setup/patches/ios/unlink.swift';
import { NoopFile, patchFiles } from '../util/file';
import {
  bundlePhaseExtraArgs,
  bundlePhaseRE,
  embraceNativePod,
  embracePlistPatchable,
  podfilePatchable,
  xcodePatchable,
} from '../util/ios';

const packageJson = require('../../../../../../package.json');

const embLogger = new EmbraceLogger(console);

const removeEmbraceInfoPlist = (): Promise<boolean> =>
  new Promise((resolve, reject) =>
    embracePlistPatchable(packageJson.name)
      .then((file) => {
        fs.unlinkSync(file.path);
        resolve(true);
      })
      .catch(() => {
        reject(false);
      })
  );

export default () => {
  embLogger.log('Running iOS unlink script');
  return patchFiles(
    () => {
      return unlinkObjectiveC(packageJson.name).catch(() =>
        unlinkSwift(packageJson.name)
      );
    },
    () =>
      podfilePatchable().then((podfile) => {
        podfile.deleteLine(embraceNativePod);
        return podfile;
      }),
    () =>
      xcodePatchable(packageJson).then((project) => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          embLogger.error('Could not find bundle phase.');
          return NoopFile;
        }

        project.modifyPhase(bundlePhaseKey, bundlePhaseExtraArgs, '');
        project.findAndRemovePhase('/EmbraceIO/run.sh');
        project.sync();
        return project;
      })
  ).then(removeEmbraceInfoPlist);
};
