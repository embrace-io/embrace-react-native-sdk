import { FileUpdatable } from '../../../util/file';
import { getAppDelegateByIOSLanguage } from '../../../util/ios';
import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
} from './ios.objectivec';

const unlinkObjectiveC = (projectName: string): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const appDelegate = getAppDelegateByIOSLanguage(projectName, 'objectivec');

    if (!appDelegate) {
      reject();
      return;
    }
    appDelegate.deleteLine(EMBRACE_IMPORT_OBJECTIVEC);
    appDelegate.deleteLine(EMBRACE_INIT_OBJECTIVEC);
    resolve(appDelegate);
  });
};

export { unlinkObjectiveC };
