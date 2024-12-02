"use strict";
import {Platform} from "react-native";

import * as embracePackage from "../package.json";

import {generateStackTrace, handleGlobalError} from "./utils/ErrorUtil";
import {ApplyInterceptorStrategy} from "./networkInterceptors/ApplyInterceptor";
import {SessionStatus} from "./interfaces/Types";
import {
  getNetworkSDKInterceptorProvider,
  NETWORK_INTERCEPTOR_TYPES,
} from "./interfaces/NetworkMonitoring";
import {MethodType} from "./interfaces/HTTP";
import {SDKConfig} from "./interfaces/Config";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

interface Properties {
  [key: string]: string;
}

const reactNativeVersion = require("react-native/Libraries/Core/ReactNativeVersion.js");
const tracking = require("promise/setimmediate/rejection-tracking");

const STACK_LIMIT = 200;
const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";
const WARNING = "warning";
const INFO = "info";
const ERROR = "error";

const noOp = () => {};

// will cover unhandled errors, js crashes
const handleError = async (error: Error, callback: () => void) => {
  if (!(error instanceof Error)) {
    console.warn("[Embrace] error must be of type Error");
    return;
  }

  const {name, message, stack = ""} = error;

  // same as error.name? why is it pulled differently?
  const errorType = error.constructor.name;

  // truncating stacktrace to 200 lines
  const stTruncated = stack.split("\n").slice(0, STACK_LIMIT);

  // specifically for iOS for now, the same formatting is done in the Android layer
  // in the future Android will get rid of all related to js and use this format as well
  const iosStackTrace = JSON.stringify({
    n: name,
    m: message,
    t: errorType,
    // removing the Type from the first part of the stacktrace.
    st: stTruncated.slice(1, stTruncated.length).join("\n"),
  });

  await EmbraceManagerModule.logUnhandledJSException(
    name,
    message,
    errorType,
    Platform.OS === "android" ? stTruncated.join("\n") : iosStackTrace,
  );

  callback();
};

const isObjectNonEmpty = (obj?: object): boolean =>
  Object.keys(obj || {}).length > 0;

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

      return createFalsePromise();
    }

    const {startCustomExport: customStartEmbraceSDK, ...originalSdkConfig} =
      sdkConfig || {};

    const startSdkConfig =
      (Platform.OS === "ios" && originalSdkConfig?.ios) || {};

    const isStarted = customStartEmbraceSDK
      ? await customStartEmbraceSDK(startSdkConfig)
      : await EmbraceManagerModule.startNativeEmbraceSDK(startSdkConfig);

    if (!isStarted) {
      console.warn(
        "[Embrace] We could not initialize Embrace's native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/",
      );

      return createFalsePromise();
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

  if (
    isObjectNonEmpty(reactNativeVersion) &&
    isObjectNonEmpty(reactNativeVersion.version)
  ) {
    EmbraceManagerModule.setReactNativeVersion(
      buildVersionStr(reactNativeVersion.version),
    );
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

    return createFalsePromise();
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
        ERROR,
        {},
        stackTrace,
      );
    },
    onHandled: noOp,
  });

  // If there are no errors, it will return true
  return createTruePromise();
};

const buildVersionStr = ({
  major,
  minor,
  patch,
  prerelease,
}: {
  major: string;
  minor: string;
  patch: string;
  prerelease: string | null;
}): string => {
  const versionStr = `${major || "0"}.${minor || "0"}.${patch || "0"}`;
  return prerelease ? `${versionStr}.${prerelease}` : versionStr;
};

export const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

export const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

export const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

export const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

export const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

export const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

export const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

export const logScreen = (screenName: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(`Opening screen [${screenName}]`);
};

export const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

export const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

export const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

export const logMessage = (
  message: string,
  severity: "info" | "warning" | "error" = "error",
  properties?: Properties,
): Promise<boolean> => {
  const stacktrace = severity === INFO ? "" : generateStackTrace();

  return EmbraceManagerModule.logMessageWithSeverityAndProperties(
    message,
    severity,
    properties,
    stacktrace,
  );
};

export const logInfo = (message: string): Promise<boolean> => {
  return logMessage(message, INFO);
};
export const logWarning = (message: string): Promise<boolean> => {
  return logMessage(message, WARNING);
};
export const logError = (message: string): Promise<boolean> => {
  return logMessage(message, ERROR);
};

export const logHandledError = (
  error: Error,
  properties?: Properties,
): Promise<boolean> => {
  if (error instanceof Error) {
    const {stack, message} = error;

    return EmbraceManagerModule.logHandledError(
      message,
      stack,
      properties || {},
    );
  }

  return createFalsePromise();
};

export const startView = (view: string): Promise<boolean> => {
  return EmbraceManagerModule.startView(view);
};

export const endView = (spanId: string): Promise<boolean> => {
  return EmbraceManagerModule.endView(spanId);
};

export const setJavaScriptPatch = (patch: string) => {
  return EmbraceManagerModule.setJavaScriptPatchNumber(patch);
};

export const setJavaScriptBundlePath = (path: string) => {
  return EmbraceManagerModule.setJavaScriptBundlePath(path);
};

export const addSessionProperty = (
  key: string,
  value: string,
  permanent: boolean,
): Promise<boolean> => {
  return EmbraceManagerModule.addSessionProperty(key, value, permanent);
};

export const removeSessionProperty = (key: string) => {
  return EmbraceManagerModule.removeSessionProperty(key);
};

export const endSession = () => {
  return EmbraceManagerModule.endSession();
};

export const setUserAsPayer = (): Promise<boolean> => {
  return EmbraceManagerModule.setUserAsPayer();
};

export const clearUserAsPayer = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserAsPayer();
};

export const recordNetworkRequest = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  bytesSent?: number,
  bytesReceived?: number,
  statusCode?: number,
): Promise<boolean> => {
  return EmbraceManagerModule.logNetworkRequest(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    bytesSent || -1,
    bytesReceived || -1,
    statusCode || -1,
  );
};

export const logNetworkClientError = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  errorType: string,
  errorMessage: string,
): Promise<boolean> => {
  return EmbraceManagerModule.logNetworkClientError(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    errorType,
    errorMessage,
  );
};

export const getLastRunEndState = (): Promise<SessionStatus> =>
  EmbraceManagerModule.getLastRunEndState();

export const getDeviceId = (): Promise<string> =>
  EmbraceManagerModule.getDeviceId();

export const getCurrentSessionId = (): Promise<string> =>
  EmbraceManagerModule.getCurrentSessionId();

export const applyNetworkInterceptors = (
  networkSDKInstance: NETWORK_INTERCEPTOR_TYPES,
): Promise<boolean> => {
  if (!networkSDKInstance) {
    console.warn(
      `[Embrace] The Axios instance was not provided. Interceptor was not applied.`,
    );
    return createFalsePromise();
  }

  const networkProviderSDK =
    getNetworkSDKInterceptorProvider(networkSDKInstance);

  if (!networkProviderSDK) {
    console.warn(
      `[Embrace] The provider is not supported. Interceptor was not applied.`,
    );
    return createFalsePromise();
  }

  const {applyInterceptor} = ApplyInterceptorStrategy[networkProviderSDK];

  applyInterceptor(networkSDKInstance);
  return createTruePromise();
};

const createFalsePromise = (): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(false);
    }, 0);
  });
};

const createTruePromise = (): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};

export {initialize, WARNING, ERROR, INFO};
export {type Properties};
