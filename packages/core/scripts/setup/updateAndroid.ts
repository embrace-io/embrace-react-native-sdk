import Wizard from "../util/wizard";
import EmbraceLogger from "../../src/utils/EmbraceLogger";

import {patchBuildGradle} from "./android";

const logger = new EmbraceLogger(console);

logger.log("initializing update wizard");

const androidSteps = [patchBuildGradle];

const run = async () => {
  const wiz = new Wizard();
  [...androidSteps].map(step => wiz.registerStep(step));

  await wiz.runSteps();
};

export default run;
