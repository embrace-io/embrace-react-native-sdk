import EmbraceLogger from '../../src/logger';
import { NoopFile, patchFiles } from '../util/file';
import {
  appDelegatePatchable,
  bundlePhaseExtraArgs,
  bundlePhaseRE,
  embraceImport,
  embraceNativePod,
  podfilePatchable,
  xcodePatchable,
} from '../util/ios';

const packageJson = require('../../../../../package.json');

const embLogger = new EmbraceLogger(console);

const embraceRNRE =
  /\[\[Embrace sharedInstance] startWithKey:@"[a-zA-Z0-9]*" launchOptions:launchOptions framework:EMBAppFrameworkReactNative];/;

export default () => {
  embLogger.log('Running iOS postunlink script');
  return patchFiles(
    () =>
      appDelegatePatchable(packageJson).then((appDelegate) => {
        appDelegate.deleteLine(embraceImport);
        appDelegate.deleteLine(embraceRNRE);
        return appDelegate;
      }),
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
  );
};
