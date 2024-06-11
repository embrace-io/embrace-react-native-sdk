import { mainApplicationPatchable } from '../../../util/android';
import { FileUpdatable } from '../../../util/file';
import { EMBRACE_IMPORT_JAVA, EMBRACE_INIT_JAVA } from './patch.java';

const unlinkJava = (): Promise<FileUpdatable> => {
  return new Promise(async (resolve, reject) => {
    const mainApplication = await mainApplicationPatchable('java').catch(
      reject
    );

    if (!mainApplication) {
      reject(undefined);
      return;
    }
    mainApplication.deleteLine(`${EMBRACE_IMPORT_JAVA}\n`);
    mainApplication.deleteLine(`${EMBRACE_INIT_JAVA}\n`);
    resolve(mainApplication);
  });
};

export { unlinkJava };
