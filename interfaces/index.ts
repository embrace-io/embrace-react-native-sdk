/**
 * Common interfaces shared by packages
 */

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

// NOTE: as per today Android is not configurable through code, this is a placeholder for future implementations.
// Not even sure if it will ever happen
interface AndroidConfig {}

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

interface SDKConfig {
  ios?: IOSConfig;
  startCustomExport?: (
    config: IOSConfig | NonNullable<object>,
  ) => Promise<boolean>;
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
};
