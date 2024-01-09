import EmbraceLogger from "../../src/logger";
import iosStep from "./ios";

const postUnlinkSteps = [iosStep];

const embLogger = new EmbraceLogger(console);

Promise.all(postUnlinkSteps.map((step) => step()))
  .then(() => embLogger.log("Successfully patched files"))
  .catch((err) => embLogger.error(err));
