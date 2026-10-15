"use strict";

import {Platform} from "react-native";

import {enableUnhandledRejectionTracking} from "./utils/error";
import {setEmbracePackageVersion, setReactNativeVersion} from "./utils/bundle";
import EmbraceLogger from "./utils/EmbraceLogger";
import {SDKConfig, EmbraceLoggerLevel} from "./interfaces";
import {logWarning} from "./api/log";
import {handleError, handleGlobalError} from "./api/error";
import {setJavaScriptBundlePath, setJavaScriptPatch} from "./api/bundle";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

interface EmbraceInitArgs {
  patch?: string;
  sdkConfig?: SDKConfig;
  logLevel?: EmbraceLoggerLevel;
}

const initialize = async (
  {sdkConfig, patch, logLevel}: EmbraceInitArgs = {logLevel: "info"},
): Promise<boolean> => {
  const isIOS = Platform.OS === "ios";
  const logger = new EmbraceLogger(console, logLevel);

  let hasNativeSDKStarted;
  try {
    hasNativeSDKStarted = await EmbraceManagerModule.isStarted();
  } catch (e) {
    logger.warn(
      `Failed to check if Embrace SDK is started: ${e}. The native module may not be linked.`,
    );
    return false;
  }

  // if the sdk started in the native side the follow condition doesn't take any effect.
  // neither iOS setup() nor start() will be overridden
  if (!hasNativeSDKStarted) {
    logger.warn(
      "Starting the native SDK from JavaScript (including `sdkConfig.ios`) is deprecated and will be removed in the next major release. Start Embrace in native code instead: https://embrace.io/docs/react-native/integration/session-reporting/#start-embrace-sdk-in-the-native-side",
    );

    if (isIOS && !sdkConfig?.ios?.appId) {
      logger.warn(
        "'sdkConfig.ios.appId' is required to initialize Embrace's native SDK. Please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    }

    const startSdkConfig = (isIOS && sdkConfig?.ios) || {};

    let isStarted;

    try {
      isStarted =
        await EmbraceManagerModule.startNativeEmbraceSDK(startSdkConfig);
    } catch (e) {
      isStarted = false;
      logger.warn(`${e}`);
    }

    if (!isStarted) {
      logger.warn(
        "we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    } else {
      logger.log("native SDK was started");
    }
  }

  // setting version of React Native used by the app
  setReactNativeVersion();
  // setting version of the Embrace RN package
  setEmbracePackageVersion();

  if (patch) {
    setJavaScriptPatch(patch);
  }

  // On Android the Embrace Gradle plugin stores the computed bundle ID as part of the build process and the SDK is able to read it
  // at run time. On iOS however we don't retain this value so for production builds try and get it from the default
  // bundle path.
  if (isIOS && !__DEV__) {
    try {
      const bundleJs =
        await EmbraceManagerModule.getDefaultJavaScriptBundlePath();

      if (bundleJs) {
        setJavaScriptBundlePath(bundleJs);
      }
    } catch (e) {
      const errorMessage =
        "we were unable to set the JSBundle path automatically. Please configure this manually to enable crash symbolication. For more information see https://embrace.io/docs/react-native/integration/upload-symbol-files/#pointing-the-embrace-sdk-to-the-javascript-bundle.";
      logger.warn(errorMessage);
      logWarning(`${errorMessage} | ${e}`);
    }
  }

  if (!ErrorUtils) {
    logger.warn("ErrorUtils is not defined. Not setting exception handler.");
    return Promise.resolve(false);
  }

  // setting the global error handler
  // this is available through React Native's ErrorUtils
  ErrorUtils.setGlobalHandler(
    handleGlobalError(ErrorUtils.getGlobalHandler(), handleError),
  );

  if (sdkConfig?.trackUnhandledRejections) {
    try {
      enableUnhandledRejectionTracking();
    } catch (e) {
      const errorMessage =
        "we were unable to setup tracking of unhandled promise rejections.";
      logger.warn(errorMessage);
      logWarning(`${errorMessage} | ${e}`);
    }
  }

  return Promise.resolve(true);
};

export * from "./api/breadcrumb";
export * from "./api/bundle";
export * from "./api/component";
export * from "./api/error";
export * from "./api/log";
export * from "./api/session";
export * from "./api/network";
export * from "./api/user";
export * from "./hooks/useEmbrace";
export * from "./hooks/useEmbraceIsStarted";
export * from "./hooks/useOrientationListener";
export * from "./interfaces";
export * from "./tracerProvider";

export {
  configureSDKErrorLogging,
  getSDKErrorLoggingConfig,
  type SDKErrorLoggingConfig,
} from "./utils/promiseHandler";

export {initialize};
