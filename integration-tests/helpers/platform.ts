import {driver} from "@wdio/globals";

const getCurrentPlatform = (): "iOS" | "android" => {
  // @ts-ignore
  return driver.capabilities.platformName;
};

export {getCurrentPlatform};
