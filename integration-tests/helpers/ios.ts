// https://discuss.appium.io/t/how-to-use-existing-already-running-ios-simulator/41181/5

import {execSync} from "node:child_process";

type DeviceMap = {
  [sdk: string]: Device[];
};

type Device = {
  name: string;
  udid: string;
};

const getBootedDevices = (): Device[] => {
  const output = execSync("xcrun simctl list devices booted -je");
  const devicesMap: DeviceMap = JSON.parse(output.toString()).devices;
  return Object.values(devicesMap).flatMap(devices => devices);
};

const firstAvailableDevice = (): string => {
  return getBootedDevices()[0].udid;
};

export {firstAvailableDevice};
