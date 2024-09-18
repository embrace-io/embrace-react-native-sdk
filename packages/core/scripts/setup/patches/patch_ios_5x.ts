// The patches in this file are kept around for now to ease upgrading from iOS 5.x so that clients can use the uninstall
// script to remove the old way of setting up the iOS SDK. Should eventually remove once enough people have upgraded

import {getAppDelegateByIOSLanguage} from "../../util/ios";
import EmbraceLogger from "../../../src/logger";

import {
  IOS_LANGUAGE,
  MAIN_CLASS_BY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  IPatchDefinition,
} from "./common";

const logger = new EmbraceLogger(console);

export const EMBRACE_IMPORT_OBJECTIVEC_5X = "#import <Embrace/Embrace.h>";
export const EMBRACE_INIT_OBJECTIVEC_5X =
  "[[Embrace sharedInstance] startWithLaunchOptions:launchOptions framework:EMBAppFrameworkReactNative];";

export const EMBRACE_IMPORT_SWIFT_5X = "import Embrace";
export const EMBRACE_INIT_SWIFT_5X =
  "Embrace.sharedInstance().start(launchOptions: launchOptions, framework:.reactNative)";

export const PATCH_IOS_SWIFT_APPDELEGATE_5X: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.swift,
  textsToAdd: [
    {
      searchText: "@UIApplicationMain",
      textToAdd: EMBRACE_IMPORT_SWIFT_5X,
      order: "before",
      breakingLine: "after",
    },
    {
      searchText: /func\s+application\(\s*_\s*[^}]*\{/,
      textToAdd: EMBRACE_INIT_SWIFT_5X,
      order: "after",
      breakingLine: "before",
    },
  ],
  findFileFunction: (language: SUPPORTED_LANGUAGES, projectName?: string) => {
    if (!projectName) {
      logger.warn("The project name is required");
      return undefined;
    }
    return getAppDelegateByIOSLanguage(projectName, language as IOS_LANGUAGE);
  },
};

export const PATCH_IOS_OBJECTIVEC_APPDELEGATE_5X: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.objectivec,
  textsToAdd: [
    {
      searchText: '#import "AppDelegate.h"',
      textToAdd: EMBRACE_IMPORT_OBJECTIVEC_5X,
      order: "after",
      breakingLine: "before",
    },
    {
      searchText:
        /(-\s*\(BOOL\)\s*application:\s*\(UIApplication\s\*\)\s*(app|application)\s+didFinishLaunchingWithOptions:\s*\(NSDictionary\s*\*\)launchOptions\s*\{\s*)/,
      textToAdd: EMBRACE_INIT_OBJECTIVEC_5X,
      order: "after",
      breakingLine: "after",
    },
  ],
  findFileFunction: (language: SUPPORTED_LANGUAGES, projectName?: string) => {
    if (!projectName) {
      logger.warn("The project name is required");
      return undefined;
    }
    return getAppDelegateByIOSLanguage(projectName, language as IOS_LANGUAGE);
  },
};
