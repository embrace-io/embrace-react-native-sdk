import EmbraceLogger from "../../src/logger";
import Wizard from "../util/wizard";
import {
  createEmbraceJSON,
  patchAppBuildGradle,
  patchBuildGradle,
  patchMainApplication,
} from "./android";
import { apiToken, packageJSON } from "./common";

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
  [apiToken, packageJSON].map((field) => wiz.registerField(field));
  [...androidSteps].map((step) => wiz.registerStep(step));
  wiz.runSteps();
};

export default run;
