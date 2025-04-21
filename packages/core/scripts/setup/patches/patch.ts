import {
  EMBRACE_IMPORT_OBJECTIVEC,
  EMBRACE_INIT_OBJECTIVEC,
  getAppDelegateByIOSLanguage,
} from "../../util/ios";
import {getMainApplicationPatchable} from "../../util/android";
import EmbraceLogger from "../../../src/utils/EmbraceLogger";

import {
  PATCH_IOS_OBJECTIVEC_APPDELEGATE_5X,
  PATCH_IOS_SWIFT_APPDELEGATE_5X,
} from "./patch_ios_5x";
import {
  addLineAfterToTextInFile,
  addLineBeforeToTextInFile,
  ANDROID_LANGUAGE,
  BREAKINGLINE_ORDER,
  DynamicTextParameters,
  IOS_LANGUAGE,
  IPatchDefinition,
  MAIN_CLASS_BY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  TextToAdd,
} from "./common";

export const EMBRACE_INIT_SWIFT = "EmbraceInitializer.start()";

export const EMBRACE_IMPORT_JAVA =
  "import io.embrace.android.embracesdk.Embrace;";

export const EMBRACE_INIT_JAVA = "Embrace.getInstance().start(this);";

export const EMBRACE_IMPORT_KOTLIN =
  "import io.embrace.android.embracesdk.Embrace";

export const EMBRACE_INIT_KOTLIN = "Embrace.getInstance().start(this)";

const logger = new EmbraceLogger(console);

const PATCH_IOS_SWIFT_APPDELEGATE: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.swift,
  textsToAdd: [
    {
      searchText: /func\s+application\(\s*_\s*[^}]*\{/,
      textToAdd: EMBRACE_INIT_SWIFT,
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
const PATCH_IOS_OBJECTIVEC_APPDELEGATE: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.objectivec,
  textsToAdd: [
    {
      searchText: '#import "AppDelegate.h"',
      textToAdd: EMBRACE_IMPORT_OBJECTIVEC,
      order: "after",
      breakingLine: "before",
    },
    {
      searchText:
        /(-\s*\(BOOL\)\s*application:\s*\(UIApplication\s\*\)\s*(app|application)\s+didFinishLaunchingWithOptions:\s*\(NSDictionary\s*\*\)launchOptions\s*\{\s*)/,
      textToAdd: EMBRACE_INIT_OBJECTIVEC,
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

const PATCH_ANDROID_KOTLIN_MAIN_ACTIVITTY: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.kotlin,
  textsToAdd: [
    {
      searchText: "import android.app.Application",
      textToAdd: `${EMBRACE_IMPORT_KOTLIN}`,
      order: "after",
      breakingLine: "before",
    },
    {
      searchText: "super.onCreate()",
      textToAdd: `${EMBRACE_INIT_KOTLIN}`,
      order: "after",
      breakingLine: "before",
    },
  ],
  findFileFunction: (language: SUPPORTED_LANGUAGES) =>
    getMainApplicationPatchable(language as ANDROID_LANGUAGE),
};
const PATCH_ANDROID_JAVA_MAIN_ACTIVITTY: IPatchDefinition = {
  fileName: MAIN_CLASS_BY_LANGUAGE.java,
  textsToAdd: [
    {
      searchText: "import android.app.Application;",
      textToAdd: EMBRACE_IMPORT_JAVA,
      order: "after",
      breakingLine: "before",
    },
    {
      searchText: "super.onCreate();",
      textToAdd: EMBRACE_INIT_JAVA,
      order: "after",
      breakingLine: "before",
    },
  ],
  findFileFunction: (language: SUPPORTED_LANGUAGES) =>
    getMainApplicationPatchable(language as ANDROID_LANGUAGE),
};

type SupportedPatches = {
  [key in SUPPORTED_LANGUAGES]: IPatchDefinition | undefined;
};

export const SUPPORTED_PATCHES: SupportedPatches = {
  objectivec: PATCH_IOS_OBJECTIVEC_APPDELEGATE,
  swift: PATCH_IOS_SWIFT_APPDELEGATE,
  java: PATCH_ANDROID_JAVA_MAIN_ACTIVITTY,
  kotlin: PATCH_ANDROID_KOTLIN_MAIN_ACTIVITTY,
  swift5x: undefined,
  objectivec5x: undefined,
};

export const SUPPORTED_REMOVALS = {
  ...SUPPORTED_PATCHES,
  ...{
    swift5x: PATCH_IOS_SWIFT_APPDELEGATE_5X,
    objectivec5x: PATCH_IOS_OBJECTIVEC_APPDELEGATE_5X,
  },
};

export const getText = (
  item: TextToAdd,
  dynamicTextParams?: DynamicTextParameters,
): string | string[] =>
  typeof item.textToAdd === "function"
    ? item.textToAdd(dynamicTextParams || {})
    : item.textToAdd;

export const getTextToAddWithBreakingLine = (
  textToAdd: string | string[],
  breakingLine: BREAKINGLINE_ORDER,
  padding: string = "",
) => {
  if (Array.isArray(textToAdd)) {
    textToAdd = textToAdd.join(`\n${padding}`);
  }

  if (breakingLine === "both") {
    return `\n${padding}${textToAdd}\n${padding}`;
  }
  if (breakingLine === "before") {
    return `\n${padding}${textToAdd}`;
  }
  if (breakingLine === "after") {
    return `${textToAdd}\n${padding}`;
  }
  return textToAdd;
};

const patch = (
  language: SUPPORTED_LANGUAGES,
  projectName?: string,
  dynamicTextParams?: DynamicTextParameters,
) => {
  const patchDefinition = SUPPORTED_PATCHES[language];

  if (patchDefinition === undefined) {
    return logger.warn("This language is not supported");
  }
  const {fileName, textsToAdd, findFileFunction} = patchDefinition;

  const file = findFileFunction(language, projectName);

  if (!file) {
    return logger.warn("The file to be patched not found");
  }

  const result = textsToAdd.map(item => {
    const {order, searchText, breakingLine} = item;

    let padding = "";
    // If its a regex we take the spaces from the next breaking line to the next line
    if (searchText instanceof RegExp) {
      padding = file
        .getPaddingAfterStringToTheNextString(searchText)
        ?.replace(searchText, "");
    } else {
      padding = file.getPaddingFromString(searchText)?.replace(searchText, "");
    }

    const finalTextToAdd = getTextToAddWithBreakingLine(
      getText(item, dynamicTextParams || {}),
      breakingLine,
      padding,
    );

    if (order === "after") {
      return addLineAfterToTextInFile(
        file,
        finalTextToAdd,
        searchText,
        fileName,
      );
    }
    if (order === "before") {
      return addLineBeforeToTextInFile(
        file,
        finalTextToAdd,
        searchText,
        fileName,
      );
    }
  });
  const hasToPatch = result.some(item => item);
  if (hasToPatch) {
    file.patch();
  }
  return hasToPatch;
};

export default patch;
