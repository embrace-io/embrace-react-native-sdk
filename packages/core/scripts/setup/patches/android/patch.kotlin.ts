// TODO refactor this

import { mainApplicationPatchable } from '../../../util/android';
import { FileUpdatable } from '../../../util/file';
import { addLineAfterToTextInFile, KOTLIN_MAIN_ACTIVITY } from '../common';

export const EMBRACE_IMPORT_KOTLIN =
  'import io.embrace.android.embracesdk.Embrace';

export const EMBRACE_INIT_KOTLIN =
  'Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE)';

/**
 * This function will return true if something was added to the file
 *  @return boolean
 */
const patchKotlinImport = (file: FileUpdatable) => {
  const searchText = 'import android.app.Application';

  return addLineAfterToTextInFile(
    file,
    `\n${EMBRACE_IMPORT_KOTLIN}`,
    searchText,
    KOTLIN_MAIN_ACTIVITY
  );
};

/**
 * This function will return true if something was added to the file
 *  @return boolean
 */
const patchKotlinStartEmbrace = (file: FileUpdatable) => {
  const searchText = 'super.onCreate()';

  return addLineAfterToTextInFile(
    file,
    `\n${EMBRACE_INIT_KOTLIN}`,
    searchText,
    KOTLIN_MAIN_ACTIVITY
  );
};

const patchKotlinMainApplication = async () => {
  try {
    const file = await mainApplicationPatchable('kotlin');

    const hasImportAdded = patchKotlinImport(file);
    const hasStartAdded = patchKotlinStartEmbrace(file);
    if (hasStartAdded || hasImportAdded) {
      file.patch();
    }
    return true;
  } catch (e) {
    return false;
  }
};

export default patchKotlinMainApplication;
