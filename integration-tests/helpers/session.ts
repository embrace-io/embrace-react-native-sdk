import {driver} from "@wdio/globals";

const endSession = async (manual = false) => {
  //  2 options for ending the session, not sure which is better either manually by clicking the End Session button
  //  and triggering the call on the Embrace SDK, or by putting the app into the background for a few seconds
  if (manual) {
    const endSession = await driver.$("~END SESSION");
    // Cannot manually end session while session is <5s long so give a bit of a delay
    console.log("waiting a few seconds before ending the session manually");
    await new Promise(r => setTimeout(r, 8000));
    console.log("ending session manually");
    await endSession.click();
  } else {
    console.log("going into the background for a few seconds");
    await driver.execute("mobile: backgroundApp", {seconds: 5});
    console.log("back to foreground");
  }
};

const backgroundSessionsEnabled = () => {
  // iOS and Android appear to have different default behaviour for recording background sessions
  if (driver.isIOS) {
    return true;
  } else if (driver.isAndroid) {
    return false;
  }
};

export {endSession, backgroundSessionsEnabled};
