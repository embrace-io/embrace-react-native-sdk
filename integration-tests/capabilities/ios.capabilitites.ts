import {IOSCapability} from "./capability";

const iphone16Pro: IOSCapability = {
  platformName: "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 16 Pro",
  "appium:bundleId": "io.embrace.basictestapp",
  "appium:noReset": true,
  "appium:platformVersion": "18.0",
  "appium:autoDismissAlerts": true,
  maxInstances: 1,
};

export {iphone16Pro};
