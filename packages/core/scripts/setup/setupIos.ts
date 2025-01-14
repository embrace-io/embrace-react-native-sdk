import Wizard from "../util/wizard";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {
  addUploadBuildPhase,
  addEmbraceInitializerSwift,
  iosInitializeEmbrace,
  iosPodfile,
  patchXcodeBundlePhase,
} from "./ios";
import {apiToken, iosAppID, packageJSON} from "./common";

const logger = new EmbraceLogger(console);

logger.log("initializing setup wizard for ios");

const iosSteps = [
  addEmbraceInitializerSwift,
  iosInitializeEmbrace,
  iosPodfile,
  patchXcodeBundlePhase,
  addUploadBuildPhase,
];

const run = () => {
  const wiz = new Wizard();
  [iosAppID, apiToken, packageJSON].map(field => wiz.registerField(field));
  [...iosSteps].map(step => wiz.registerStep(step));
  wiz.runSteps();
};

export default run;
