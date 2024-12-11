"use strict";
import {Platform} from "react-native";

import * as embracePackage from "../package.json";

import {generateStackTrace, handleGlobalError} from "./utils/ErrorUtil";
import {logIfComponentError} from "./utils/ComponentError";
import {ApplyInterceptorStrategy} from "./networkInterceptors/ApplyInterceptor";
import {
  LogSeverity,
  SessionStatus,
  SDKConfig,
  MethodType,
  LogProperties,
} from "./interfaces/common";
import {
  getNetworkSDKInterceptorProvider,
  NETWORK_INTERCEPTOR_TYPES,
} from "./interfaces/NetworkMonitoring";
import {EmbraceManagerModule} from "./EmbraceManagerModule";

const reactNativeVersion = require("react-native/Libraries/Core/ReactNativeVersion.js");
const tracking = require("promise/setimmediate/rejection-tracking");

const STACK_LIMIT = 200;
const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";

const noOp = () => {};

// will cover unhandled errors, js crashes
const handleError = async (error: Error, callback: () => void) => {
  if (!(error instanceof Error)) {
    console.warn("[Embrace] error must be of type Error");
    return;
  }

  const {name, message, stack = ""} = error;

  logIfComponentError(error);

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

  let logException;
  try {
    logException = await EmbraceManagerModule.logUnhandledJSException(
      name,
      message,
      errorType,
      Platform.OS === "android" ? stTruncated.join("\n") : iosStackTrace,
    );
  } catch {
    logException = false;
  }

  if (!logException) {
    console.warn("[Embrace] Failed to log exception");
  }

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
        LogSeverity.ERROR,
        {},
        stackTrace,
      );
    },
    onHandled: noOp,
  });

  // If there are no errors, it will return true
  return Promise.resolve(true);
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

const logMessage = (
  message: string,
  severity:
    | LogSeverity.INFO
    | LogSeverity.WARNING
    | LogSeverity.ERROR = LogSeverity.ERROR,
  // Android Native method is handling the null case
  // iOS Native method is waiting for a non-nullable object
  properties: LogProperties = {},
  includeStacktrace = true,
): Promise<boolean> => {
  const stackTrace =
    // `LogSeverity.INFO` are not supposed to send stack traces
    // this is also restricted in the Native layers
    includeStacktrace && severity !== LogSeverity.INFO
      ? generateStackTrace()
      : "";

  if (properties === null) {
    console.warn(
      "[Embrace] `properties` is null. It should be an object of type `Properties`. Native layer will ignore this value.",
    );
  }

  return EmbraceManagerModule.logMessageWithSeverityAndProperties(
    message,
    severity,
    properties,
    stackTrace,
    includeStacktrace,
  );
};

const logInfo = (message: string): Promise<boolean> => {
  // `LogSeverity.INFO` logs are not supposed to send stack traces as per Product decision
  // this is also restricted in the Native layers
  return logMessage(message, LogSeverity.INFO, undefined, false);
};

const logWarning = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, LogSeverity.WARNING, undefined, includeStacktrace);
};

const logError = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, LogSeverity.ERROR, undefined, includeStacktrace);
};

const logHandledError = (
  error: Error,
  properties: LogProperties = {},
): Promise<boolean> => {
  if (error instanceof Error) {
    const {stack, message} = error;
    return EmbraceManagerModule.logHandledError(message, stack, properties);
  }

  return Promise.resolve(false);
};

export const startView = (view: string): Promise<string | boolean> => {
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

export {initialize, logError, logHandledError, logInfo, logWarning, logMessage};
