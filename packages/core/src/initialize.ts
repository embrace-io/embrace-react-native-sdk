import * as reactNativePackage from "react-native/package.json";

import * as embracePackage from "../package.json";

import {enableOrientationTracking} from "./utils/orientation";
import {enableUnhandledRejectionTracking} from "./utils/error";
import EmbraceLogger, {EmbraceLoggerLevel} from "./utils/EmbraceLogger";
import {EmbraceNativeTracerProviderConfig} from "./tracerProvider/types";
import {registerTracerProvider} from "./tracerProvider/register";
import {handleError, handleGlobalError} from "./api/error";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

interface EmbraceConfig {
  patch?: string;
  logLevel?: EmbraceLoggerLevel;
  trackUnhandledRejections?: boolean;
  trackScreenOrientation?: boolean;
  tracerProvider?: boolean | EmbraceNativeTracerProviderConfig;
}

interface NativeInitConfig {
  reactNativeVersion?: string;
  sdkVersion: string;
  javaScriptPatchNumber?: string;
  resolveDefaultBundlePath: boolean;
}

const NATIVE_SDK_NOT_STARTED =
  "Failed to initialize the SDK: The Embrace native SDK has not been started. " +
  "Start Embrace in native code (AppDelegate on iOS, MainApplication on Android), " +
  "or if you use Expo, add the Embrace config plugin and rebuild. " +
  "See https://embrace.io/docs/react-native/integration/session-reporting/#start-embrace-sdk-in-the-native-side";

let initialized = false;

const initialize = ({
  patch,
  logLevel = "info",
  trackUnhandledRejections = false,
  trackScreenOrientation = false,
  tracerProvider = true,
}: EmbraceConfig = {}): boolean => {
  const logger = new EmbraceLogger(console, logLevel);

  if (initialized) {
    logger.warn("`initialize` has already been called, ignoring this call.");
    return true;
  }

  const nativeInitConfig: NativeInitConfig = {
    reactNativeVersion: reactNativePackage.version,
    sdkVersion: embracePackage.version,
    javaScriptPatchNumber: patch || undefined,
    resolveDefaultBundlePath: !__DEV__,
  };

  let isNativeSdkStarted;
  try {
    isNativeSdkStarted =
      EmbraceManagerModule.initializeReactNativeSDK(nativeInitConfig);
  } catch (e) {
    logger.error(`Failed to initialize the SDK: ${e}`);
    return false;
  }

  if (!isNativeSdkStarted) {
    if (__DEV__) {
      throw new Error(NATIVE_SDK_NOT_STARTED);
    }

    logger.error(NATIVE_SDK_NOT_STARTED);
    return false;
  }

  initialized = true;

  if (ErrorUtils) {
    ErrorUtils.setGlobalHandler(
      handleGlobalError(ErrorUtils.getGlobalHandler(), handleError),
    );
  } else {
    logger.warn(
      "ErrorUtils is not defined, not capturing unhandled exceptions.",
    );
  }

  if (trackUnhandledRejections) {
    enableUnhandledRejectionTracking(logger);
  }

  if (trackScreenOrientation) {
    enableOrientationTracking();
  }

  if (tracerProvider) {
    registerTracerProvider(tracerProvider === true ? {} : tracerProvider);
  }

  return true;
};

export {initialize, type EmbraceConfig};
