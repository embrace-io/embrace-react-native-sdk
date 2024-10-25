interface CapabilitiyBase {
  platformName: string;
  "appium:deviceName": string;
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

export {CapabilitiyBase, AndroidCapability, IOSCapability};
