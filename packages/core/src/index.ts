"use strict";

import {Platform} from "react-native";

import * as embracePackage from "../package.json";

import {buildPackageVersion} from "./utils/bundle";
import {SDKConfig} from "./interfaces";
import {handleError, handleGlobalError} from "./api/error";
import {setJavaScriptPatch} from "./api/bundle";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

const reactNativeVersion = require("react-native/Libraries/Core/ReactNativeVersion.js");
const tracking = require("promise/setimmediate/rejection-tracking");

const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";

const initialize = async ({
  patch,
  sdkConfig,
}: {patch?: string; sdkConfig?: SDKConfig} = {}): Promise<boolean> => {
  const hasNativeSDKStarted = await EmbraceManagerModule.isStarted();

  // if the sdk started in the native side the follow condition doesn't take any effect.
  // neither iOS setup() nor start() will be overridden
  if (!hasNativeSDKStarted) {
    if (
      Platform.OS === "ios" &&
      !sdkConfig?.ios?.appId &&
      !sdkConfig?.startCustomExport
    ) {
      console.warn(
        "[Embrace] 'sdkConfig.ios.appId' is required to initialize Embrace's native SDK if there is no configuration for custom exporters. Please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    }

    const {startCustomExport, ...originalSdkConfig} = sdkConfig || {};

    const startSdkConfig =
      (Platform.OS === "ios" && originalSdkConfig?.ios) || {};

    let isStarted;
    try {
      if (startCustomExport) {
        if (!startSdkConfig.appId) {
          console.log(
            "[Embrace] 'sdkConfig.ios.appId' not found, custom exporters will be used",
          );
        }

        isStarted = await startCustomExport(startSdkConfig);
      } else {
        isStarted =
          await EmbraceManagerModule.startNativeEmbraceSDK(startSdkConfig);
      }
    } catch {
      isStarted = false;
    }

    if (!isStarted) {
      console.warn(
        "[Embrace] we could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    } else {
      console.log("[Embrace] native SDK was started");
    }
  }

  if (embracePackage) {
    const {version} = embracePackage;
    EmbraceManagerModule.setReactNativeSDKVersion(version);
  }

  if (patch) {
    setJavaScriptPatch(patch);
  }

  const packageVersion = buildPackageVersion(reactNativeVersion);
  if (packageVersion) {
    EmbraceManagerModule.setReactNativeVersion(packageVersion);
  }

  // On Android the Swazzler stores the computed bundle ID as part of the build process and the SDK is able to
  // read it at run time. On iOS however we don't retain this value so try and get it from the default bundle path
  if (Platform.OS === "ios") {
    try {
      const bundleJs =
        await EmbraceManagerModule.getDefaultJavaScriptBundlePath();

      if (bundleJs) {
        EmbraceManagerModule.setJavaScriptBundlePath(bundleJs);
      }
    } catch (e) {
      console.warn(
        "[Embrace] We were unable to set the JSBundle path automatically. Please configure this manually to enable crash symbolication. For more information see https://embrace.io/docs/react-native/integration/upload-symbol-files/#pointing-the-embrace-sdk-to-the-javascript-bundle.",
      );
    }
  }

  if (!ErrorUtils) {
    console.warn(
      "[Embrace] ErrorUtils is not defined. Not setting exception handler.",
    );

    return Promise.resolve(false);
  }

  // setting the global error handler. this is available through React Native's ErrorUtils
  ErrorUtils.setGlobalHandler(
    handleGlobalError(ErrorUtils.getGlobalHandler(), handleError),
  );

  tracking.enable({
    allRejections: true,
    onUnhandled: (_: unknown, error: Error) => {
      let message = `${UNHANDLED_PROMISE_REJECTION_PREFIX}: ${error}`;
      let stackTrace = "";

      if (error instanceof Error) {
        message = `${UNHANDLED_PROMISE_REJECTION_PREFIX}: ${error.message}`;
        stackTrace = error.stack || "";
      }

      return EmbraceManagerModule.logMessageWithSeverityAndProperties(
        message,
        "error",
        {},
        stackTrace,
      );
    },
    onHandled: () => {},
  });

  // If there are no errors, it will return true
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

export {initialize};
