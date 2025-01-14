import {FileUpdatable} from "../../util/file";
import EmbraceLogger from "../../../src/utils/EmbraceLogger";

// TODO refactor this
const logger = new EmbraceLogger(console);
export const JAVA_MAIN_ACTIVITY = "MainApplication.java";
export const KOTLIN_MAIN_ACTIVITY = "MainApplication.kt";
export const SWIFT_APP_DELEGATE = "AppDelegate.swift";
export const OBJECTIVEC_APP_DELEGATE = "AppDelegate.*(m|mm)";

/**
 * Adds a line to the specified file after the specified search text.
 *
 * This function will return true if the line was successfully added to the file.
 *
 * @param file The file where the new line will be added.
 * @param lineToAdd The line that will be added to the file.
 * @param searchText The text used to determine the location where the new line will be added.
 *                   The new line will be added after the first occurrence of this text.
 * @param fileName The name of the file, used only for logging purposes.
 * @return Returns true if the line was successfully added to the file, false if the line already exists.
 */
const addLineAfterToTextInFile = (
  file: FileUpdatable,
  lineToAdd: string,
  searchText: string | RegExp,
  fileName?: string,
): boolean => {
  if (file.hasLine(lineToAdd)) {
    logger.warn(`${fileName} already contains the line: ${lineToAdd}`);
    return false;
  } else {
    logger.warn(`Adding: ${lineToAdd} in ${fileName}`);
    file.addAfter(searchText, lineToAdd);
    return true;
  }
};

/**
 * Adds a line to the specified file after the specified search text.
 *
 * This function will return true if the line was successfully added to the file.
 *
 * @param file The file where the new line will be added.
 * @param lineToAdd The line that will be added to the file.
 * @param searchText The text used to determine the location where the new line will be added.
 *                   The new line will be added after the first occurrence of this text.
 * @param fileName The name of the file, used only for logging purposes.
 * @return Returns true if the line was successfully added to the file, false if the line already exists.
 */
const addLineBeforeToTextInFile = (
  file: FileUpdatable,
  lineToAdd: string,
  searchText: string | RegExp,
  fileName?: string,
): boolean => {
  if (file.hasLine(lineToAdd)) {
    logger.warn(`${fileName} already contains the line: ${lineToAdd}`);
    return false;
  } else {
    logger.warn(`Adding the line: ${lineToAdd} in ${fileName}`);
    file.addBefore(searchText, lineToAdd);
    return true;
  }
};

type ANDROID_LANGUAGE = "kotlin" | "java";
type IOS_LANGUAGE = "swift" | "objectivec" | "swift5x" | "objectivec5x";
type SUPPORTED_LANGUAGES = IOS_LANGUAGE | ANDROID_LANGUAGE;

const MAIN_CLASS_BY_LANGUAGE: Record<SUPPORTED_LANGUAGES, string> = {
  kotlin: KOTLIN_MAIN_ACTIVITY,
  java: JAVA_MAIN_ACTIVITY,
  objectivec: OBJECTIVEC_APP_DELEGATE,
  swift: SWIFT_APP_DELEGATE,
  swift5x: SWIFT_APP_DELEGATE,
  objectivec5x: OBJECTIVEC_APP_DELEGATE,
};

type ORDER = "after" | "before";
type BREAKINGLINE_ORDER = ORDER | "none" | "both";

type DynamicTextParameters = {
  bridgingHeader?: string;
};

type DynamicText = (params: DynamicTextParameters) => string[];
interface TextToAdd {
  searchText: string | RegExp;
  textToAdd: string | string[] | DynamicText;
  order: ORDER;
  breakingLine: BREAKINGLINE_ORDER;
}

type FindFileFunction = (
  language: SUPPORTED_LANGUAGES,
  projectName?: string,
) => FileUpdatable | undefined;

interface IPatchDefinition {
  fileName: string;
  textsToAdd: TextToAdd[];
  findFileFunction: FindFileFunction;
}

export {
  addLineAfterToTextInFile,
  addLineBeforeToTextInFile,
  MAIN_CLASS_BY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  ANDROID_LANGUAGE,
  IOS_LANGUAGE,
  TextToAdd,
  IPatchDefinition,
  BREAKINGLINE_ORDER,
};
export type {DynamicTextParameters};
