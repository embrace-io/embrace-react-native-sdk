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
}

interface IOSCapability extends CapabilitiyBase {
  "appium:bundleId": string;
}

export {CapabilitiyBase, AndroidCapability, IOSCapability};
