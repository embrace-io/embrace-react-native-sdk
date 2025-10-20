import Wizard from "../util/wizard";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {
  addUploadBuildPhase,
  addEmbraceInitializerSwift,
  iosInitializeEmbrace,
  iOSPodfilePatch,
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
  iOSPodfilePatch,
  patchXcodeBundlePhase,
  addUploadBuildPhase,
];

const logger = new EmbraceLogger(console);
logger.log("Initializing Setup Wizard for iOS");

const run = () => {
  const wizard = new Wizard();

  IOS_REGISTER_FIELDS.forEach(field => wizard.registerField(field));
  IOS_STEPS.forEach(step => wizard.registerStep(step));

  wizard.runSteps();
};

export default run;
