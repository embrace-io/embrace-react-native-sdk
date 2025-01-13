"use strict";

import {Platform} from "react-native";

import {trackUnhandledErrors} from "./utils/error";
import {setEmbracePackageVersion, setReactNativeVersion} from "./utils/bundle";
import EmbraceOTLP from "./utils/EmbraceOTLP";
import EmbraceLogger from "./utils/EmbraceLogger";
import {SDKConfig} from "./interfaces";
import {handleError, handleGlobalError} from "./api/error";
import {setJavaScriptPatch} from "./api/bundle";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

interface EmbraceInitArgs {
  patch?: string;
  sdkConfig?: SDKConfig;
  debug?: boolean;
}

const initialize = async (
  {sdkConfig, patch, debug}: EmbraceInitArgs = {debug: true},
): Promise<boolean> => {
  const isIOS = Platform.OS === "ios";
  const logger = new EmbraceLogger(
    console,
    debug ? ["info", "warn", "error"] : ["warn", "error"],
  );

  const hasNativeSDKStarted = await EmbraceManagerModule.isStarted();

  // if the sdk started in the native side the follow condition doesn't take any effect.
  // neither iOS setup() nor start() will be overridden
  if (!hasNativeSDKStarted) {
    if (isIOS && !sdkConfig?.ios?.appId && !sdkConfig?.exporters) {
      logger.warn(
        "[Embrace] 'sdkConfig.ios.appId' is required to initialize Embrace's native SDK if there is no configuration for custom exporters. Please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    }

    const {exporters: otlpExporters, ...originalSdkConfig} = sdkConfig || {};
    const embraceOTLP = new EmbraceOTLP(logger);

    try {
      // consuming `@embrace-io/react-native-otlp`
      embraceOTLP.get();
    } catch {
      if (otlpExporters) {
        logger.error(
          "an error ocurred when checking if `@embrace-io/react-native-otlp` was installed",
        );
      }
    }

    const startSdkConfig = (isIOS && originalSdkConfig?.ios) || {};

    let isStarted;
    try {
      let startNativeEmbraceSDKWithOTLP = null;
      // if package is installed/available and exporters are provided get the `start` method
      if (otlpExporters) {
        if (!startSdkConfig.appId) {
          logger.log(
            "[Embrace] 'sdkConfig.ios.appId' not found, only custom exporters will be used",
          );
        }

        startNativeEmbraceSDKWithOTLP = embraceOTLP.set(otlpExporters);
      }

      isStarted = startNativeEmbraceSDKWithOTLP
        ? // If OTLP exporter package is available, use it
          await startNativeEmbraceSDKWithOTLP(startSdkConfig)
        : // Otherwise, uses the core package
          await EmbraceManagerModule.startNativeEmbraceSDK(startSdkConfig);
    } catch (e) {
      isStarted = false;
      logger.warn(`[Embrace] From Native layer: ${e}`);
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

  // On Android the Swazzler stores the computed bundle ID as part of the build process and the SDK is able to
  // read it at run time. On iOS however we don't retain this value so try and get it from the default bundle path
  if (isIOS) {
    try {
      const bundleJs =
        await EmbraceManagerModule.getDefaultJavaScriptBundlePath();

      if (bundleJs) {
        EmbraceManagerModule.setJavaScriptBundlePath(bundleJs);
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

  // through `promise/setimmediate/rejection-tracking`
  trackUnhandledErrors();

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

export {initialize};
