/**
 * Common interfaces shared by Embrace Packages
 */

interface SDKConfig {
  ios?: IOSConfig;
  exporters?: OTLPExporterConfig;
  debug?: boolean;
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

interface ExporterConfig {
  endpoint: string;
  headers?: {key: string; token: string}[];
  timeout?: number;
}

interface OTLPExporterConfig {
  logExporter?: ExporterConfig;
  traceExporter?: ExporterConfig;
  otlpPackagePath?: string;
}

type LogSeverity = "warning" | "info" | "error";

interface LogProperties {
  [key: string]: string;
}

type SessionStatus = "INVALID" | "CRASH" | "CLEAN_EXIT";

type MethodType =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "purge"
  | "PURGE"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK"
  | "connect"
  | "CONNECT"
  | "trace"
  | "TRACE";

export {
  SDKConfig,
  IOSConfig,
  AndroidConfig,
  LogSeverity,
  LogProperties,
  SessionStatus,
  MethodType,
  OTLPExporterConfig,
  ExporterConfig,
};
