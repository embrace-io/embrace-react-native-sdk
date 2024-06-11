const fs = require('fs');
import EmbraceLogger from '../../src/logger';

import { unlinkObjectiveC } from '../setup/patches/ios/unlink.objectivec';
import { unlinkSwift } from '../setup/patches/ios/unlink.swift';
import { FileUpdatable, patchFiles } from '../util/file';
import {
  bundlePhaseRE,
  embraceNativePod,
  embracePlistPatchable,
  exportSourcemapRNVariable,
  podfilePatchable,
  xcodePatchable,
  XcodeProject,
} from '../util/ios';

const packageJson = require('../../../../../../package.json');

const embLogger = new EmbraceLogger(console);

export const removeEmbraceInfoPlist = (): Promise<boolean> =>
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
export const unpatchPodfile = (): Promise<FileUpdatable> =>
  new Promise((resolve, reject) =>
    podfilePatchable()
      .then((podfile) => {
        podfile.deleteLine(`${embraceNativePod}\n`);
        resolve(podfile);
      })
      .catch(reject)
  );

export const unpatchXcode = (): Promise<XcodeProject> =>
  new Promise((resolve, reject) =>
    xcodePatchable(packageJson)
      .then((project) => {
        const bundlePhaseKey = project.findPhase(bundlePhaseRE);
        if (!bundlePhaseKey) {
          embLogger.error('Could not find bundle phase.');
          reject();
        }
        project.modifyPhase(bundlePhaseKey, exportSourcemapRNVariable, '');
        project.findAndRemovePhase('/EmbraceIO/run.sh');
        project.sync();
        resolve(project);
      })
      .catch((r) => {
        console.log('ERRR', r);
        reject(r);
      })
  );

export default () => {
  embLogger.log('Running iOS unlink script');
  return patchFiles(
    () =>
      unlinkObjectiveC(packageJson.name).catch(() =>
        unlinkSwift(packageJson.name)
      ),
    unpatchPodfile,
    unpatchXcode
  ).then(removeEmbraceInfoPlist);
};
