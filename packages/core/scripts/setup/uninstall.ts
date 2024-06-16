// import { mainApplicationPatchable } from "../util/android";
// import { FileUpdatable } from "../util/file";
// import Wizard, { Step } from "../util/wizard";
// import {
//   EMBRACE_IMPORT_JAVA,
//   EMBRACE_INIT_JAVA,
// } from "./patches/android/patch.java";
// import {
//   ANDROID_LANGUAGE,
//   IOS_LANGUAGE,
//   SUPPORTED_LANGUAGES,
//   addLineAfterToTextInFile,
// } from "./patches/common";

// type UNINSTALL_ACTION = (
//   language: ANDROID_LANGUAGE | IOS_LANGUAGE
// ) => Promise<FileUpdatable>;

// type ACTION_ON_LINE = "patch" | "uninstall";

// interface ILinesAction {
//   toSearch: string;
//   toAdd?: string;
//   toRemove?: string;
// }

// interface IUnlinkSteps {
//   [key: string]: IStep;
// }

// interface IStep {
//   action: UNINSTALL_ACTION;
//   actionType: ACTION_ON_LINE;
//   language: SUPPORTED_LANGUAGES;
//   lines: ILinesAction[];
// }

// const java: IStep = {
//   action: mainApplicationPatchable,
//   actionType: "uninstall",
//   language: "java",
//   lines: [
//     { toSearch: `${EMBRACE_IMPORT_JAVA}\n`, toAdd: `\n${EMBRACE_IMPORT_JAVA}` },
//     { toSearch: `\n${EMBRACE_INIT_JAVA}`, toAdd: `${EMBRACE_INIT_JAVA}\n` },
//   ],
// };

// const STEPS_MAP: IUnlinkSteps = {
//   java,
// };

// const stepsToDo: Step[] = Object.keys(STEPS_MAP).map((key) => {
//   const { action, actionType, language, lines } = STEPS_MAP[key];

//   const actionToReturn = async () => {
//     const file = await action(language);
//     lines.forEach((actionLine) => {});
// 		await setTimeout(16000)
//   };

//   return {
//     name: `${actionType}: ${language}`,
//     run: (wizard: Wizard): Promise<any> => {
//       return actionToReturn();
//     },
//   } as Step;
// });

// const run = () => {
//   const wiz = new Wizard();
//   [...stepsToDo].map((step) => wiz.registerStep(step));
//   wiz.runSteps();
// };
// export default run
