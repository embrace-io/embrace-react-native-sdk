import Wizard from "../util/wizard";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {androidAppID, apiToken, packageJSON} from "./common";
import {
  createEmbraceJSON,
  patchAppBuildGradle,
  patchBuildGradle,
  patchMainApplication,
} from "./android";

const logger = new EmbraceLogger(console);

logger.log("initializing setup wizard for android");

const androidSteps = [
  patchBuildGradle,
  patchAppBuildGradle,
  createEmbraceJSON,
  patchMainApplication,
];

const run = () => {
  const wiz = new Wizard();
  [androidAppID, apiToken, packageJSON].map(field => wiz.registerField(field));
  [...androidSteps].map(step => wiz.registerStep(step));
  wiz.runSteps();
};

export default run;
