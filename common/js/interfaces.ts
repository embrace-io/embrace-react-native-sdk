/**
 * Common interfaces shared by Embrace Packages
 */

import {EmbraceLoggerLevel} from "./types";

interface SDKConfig {
  ios?: IOSConfig;
  exporters?: OTLPExporterConfig;
  logLevel?: EmbraceLoggerLevel;
  trackUnhandledRejections?: boolean;
}

// Today Android is not configurable through code,
// this is a placeholder for future implementations.
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
