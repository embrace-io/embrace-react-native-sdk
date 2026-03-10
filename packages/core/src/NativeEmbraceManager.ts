import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

/* eslint-disable @typescript-eslint/ban-types -- Object is required by React Native TurboModule codegen */
export interface Spec extends TurboModule {
  isStarted(): Promise<boolean>;
  startNativeEmbraceSDK(config: Object): Promise<boolean>;
  getDeviceId(): Promise<string>;
  getLastRunEndState(): Promise<string>;
  getCurrentSessionId(): Promise<string>;
  setUserIdentifier(userIdentifier: string): Promise<boolean>;
  setUsername(userName: string): Promise<boolean>;
  setUserEmail(userEmail: string): Promise<boolean>;
  clearUserIdentifier(): Promise<boolean>;
  clearUsername(): Promise<boolean>;
  clearUserEmail(): Promise<boolean>;
  addBreadcrumb(event: string): Promise<boolean>;
  addSessionProperty(
    key: string,
    value: string,
    permanent: boolean,
  ): Promise<boolean>;
  removeSessionProperty(key: string): Promise<boolean>;
  endSession(): Promise<boolean>;
  setReactNativeSDKVersion(version: string): Promise<boolean>;
  setReactNativeVersion(version: string): Promise<boolean>;
  setJavaScriptPatchNumber(patch: string): Promise<boolean>;
  setJavaScriptBundlePath(path: string): Promise<boolean>;
  getDefaultJavaScriptBundlePath(): Promise<string>;
  addUserPersona(persona: string): Promise<boolean>;
  clearUserPersona(persona: string): Promise<boolean>;
  clearAllUserPersonas(): Promise<boolean>;
  logMessageWithSeverityAndProperties(
    message: string,
    severity: string,
    properties: Object,
    stacktrace: string,
    includeStacktrace: boolean,
  ): Promise<boolean>;
  logHandledError(
    message: string,
    stacktrace: string,
    properties: Object,
  ): Promise<boolean>;
  logUnhandledJSException(
    name: string,
    message: string,
    type: string,
    stacktrace: string,
  ): Promise<boolean>;
  logNetworkRequest(
    url: string,
    httpMethod: string,
    startInMillis: number,
    endInMillis: number,
    bytesSent: number,
    bytesReceived: number,
    statusCode: number,
  ): Promise<boolean>;
  logNetworkClientError(
    url: string,
    httpMethod: string,
    startInMillis: number,
    endInMillis: number,
    errorType: string,
    errorMessage: string,
  ): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>("EmbraceManager");
