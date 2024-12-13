'use strict';
import { NativeModules } from 'react-native';

import {
  getNetworkSDKInterceptorProvider,
  NETWORK_INTERCEPTOR_TYPES,
} from './interfaces/NetworkMonitoring';

import * as embracePackage from '../package.json';

import { MethodType } from './interfaces/HTTP';
import { SessionStatus } from './interfaces/Types';
import { ApplyInterceptorStrategy } from './networkInterceptors/ApplyInterceptor';
import { logIfComponentError } from './utils/ComponentError';
import { handleGlobalError } from './utils/ErrorUtil';

interface Properties {
  [key: string]: any;
}

const tracking = require('promise/setimmediate/rejection-tracking');

const reactNativeVersion = require('react-native/Libraries/Core/ReactNativeVersion.js');

const stackLimit = 200;

const unhandledPromiseRejectionPrefix = 'Unhandled promise rejection: ';

const handleError = async (error: Error, callback: () => void) => {
  if (!(error instanceof Error)) {
    console.warn('[Embrace] error must be of type Error');
    return;
  }
  const { name, message, stack = '' } = error;

  logIfComponentError(error);

  const truncated = stack.split('\n').slice(0, stackLimit).join('\n');

  await NativeModules.EmbraceManager.logUnhandledJSException(
    name,
    message,
    error.constructor.name,
    truncated
  );
  callback();
};

const isObjectNonEmpty = (obj?: object): boolean =>
  Object.keys(obj || {}).length > 0;

export const initialize = async ({
  patch,
}: { patch?: string } = {}): Promise<boolean> => {
  if (!ErrorUtils) {
    console.warn(
      '[Embrace] ErrorUtils is not defined. Not setting exception handler.'
    );
    return createFalsePromise();
  }
  const hasNativeSDKStarted = await NativeModules.EmbraceManager.isStarted();
  if (!hasNativeSDKStarted) {
    const result = await NativeModules.EmbraceManager.startNativeEmbraceSDK();
    if (!result) {
      console.warn(
        '[Embrace] We could not initialize Embrace\'s native SDK, please check the Embrace integration docs at https://embrace.io/docs/react-native/integration/'
      );
      return createFalsePromise();
    } else {
      console.log('[Embrace] native SDK was started');
    }
  }

  if (embracePackage) {
    NativeModules.EmbraceManager.setReactNativeSDKVersion(
      embracePackage.version
    );
  }

  if (patch) {
    setJavaScriptPatch(patch);
  }

  if (
    isObjectNonEmpty(reactNativeVersion) &&
    isObjectNonEmpty(reactNativeVersion.version)
  ) {
    NativeModules.EmbraceManager.setReactNativeVersion(
      buildVersionStr(reactNativeVersion.version)
    );
  }

  // Only attempt to check for CodePush bundle URL in release mode. Otherwise CodePush will throw an exception.
  // https://docs.microsoft.com/en-us/appcenter/distribution/codepush/react-native#plugin-configuration-ios
  if (!__DEV__) {
    NativeModules.EmbraceManager.checkAndSetCodePushBundleURL();
  }
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler(handleGlobalError(previousHandler, handleError));

  tracking.enable({
    allRejections: true,
    onUnhandled: (_: any, error: Error) => {
      let message = `Unhandled promise rejection: ${error}`;
      let st = '';
      if (error instanceof Error) {
        message = unhandledPromiseRejectionPrefix + error.message;
        st = error.stack || '';
      }
      return NativeModules.EmbraceManager.logMessageWithSeverityAndProperties(
        message,
        ERROR,
        {},
        st
      );
    },
    onHandled: () => {},
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
  const versionStr = `${major || '0'}.${minor || '0'}.${patch || '0'}`;
  return prerelease ? `${versionStr}.${prerelease}` : versionStr;
};

export const endAppStartup = (properties?: Properties): Promise<boolean> => {
  if (properties && Object.keys(properties).length > 0) {
    return NativeModules.EmbraceManager.endAppStartupWithProperties(properties);
  }
  return NativeModules.EmbraceManager.endAppStartup();
};

export const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.setUserIdentifier(userIdentifier);
};

export const clearUserIdentifier = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearUserIdentifier();
};

export const setUsername = (username: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.setUsername(username);
};

export const clearUsername = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearUsername();
};

export const setUserEmail = (userEmail: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.setUserEmail(userEmail);
};

export const clearUserEmail = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearUserEmail();
};

export const addBreadcrumb = (message: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.addBreadcrumb(message);
};

export const logScreen = (screenName: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.addBreadcrumb(
    `Opening screen [${screenName}]`
  );
};

export const startMoment = (
  name: string,
  identifier?: string,
  properties?: Properties
): Promise<boolean> => {
  if (!name) {
    console.warn('[Embrace] Name is not defined. The moment was not started.');
    return createFalsePromise();
  }
  if (identifier && properties) {
    return NativeModules.EmbraceManager.startMomentWithNameAndIdentifierAndProperties(
      name,
      identifier,
      properties
    );
  } else if (identifier) {
    return NativeModules.EmbraceManager.startMomentWithNameAndIdentifier(
      name,
      identifier
    );
  } else if (properties) {
    return NativeModules.EmbraceManager.startMomentWithNameAndIdentifierAndProperties(
      name,
      null,
      properties
    );
  } else {
    return NativeModules.EmbraceManager.startMomentWithName(name);
  }
};

export const endMoment = (
  name: string,
  identifier?: string,
  properties?: Properties
): Promise<boolean> => {
  if (identifier) {
    return NativeModules.EmbraceManager.endMomentWithNameAndIdentifier(
      name,
      identifier,
      properties
    );
  } else {
    return NativeModules.EmbraceManager.endMomentWithName(name, properties);
  }
};

export const addUserPersona = (persona: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.addUserPersona(persona);
};
export const clearUserPersona = (persona: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearUserPersona(persona);
};
export const clearAllUserPersonas = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearAllUserPersonas();
};
export const WARNING = 'warning';
export const INFO = 'info';
export const ERROR = 'error';

export const logMessage = (
  message: string,
  severity: 'info' | 'warning' | 'error' = 'error',
  properties?: Properties
): Promise<boolean> => {
  {
    const stacktrace = severity === INFO ? '' : generateStackTrace();
    return NativeModules.EmbraceManager.logMessageWithSeverityAndProperties(
      message,
      severity,
      properties,
      stacktrace
    );
  }
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
  properties?: Properties
): Promise<boolean> => {
  if (error instanceof Error) {
    return NativeModules.EmbraceManager.logHandledError(
      error.message,
      error.stack,
      properties
    );
  } else {
    return createFalsePromise();
  }
};
export const startView = (view: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.startView(view);
};

export const endView = (view: string): Promise<boolean> => {
  return NativeModules.EmbraceManager.endView(view);
};

export const generateStackTrace = (): string => {
  const err = new Error();
  return err.stack || '';
};

export const setJavaScriptPatch = (patch: string) => {
  return NativeModules.EmbraceManager.setJavaScriptPatchNumber(patch);
};

export const setJavaScriptBundlePath = (path: string) => {
  return NativeModules.EmbraceManager.setJavaScriptBundlePath(path);
};

export const addSessionProperty = (
  key: string,
  value: string,
  permanent: boolean
): Promise<boolean> => {
  return NativeModules.EmbraceManager.addSessionProperty(key, value, permanent);
};

export const removeSessionProperty = (key: string) => {
  return NativeModules.EmbraceManager.removeSessionProperty(key);
};

export const getSessionProperties = () => {
  return NativeModules.EmbraceManager.getSessionProperties();
};

export const endSession = (clearUserInfo: boolean = false) => {
  return NativeModules.EmbraceManager.endSession(clearUserInfo);
};

export const setUserAsPayer = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.setUserAsPayer();
};

export const clearUserAsPayer = (): Promise<boolean> => {
  return NativeModules.EmbraceManager.clearUserAsPayer();
};
export const recordNetworkRequest = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  bytesSent?: number,
  bytesReceived?: number,
  statusCode?: number,
  error?: string
): Promise<boolean> => {
  return NativeModules.EmbraceManager.logNetworkRequest(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    bytesSent || -1,
    bytesReceived || -1,
    statusCode || -1,
    error
  );
};

export const logNetworkClientError = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  errorType: string,
  errorMessage: string
): Promise<boolean> => {
  return NativeModules.EmbraceManager.logNetworkClientError(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    errorType,
    errorMessage
  );
};
export const getLastRunEndState = (): Promise<SessionStatus> =>
  NativeModules.EmbraceManager.getLastRunEndState();

export const getDeviceId = (): Promise<string> =>
  NativeModules.EmbraceManager.getDeviceId();

export const getCurrentSessionId = (): Promise<string> =>
  NativeModules.EmbraceManager.getCurrentSessionId();

export const applyNetworkInterceptors = (
  networkSDKInstance: NETWORK_INTERCEPTOR_TYPES
): Promise<boolean> => {
  if (!networkSDKInstance) {
    console.warn(
      `[Embrace] The Axios instance was not provided. Interceptor was not applied.`
    );
    return createFalsePromise();
  }

  const networkProviderSDK =
    getNetworkSDKInterceptorProvider(networkSDKInstance);

  if (!networkProviderSDK) {
    console.warn(
      `[Embrace] The provider is not supported. Interceptor was not applied.`
    );
    return createFalsePromise();
  }

  const { applyInterceptor } = ApplyInterceptorStrategy[networkProviderSDK];

  applyInterceptor(networkSDKInstance);
  return createTruePromise();
};

const createFalsePromise = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, 0);
  });
};

const createTruePromise = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};
