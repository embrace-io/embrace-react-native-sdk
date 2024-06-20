// const fs = require("fs");
// import EmbraceLogger from "../../src/logger";
// import {
//   androidEmbraceSwazzler,
//   androidEmbraceSwazzlerPluginRE,
// } from "../setup/android";
// import removeEmbraceImportAndStartFromFile from "../setup/uninstall";
// import {
//   buildAppGradlePatchable,
//   buildGradlePatchable,
//   embraceJSON,
// } from "../util/android";

// import { FileUpdatable, patchFiles } from "../util/file";

// const embLogger = new EmbraceLogger(console);

// export const unlinkSwazzlerImport = (): Promise<FileUpdatable> => {
//   return new Promise((resolve, reject) =>
//     buildGradlePatchable()
//       .then((file) => {
//         file.deleteLine(androidEmbraceSwazzler);
//         resolve(file);
//       })
//       .catch(reject)
//   );
// };

// export const unlinkSwazzlerApply = (): Promise<FileUpdatable> => {
//   return new Promise((resolve, reject) =>
//     buildAppGradlePatchable()
//       .then((file) => {
//         file.deleteLine(androidEmbraceSwazzlerPluginRE);
//         resolve(file);
//       })
//       .catch(reject)
//   );
// };

// export const removeEmbraceConfigFile = (): Promise<boolean> =>
//   new Promise((resolve, reject) =>
//     embraceJSON()
//       .then((file) => {
//         fs.unlinkSync(file.path);
//         resolve(true);
//       })
//       .catch(() => reject(false))
//   );

// export default () => {
//   embLogger.log("Running android unlink script");
//   return patchFiles(
//     () =>
//       removeEmbraceImportAndStartFromFile("java") ||
//       removeEmbraceImportAndStartFromFile("kotlin"),
//     unlinkSwazzlerImport,
//     unlinkSwazzlerApply
//   ).then(removeEmbraceConfigFile);
// };
