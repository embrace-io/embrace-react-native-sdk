import {driver} from "@wdio/globals";

// End the current session by backgrounding the app. 
// The SDK flushes the session payload on background
const endSession = async () => {
  await driver.execute("mobile: backgroundApp", {seconds: 5});
};

export {endSession};
