import {CLIOptions} from "../wdio.conf";
import {firstAvailableDevice} from "./ios";

interface CapabilitiyBase {
  platformName: string;
  "appium:deviceName"?: string;
  "appium:platformVersion": string;
  "appium:automationName": string;
  maxInstances: number;
  "appium:autoDismissAlerts": boolean;
  "appium:noReset": boolean;
}

interface AndroidCapability extends CapabilitiyBase {
  "appium:appPackage": string;
  "appium:appActivity": string;
  "appium:uiautomator2ServerLaunchTimeout": number;
}

interface IOSCapability extends CapabilitiyBase {
  "appium:bundleId": string;
  "appium:udid": string;
}

type CapabilityArray = Array<AndroidCapability | IOSCapability>;

const getCapabilities = (options: CLIOptions) => {
  const capabilities: CapabilityArray = [];

  // if (options.platform === "android" || options.platform === "both") {
  //   capabilities.push({
  //     // capabilities for local Appium web tests on an Android Emulator
  //     platformName: "Android",
  //     "appium:deviceName": "Android GoogleAPI Emulator",
  //     "appium:platformVersion": "14.0",
  //     "appium:automationName": "UiAutomator2",
  //     "appium:appPackage": options.package,
  //     "appium:appActivity": ".MainActivity",
  //     "appium:autoDismissAlerts": true,
  //     "appium:uiautomator2ServerLaunchTimeout": 60_000,
  //     "appium:noReset": true,
  //     maxInstances: 1,

  //     //  TODO: for CI/CD we probably want to point to the prebuilt release
  //     //  APK rather than having to have the app running in an emulator beforehand, e.g.
  //     //  "appium:app": "./basic-test-app/android/app/build/outputs/apk/debug/app-debug.apk",
  //   });
  // }

  if (options.platform === "ios" || options.platform === "both") {
    capabilities.push({
      platformName: "iOS",
      "appium:automationName": "XCUITest",
      "appium:udid": firstAvailableDevice(), // TODO will need to change for CI/CD
      "appium:bundleId": options.package,
      "appium:noReset": true,
      "appium:platformVersion": "18.0",
      "appium:autoDismissAlerts": true,
      maxInstances: 1,
    });
  }
  return capabilities;
};

export {getCapabilities};
