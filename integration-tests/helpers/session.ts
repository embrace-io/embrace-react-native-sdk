import {driver} from "@wdio/globals";

const SHOW_SESSION_ID_TEXT_BUTTON = "~SHOW SESSION ID";
const PREFIX_TEXT_FROM_ALERT_SHOW_SESSION_ID = "Session Id: ";

const getCurrentSessionId = async () => {
  // Since ios takes more than 200 ms to load after the start sdk method is being called
  // we will wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  const getSessionIdButton = await driver.$(SHOW_SESSION_ID_TEXT_BUTTON);
  await getSessionIdButton.click();

  const sessionId = await getTextFromAlert(
    PREFIX_TEXT_FROM_ALERT_SHOW_SESSION_ID,
  );

  await driver.acceptAlert();
  return sessionId;
};

const getTextFromAlert = async (replaceString = ""): Promise<string> => {
  await driver.waitUntil(
    async () => {
      const alertIsPresent = await driver.getAlertText().catch(() => false);
      return alertIsPresent !== false;
    },
    {timeout: 5000},
  );

  const alertText = await driver.getAlertText();
  return alertText.replace(replaceString, "");
};

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
  return false;
};

export {getCurrentSessionId, endSession, backgroundSessionsEnabled};
