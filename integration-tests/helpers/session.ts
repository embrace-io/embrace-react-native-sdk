const getCurrentSessionId = async driver => {
  // Since ios takes more than 200 ms to load after the start sdk method is being called
  // we will wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  await driver.waitUntil(
    async () => {
      const alertIsPresent = await driver.getAlertText().catch(() => false);
      return alertIsPresent !== false;
    },
    {timeout: 5000},
  );

  const alertText = await driver.getAlertText();
  const sessionId = alertText.replace("Session Id: ", "");
  await driver.acceptAlert();
  return sessionId;
};
const getLastSessionEndState = async driver => {
  const lastSessionEndStateText = (
    await driver.$("~LAST_SESSION_EXIT")
  ).getText();

  const lastSessionEndState = await lastSessionEndStateText;

  return lastSessionEndState.replace("LAST_SESSION_EXIT:", "");
};

export {getCurrentSessionId, getLastSessionEndState};
