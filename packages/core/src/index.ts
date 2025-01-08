"use strict";

import {Platform} from "react-native";

import * as embracePackage from "../package.json";

import {setJavaScriptPatch} from "./api/bundle";
import {buildPackageVersion} from "./utils/bundle";
import {handleError, handleGlobalError} from "./api/error";
import {SDKConfig} from "./interfaces";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

const reactNativeVersion = require("react-native/Libraries/Core/ReactNativeVersion.js");
const tracking = require("promise/setimmediate/rejection-tracking");

const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";

const initialize = async ({
  patch,
  sdkConfig,
}: {patch?: string; sdkConfig?: SDKConfig} = {}): Promise<boolean> => {
  const hasNativeSDKStarted = await EmbraceManagerModule.isStarted();

  if (!hasNativeSDKStarted) {
    if (Platform.OS === "ios" && !sdkConfig?.ios?.appId) {
      console.warn(
        "[Embrace] sdkConfig.ios.appId is required to initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return Promise.resolve(false);
    }

    const {startCustomExport: customStartEmbraceSDK, ...originalSdkConfig} =
      sdkConfig || {};

    const startSdkConfig =
      (Platform.OS === "ios" && originalSdkConfig?.ios) || {};

    let isStarted;
    try {
      isStarted = customStartEmbraceSDK
        ? await customStartEmbraceSDK(startSdkConfig)
        : await EmbraceManagerModule.startNativeEmbraceSDK(startSdkConfig);
    } catch {
      isStarted = false;
    }

    if (!isStarted) {
      console.warn(
        "[Embrace] We could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
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

  // Only attempt to check for CodePush bundle URL in release mode. Otherwise CodePush will throw an exception.
  // https://docs.microsoft.com/en-us/appcenter/distribution/codepush/react-native#plugin-configuration-ios
  if (!__DEV__) {
    try {
      const isCodePushPresent =
        await EmbraceManagerModule.checkAndSetCodePushBundleURL();

      // On Android the Swazzler stores the computed bundle ID as part of the build process and the SDK is able to
      // read it at run time. On iOS however we don't retain this value so we either need to get it from the Code Push
      // bundle or, if that isn't enabled, try and get it from the default bundle path
      if (!isCodePushPresent && Platform.OS === "ios") {
        const bundleJs =
          await EmbraceManagerModule.getDefaultJavaScriptBundlePath();

        if (bundleJs) {
          EmbraceManagerModule.setJavaScriptBundlePath(bundleJs);
        }
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
export * from "./api/views";
export * from "./api/network";
export * from "./api/user";

export {initialize};
