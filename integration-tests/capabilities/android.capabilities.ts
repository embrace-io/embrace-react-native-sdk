import {AndroidCapability} from "./capability";

const android13: AndroidCapability = {
  platformName: "android",
  "appium:deviceName": "Android GoogleAPI Emulator",
  "appium:platformVersion": "14.0",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "io.embrace.basictestapp",
  "appium:appActivity": ".MainActivity",
  "appium:autoDismissAlerts": true,
  "appium:uiautomator2ServerLaunchTimeout": 60_000,
  "appium:noReset": true,
  maxInstances: 1,
};

export {android13};
