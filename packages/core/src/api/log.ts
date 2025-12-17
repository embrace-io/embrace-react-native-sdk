import { generateStackTrace } from "../utils/log";
import { LogSeverity, LogProperties } from "../interfaces";
import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const logMessage = (
  message: string,
  severity: LogSeverity = "error",
  // Android Native method is handling the null case
  // iOS Native method is waiting for a non-nullable object
  properties: LogProperties = {},
  includeStacktrace = true,
): Promise<boolean> => {
  const stackTrace =
    // `"info"` are not supposed to send stack traces
    // this is also restricted in the Native layers
    includeStacktrace && severity !== "info" ? generateStackTrace() : "";

  if (properties === null) {
    console.warn(
      "[Embrace] `properties` is null. It should be an object of type `Properties`. Native layer will ignore this value.",
    );
  }

  return EmbraceManagerModule.logMessageWithSeverityAndProperties(
    message,
    severity,
    properties,
    stackTrace,
    includeStacktrace,
  );
};

const logMessageFireAndForget = (
  message: string,
  severity: LogSeverity = "error",
  properties: LogProperties = {},
  includeStacktrace = true,
): void => {
  handleSDKPromiseRejection(logMessage(message, severity, properties, includeStacktrace), "logMessage");
};

const logInfo = (message: string): Promise<boolean> => {
  // `"info"` logs are not supposed to send stack traces as per Product decision
  // this is also restricted in the Native layers
  return logMessage(message, "info", undefined, false);
};

const logInfoFireAndForget = (message: string): void => {
  void logMessageFireAndForget(message, "info", undefined, false);
}

const logWarning = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, "warning", undefined, includeStacktrace);
};

const logWarningFireAndForget = (
  message: string,
  includeStacktrace = true,
): void => {
  void logMessageFireAndForget(message, "warning", undefined, includeStacktrace);
}

const logError = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, "error", undefined, includeStacktrace);
};

const logErrorFireAndForget = (
  message: string,
  includeStacktrace = true,
): void => {
  void logMessageFireAndForget(message, "error", undefined, includeStacktrace);
}

const logHandledError = (
  error: Error,
  properties: LogProperties = {},
): Promise<boolean> => {
  if (error instanceof Error) {
    const { stack, message } = error;
    return EmbraceManagerModule.logHandledError(message, stack, properties);
  }

  return Promise.resolve(false);
};

const logHandledErrorFireAndForget = (
  error: Error,
  properties: LogProperties = {},
): void => {
  handleSDKPromiseRejection(logHandledError(error, properties), "logHandledError");
}

export { logInfo, logInfoFireAndForget, logWarning, logWarningFireAndForget, logError, logErrorFireAndForget, logHandledError, logHandledErrorFireAndForget, logMessage, logMessageFireAndForget };
