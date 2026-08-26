import {driver} from "@wdio/globals";

// Tap an element by its accessibility label, optionally settling afterwards. The wait matters
// where the tap starts work the app has to finish before the next step: a screen transition, or
// a bridge call that would otherwise race the session flush.
const tap = async (label: string, waitMs = 0) => {
  const element = driver.$(`~${label}`);
  await element.waitForDisplayed();
  await element.click();

  if (waitMs > 0) {
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }
};

// End the current session by backgrounding the app (the SDK flushes the session payload on background).
// Backgrounding also foregrounds the app again and begins a new session, so we add a short delay 
// before handing control back to the spec to avoid races.
const endSession = async () => {
  await driver.background(5);
  await new Promise(resolve => setTimeout(resolve, 250));
};

// The app under test's package (Android) / bundle (iOS) id, e.g. "io.embrace.rn82".
const appId = (): string => {
  // local runs set it in the session caps, CI runs set the BROWSERSTACK_APP_NAME environment
  // variable to the fixture name and build-test-app.sh names every app io.embrace.<fixture>
  const caps = driver.requestedCapabilities as Record<string, string | undefined>;
  const fromCaps = caps["appium:appPackage"] ?? caps["appium:bundleId"];
  const fixture = process.env.BROWSERSTACK_APP_NAME;
  return fromCaps || (fixture ? `io.embrace.${fixture}` : "");
};

// Android sometimes puts up a system "<package> keeps stopping" dialog after a crash — whether it
// appears depends on the device's recent crash history, so it is intermittent. It is owned by the
// system, not the app, and sits above the relaunched app where it would swallow the next tap.
// Matched on the AOSP resource id because the button text ("Close app") is localised.
const dismissCrashDialog = async () => {
  if (!driver.isAndroid) {
    return;
  }
  const close = driver.$('android=new UiSelector().resourceId("android:id/aerr_close")');
  if (await close.isExisting()) {
    await close.click();
  }
};

// Cold start the app after a crash has killed it — crash reports are held on disk and only
// delivered at the next startup, so this is what puts a crash payload on the server. Expects the
// app to be gone: activating one that is still in the foreground does nothing.
const relaunchAppAfterCrash = async () => {
  await dismissCrashDialog();
  await driver.activateApp(appId());
  await new Promise(resolve => setTimeout(resolve, 5000));
};

// Every expo fixture is named for it, e.g. "io.embrace.expo51" — the same substring match
// build-test-app.sh uses to pick the expo path.
const isExpo = (): boolean => appId().includes("expo");

export {tap, endSession, relaunchAppAfterCrash, isExpo};
