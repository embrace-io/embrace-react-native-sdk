/**
 * Common interfaces shared by Embrace Packages
 */

import {EmbraceLoggerLevel} from "./types";

interface SDKConfig {
  /**
   * @deprecated `sdkConfig.ios` is deprecated and will be removed in the next major release. Start Embrace in native code instead: https://embrace.io/docs/react-native/integration/session-reporting/#start-embrace-sdk-in-the-native-side
   */
  ios?: IOSConfig;
  logLevel?: EmbraceLoggerLevel;
  trackUnhandledRejections?: boolean;
}

// Today Android is not configurable through code,
// this is a placeholder for future implementations.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AndroidConfig {}

interface IOSConfig {
  appId?: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  disableNetworkSpanForwarding?: boolean;
  endpointBaseUrl?: string;
  disabledUrlPatterns?: string[];
}

interface LogProperties {
  [key: string]: string;
}

export {SDKConfig, IOSConfig, AndroidConfig, LogProperties};
