import { FileUpdatable } from '../../../util/file';
import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
  getAppDelegateByIOSLanguage,
} from '../../../util/ios';

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
