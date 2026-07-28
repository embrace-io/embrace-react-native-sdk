import {driver} from "@wdio/globals";

// Tap an element by its accessibility label, optionally settling afterwards. The wait matters
// where the tap starts work the app has to finish before the next step: a screen transition, or
// a bridge call that would otherwise race the session flush.
const tap = async (label: string, waitMs = 0) => {
  await driver.$(`~${label}`).click();

  if (waitMs > 0) {
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }
};

// End the current session by backgrounding the app.
// The SDK flushes the session payload on background
const endSession = async () => {
  await driver.execute("mobile: backgroundApp", {seconds: 5});
};

export {tap, endSession};
