import {driver} from "@wdio/globals";

const endSession = async () => {
  const endSession = await driver.$("~END SESSION");

  // Cannot manually end session while session is <5s long so give a bit of a delay
  console.log("waiting a few seconds before ending the session")
  await new Promise(r => setTimeout(r, 8000));

  console.log("ending session")
  await endSession.click();
}

export {endSession};
