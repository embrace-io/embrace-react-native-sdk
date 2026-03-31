import {EmbraceManagerModule} from "../EmbraceManagerModule";
import * as embracePackage from "../../package.json";

import {safePromise} from "./promiseHandler";

const reactNativeVersion = require("react-native/Libraries/Core/ReactNativeVersion.js");

const isObjectNonEmpty = (obj?: object): boolean =>
  Object.keys(obj || {}).length > 0;

const buildPackageVersion = (reactNativeVersion: {
  version: {
    major: string;
    minor: string;
    patch: string;
    prerelease: string | null;
  };
}): string | void => {
  if (
    isObjectNonEmpty(reactNativeVersion) &&
    isObjectNonEmpty(reactNativeVersion.version)
  ) {
    const {major, minor, patch, prerelease} = reactNativeVersion.version;

    const versionStr = `${major || "0"}.${minor || "0"}.${patch || "0"}`;
    return prerelease ? `${versionStr}.${prerelease}` : versionStr;
  }
};

const setEmbracePackageVersion = () => {
  if (embracePackage) {
    const {version} = embracePackage;
    safePromise(
      EmbraceManagerModule.setReactNativeSDKVersion(version),
      "setReactNativeSDKVersion",
      false,
    );
  }
};

const setReactNativeVersion = () => {
  const packageVersion = buildPackageVersion(reactNativeVersion);
  if (packageVersion) {
    safePromise(
      EmbraceManagerModule.setReactNativeVersion(packageVersion),
      "setReactNativeVersion",
      false,
    );
  }
};

export {setReactNativeVersion, setEmbracePackageVersion};
