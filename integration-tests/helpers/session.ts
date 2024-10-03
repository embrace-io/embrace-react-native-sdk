const getCurrentSessionId = async driver => {
  // Since ios takes more than 200 ms to load after the start sdk method is being called
  // we will wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  const getSessionIdButton = await driver.$("~SHOW SESSION ID");
  await getSessionIdButton.click();

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
  // Since ios takes more than 200 ms to load after the start sdk method is being called
  // we will wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  const getLastSessionEndStateButton = await driver.$(
    "~SHOW LAST SESSION EXIT STATE",
  );
  await getLastSessionEndStateButton.click();

  const alertText = await getTextFromAlert(driver);

  const sessionId = alertText.replace("Last Exit State: ", "");
  await driver.acceptAlert();
  return sessionId;
};

const getTextFromAlert = async (driver): Promise<string> => {
  await driver.waitUntil(
    async () => {
      const alertIsPresent = await driver.getAlertText().catch(() => false);
      return alertIsPresent !== false;
    },
    {timeout: 5000},
  );

  return await driver.getAlertText();
};

export {getCurrentSessionId, getLastSessionEndState};
