/**
 * Common interfaces shared by Embrace Packages
 */

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  disableNetworkSpanForwarding?: boolean;
  endpointBaseUrl?: string;
}

// NOTE
// Today Android is not configurable through code,
// this is a placeholder for future implementations.
interface AndroidConfig {}

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  disableNetworkSpanForwarding?: boolean;
  endpointBaseUrl?: string;
  disabledUrlPatterns?: string[];
}

interface SDKConfig {
  ios?: IOSConfig;
  startCustomExport?: (
    config: IOSConfig | NonNullable<object>,
  ) => Promise<boolean>;
}

enum LogSeverity {
  WARNING = "warning",
  INFO = "info",
  ERROR = "error",
}

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
};
