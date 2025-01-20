type LogSeverity = "warning" | "info" | "error";

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

type EmbraceLoggerLevel = "info" | "error" | "warn";

export {LogSeverity, SessionStatus, MethodType, EmbraceLoggerLevel};
