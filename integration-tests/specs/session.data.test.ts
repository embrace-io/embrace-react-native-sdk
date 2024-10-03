import {driver} from "@wdio/globals";
import {getSessionPayloads} from "../helpers/embrace_server";
import {getCurrentSessionId} from "../helpers/session";
import {getCurrentPlatform} from "../helpers/platform";

const platform = getCurrentPlatform();

const androidApplicationData = {
  app_version: "1.0.0",
  build: "1",
  sdkversion: "6.9.2",
  framework: 2,
  build_type: "release",
};

const androidDeviceData = {
  architecture: "x86_64",
  locale: "en_US",
  manufacturer: "Google",
  model: "sdk_gphone64_x86_64",
  num_cores: 4,
  ostype: "android",
  osversion: "13",
  osversion_code: 33,
  timezone: "GMT",
};

const iOSApplicationData = {
  app_version: "1.0.0",
  bundle_version: "1",
  sdk_version: "6.4.1",
  app_framework: 2,
  environment: "dev",
};

const iosDeviceData = {
  device_manufacturer: "Apple",
  device_model: "x86_64",
  os_name: "iOS",
  os_type: "darwin",
  os_version: "18.0",
};

const validateAndroid = (sessionPayloads, dataToValidate) => {
  expect(sessionPayloads.Events.length).toBe(1);
  const {application} = sessionPayloads.Events[0];
  Object.entries(dataToValidate).forEach(([key, value]) => {
    expect(application[key]).toBe(value);
  });
};

const validateIOS = (sessionPayloads, dataToValidate) => {
  expect(sessionPayloads.Spans.length).toBe(1);
  const {resource} = sessionPayloads.Spans[0];

  Object.entries(dataToValidate).forEach(([key, value]) => {
    expect(resource[key]).toBe(value);
  });
};

const SESSION_DATA_FUNCTIONS = {
  android: {
    validateFunc: validateAndroid,
    deviceData: androidDeviceData,
    appData: androidApplicationData,
  },
  iOS: {
    validateFunc: validateIOS,
    deviceData: iosDeviceData,
    appData: iOSApplicationData,
  },
};

describe("Session data", () => {
  it("should contain the correct application data", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    await driver.execute("mobile: backgroundApp", {seconds: 2});

    const sessionPayloads = await getSessionPayloads(currentSessionId);

    const {validateFunc, appData} = SESSION_DATA_FUNCTIONS[platform];
    validateFunc(sessionPayloads, appData);
  });
  it("should contain the correct device info data", async () => {
    const currentSessionId = await getCurrentSessionId(driver);

    await driver.execute("mobile: backgroundApp", {seconds: 2});

    const sessionPayloads = await getSessionPayloads(currentSessionId);
    const {validateFunc, deviceData} = SESSION_DATA_FUNCTIONS[platform];
    validateFunc(sessionPayloads, deviceData);
  });
});
