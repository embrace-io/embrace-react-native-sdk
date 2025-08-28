import Wizard from "../util/wizard";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {
  addUploadBuildPhase,
  addEmbraceInitializerSwift,
  iosInitializeEmbrace,
  iosPodfile,
  patchXcodeBundlePhase,
} from "./ios";
import {apiToken, iosAppID, iosProjectFolderName, packageJSON} from "./common";

const IOS_REGISTER_FIELDS = [
  iosAppID,
  apiToken,
  iosProjectFolderName,
  packageJSON,
];

const IOS_STEPS = [
  addEmbraceInitializerSwift,
  iosInitializeEmbrace,
  iosPodfile,
  patchXcodeBundlePhase,
  addUploadBuildPhase,
];

const logger = new EmbraceLogger(console);
logger.log("Initializing Setup Wizard for iOS");

const run = () => {
  const wiz = new Wizard();

  IOS_REGISTER_FIELDS.map(field => wiz.registerField(field));
  IOS_STEPS.map(step => wiz.registerStep(step));

  wiz.runSteps();
};

export default run;
