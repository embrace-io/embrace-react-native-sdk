/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";

export interface Spec extends TurboModule {
  isStarted(): Promise<boolean>;
  startNativeEmbraceSDK(config: Object): Promise<boolean>;
  setJavaScriptBundlePath(path: string): Promise<boolean>;
  getDefaultJavaScriptBundlePath(): Promise<string>;
  setJavaScriptPatchNumber(patch: string): Promise<boolean>;
  setReactNativeSDKVersion(version: string): Promise<boolean>;
  setReactNativeVersion(version: string): Promise<boolean>;

  getDeviceId(): Promise<string>;
  getCurrentSessionId(): Promise<string>;
  getLastRunEndState(): Promise<string>;
  endSession(): Promise<boolean>;
  addSessionProperty(
    key: string,
    value: string,
    permanent: boolean,
  ): Promise<boolean>;
  removeSessionProperty(key: string): Promise<boolean>;

  setUserIdentifier(userIdentifier: string): Promise<boolean>;
  clearUserIdentifier(): Promise<boolean>;
  setUsername(userName: string): Promise<boolean>;
  clearUsername(): Promise<boolean>;
  setUserEmail(userEmail: string): Promise<boolean>;
  clearUserEmail(): Promise<boolean>;
  addUserPersona(persona: string): Promise<boolean>;
  clearUserPersona(persona: string): Promise<boolean>;
  clearAllUserPersonas(): Promise<boolean>;

  addBreadcrumb(event: string): Promise<boolean>;
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

export default TurboModuleRegistry.getEnforcing<Spec>("EmbraceManager");
