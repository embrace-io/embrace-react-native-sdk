"use strict";

import {Platform} from "react-native";

import {oltpGetStart} from "./utils/otlp";
import {enableUnhandledRejectionTracking} from "./utils/error";
import {setEmbracePackageVersion, setReactNativeVersion} from "./utils/bundle";
import EmbraceLogger from "./utils/EmbraceLogger";
import {SDKConfig, EmbraceLoggerLevel} from "./interfaces";
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

  const hasNativeSDKStarted = await EmbraceManagerModule.isStarted();

  // if the sdk started in the native side the follow condition doesn't take any effect.
  // neither iOS setup() nor start() will be overridden
  if (!hasNativeSDKStarted) {
    if (isIOS && !sdkConfig?.ios?.appId && !sdkConfig?.exporters) {
      logger.warn(
        "'sdkConfig.ios.appId' is required to initialize Embrace's native SDK if there is no configuration for custom exporters. Please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    }

    const {exporters: otlpExporters} = sdkConfig || {};
    const startSdkConfig = (isIOS && sdkConfig?.ios) || {};

    let isStarted;
    let otlpStart = null;

    // separating blocks for throwing their own warning messages individually.
    // if core/otlp blocks are combined into one try/catch and the otlp package throws an error
    // the core package won't be able to start the SDK as fallback
    // `oltpGetStart` has their own try/catch block
    if (otlpExporters) {
      if (isIOS && !startSdkConfig.appId) {
        logger.log(
          "'sdkConfig.ios.appId' not found, only custom exporters will be used",
        );
      }

      // if package is installed/available and exporters are provided get the `start` method
      otlpStart = oltpGetStart(logger, otlpExporters);
    }

    try {
      // if the otlp package throws or it is not available, the core package will work as usual printing the proper messages
      isStarted = otlpStart
        ? // if OTLP exporter package is available, use it
          await otlpStart(startSdkConfig)
        : // otherwise, uses the core package
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

  // On Android the Swazzler stores the computed bundle ID as part of the build process and the SDK is able to read it
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
      logger.warn(
        "we were unable to set the JSBundle path automatically. Please configure this manually to enable crash symbolication. For more information see https://embrace.io/docs/react-native/integration/upload-symbol-files/#pointing-the-embrace-sdk-to-the-javascript-bundle.",
      );
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
      logger.warn(
        "we were unable to setup tracking of unhandled promise rejections.",
      );
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

export {initialize};
