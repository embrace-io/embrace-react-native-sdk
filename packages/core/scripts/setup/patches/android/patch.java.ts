// TODO refactor this

import { mainApplicationPatchable } from '../../../util/android';
import { FileUpdatable } from '../../../util/file';
import { addLineAfterToTextInFile, JAVA_MAIN_ACTIVITY } from '../common';

export const EMBRACE_IMPORT_JAVA =
  'import io.embrace.android.embracesdk.Embrace;';

export const EMBRACE_INIT_JAVA =
  'Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE);';

/**
 * This function will return true if something was added to the file
 *  @return boolean
 */

const patchJavaImport = (file: FileUpdatable) => {
  const searchText = 'import android.app.Application;';
  return addLineAfterToTextInFile(
    file,
    `\n${EMBRACE_IMPORT_JAVA}`,
    searchText,
    JAVA_MAIN_ACTIVITY
  );
};

/**
 * This function will return true if something was added to the file
 *  @return boolean
 */
const patchJavaStartEmbrace = (file: FileUpdatable) => {
  const searchText = 'super.onCreate();';
  return addLineAfterToTextInFile(
    file,
    `\n${EMBRACE_INIT_JAVA}`,
    searchText,
    JAVA_MAIN_ACTIVITY
  );
};

const patchJavaMainApplication = async () => {
  try {
    const file = await mainApplicationPatchable('java');
    const hasImportAdded = patchJavaImport(file);
    const hasStartAdded = patchJavaStartEmbrace(file);
    if (hasStartAdded || hasImportAdded) {
      file.patch();
    }
    return true;
  } catch (e) {
    return false;
  }
};

export default patchJavaMainApplication;
