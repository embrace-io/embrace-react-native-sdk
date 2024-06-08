import { FileUpdatable } from '../../../util/file';
import { addLineAfterToTextInFile, MAIN_CLASS_BY_LANGUAGE } from '../common';

export const OBJECTIVEC_APP_DELEGATE = 'AppDelegate.*(m|mm)';

export const EMBRACE_IMPORT_OBJECTIVEC = `
#import <Embrace/Embrace.h>
`;
export const EMBRACE_INIT_OBJECTIVEC =
  '[[Embrace sharedInstance] startWithLaunchOptions:launchOptions framework:EMBAppFrameworkReactNative];';

const addImportToAppDelegate = (appDelegate: FileUpdatable) => {
  const searchText = '#import "AppDelegate.h"';

  addLineAfterToTextInFile(
    appDelegate,
    EMBRACE_IMPORT_OBJECTIVEC,
    searchText,
    MAIN_CLASS_BY_LANGUAGE.objectivec
  );
  return true;
};

const addStartToAppDelegate = (appDelegate: FileUpdatable) => {
  const DID_LAUNCH_REGEX =
    /(-\s*\(BOOL\)\s*application:\s*\(UIApplication\s\*\)\s*(app|application)\s+didFinishLaunchingWithOptions:\s*\(NSDictionary\s*\*\)launchOptions\s*\{\s*)/;

  addLineAfterToTextInFile(
    appDelegate,
    EMBRACE_INIT_OBJECTIVEC,
    DID_LAUNCH_REGEX,
    MAIN_CLASS_BY_LANGUAGE.objectivec
  );
  return true;
};

const patchAppDelegateObjectiveC = async (appDelegate: FileUpdatable) => {
  try {
    const hasImportAdded = addImportToAppDelegate(appDelegate);
    const hasStartAdded = addStartToAppDelegate(appDelegate);
    if (hasStartAdded || hasImportAdded) {
      appDelegate.patch();
      return true;
    }
  } catch (e) {
    return false;
  }
};

export default patchAppDelegateObjectiveC;
