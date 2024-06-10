import { FileUpdatable } from '../../../util/file';
import { getAppDelegateByIOSLanguage } from '../../../util/ios';
import { EMBRACE_IMPORT_SWIFT, EMBRACE_INIT_SWIFT } from './ios.swift';

const unlinkSwift = (projectName: string): Promise<FileUpdatable> => {
  return new Promise((resolve, reject) => {
    const appDelegate = getAppDelegateByIOSLanguage(projectName, 'swift');

    if (!appDelegate) {
      reject();
      return;
    }
    appDelegate.deleteLine(`${EMBRACE_IMPORT_SWIFT}\n`);
    appDelegate.deleteLine(`${EMBRACE_INIT_SWIFT}\n`);
    resolve(appDelegate);
  });
};

export { unlinkSwift };
