import {driver} from "@wdio/globals";

const getCurrentPlatform = (): "iOS" | "android" => {
  return driver.capabilities.platformName;
};

export {getCurrentPlatform};
