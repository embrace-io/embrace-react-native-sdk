import { FileUpdatable } from '../../../util/file';
import {
  addLineAfterToTextInFile,
  addLineBeforeToTextInFile,
  MAIN_CLASS_BY_LANGUAGE,
} from '../common';

export const SWIFT_APP_DELEGATE = 'AppDelegate.swift';

export const EMBRACE_IMPORT_SWIFT = 'import Embrace\n';

export const EMBRACE_INIT_SWIFT =
  'Embrace.sharedInstance().start(launchOptions: launchOptions, framework:.reactNative)';

const addImportToAppDelegate = (appDelegate: FileUpdatable) => {
  const searchText = '@UIApplicationMain';

  addLineBeforeToTextInFile(
    appDelegate,
    EMBRACE_IMPORT_SWIFT,
    searchText,
    MAIN_CLASS_BY_LANGUAGE.swift
  );
  return true;
};

const addStartToAppDelegate = (appDelegate: FileUpdatable) => {
  const DID_LAUNCH_REGEX = /func\s+application\(\s*_\s*[^}]*\{/;

  addLineAfterToTextInFile(
    appDelegate,
    `\n		${EMBRACE_IMPORT_SWIFT}`,
    DID_LAUNCH_REGEX,
    MAIN_CLASS_BY_LANGUAGE.swift
  );
  return true;
};

const patchAppDelegateSwift = async (appDelegate: FileUpdatable) => {
  try {
    const hasImportAdded = addImportToAppDelegate(appDelegate);
    const hasStartAdded = addStartToAppDelegate(appDelegate);
    if (hasStartAdded || hasImportAdded) {
      appDelegate.patch();
    }
    return true;
  } catch (e) {
    return false;
  }
};

export default patchAppDelegateSwift;
