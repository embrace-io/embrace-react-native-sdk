/**
 * Common interfaces shared by Embrace Packages
 */

import {EmbraceLoggerLevel} from "./types";

interface SDKConfig {
  /**
   * @deprecated `sdkConfig.ios` is deprecated and will be removed in the next major release. Start Embrace in native code instead: https://embrace.io/docs/react-native/integration/session-reporting/#start-embrace-sdk-in-the-native-side
   */
  ios?: IOSConfig;
  /**
   * @deprecated `sdkConfig.exporters` is deprecated and will be removed in the next major release. Start Embrace and configure OTLP exporters in native code instead: https://embrace.io/docs/react-native/features/otlp/#initializing-in-the-native-layer
   */
  exporters?: OTLPExporterConfig;
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

interface ExporterConfig {
  endpoint: string;
  headers?: {key: string; token: string}[];
  timeout?: number;
}

interface OTLPExporterConfig {
  logExporter?: ExporterConfig;
  traceExporter?: ExporterConfig;
}

export {
  SDKConfig,
  IOSConfig,
  AndroidConfig,
  LogProperties,
  ExporterConfig,
  OTLPExporterConfig,
};
