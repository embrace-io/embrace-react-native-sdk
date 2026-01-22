/**
 * Log API
 *
 * Provides methods for sending log messages to the Embrace backend. Unlike breadcrumbs,
 * log messages trigger an immediate network request and can be used for real-time alerting.
 * Use logs sparingly to avoid impacting app performance or battery life.
 *
 * @see {@link https://embrace.io/docs/react-native/integration/log-message-api | Log Message API Documentation}
 */

import {generateStackTrace} from "../utils/log";
import {LogSeverity, LogProperties} from "../interfaces";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Logs a message with the specified severity, optional properties, and optional stack trace.
 *
 * This is the most flexible logging method. For convenience, prefer using
 * {@link logInfo}, {@link logWarning}, or {@link logError} for common cases.
 *
 * @param message - The log message string. Keep this short yet informative.
 * @param severity - The severity level: `"info"`, `"warning"`, or `"error"`. Defaults to `"error"`.
 * @param properties - Optional key-value pairs for categorizing and filtering logs in the dashboard.
 * @param includeStacktrace - Whether to capture and attach a stack trace. Defaults to `true`.
 *   Note: stack traces are never included for `"info"` severity regardless of this setting.
 * @returns A promise that resolves to `true` if the log was successfully sent, `false` otherwise
 *
 * @example
 * ```typescript
 * import { logMessage } from '@embrace-io/react-native';
 *
 * logMessage('Loading not finished in time.', 'error', {
 *   screen: 'checkout',
 *   itemCount: '5',
 * });
 * ```
 */
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

/**
 * Logs an informational message.
 *
 * Info-level logs never include stack traces.
 *
 * @param message - The informational message to log
 * @returns A promise that resolves to `true` if the log was successfully sent, `false` otherwise
 *
 * @example
 * ```typescript
 * import { logInfo } from '@embrace-io/react-native';
 *
 * logInfo('User completed onboarding flow');
 * ```
 */
const logInfo = (message: string): Promise<boolean> => {
  // `"info"` logs are not supposed to send stack traces as per Product decision
  // this is also restricted in the Native layers
  return logMessage(message, "info", undefined, false);
};

/**
 * Logs a warning message with an optional stack trace.
 *
 * @param message - The warning message to log
 * @param includeStacktrace - Whether to capture and attach a stack trace. Defaults to `true`.
 * @returns A promise that resolves to `true` if the log was successfully sent, `false` otherwise
 *
 * @example
 * ```typescript
 * import { logWarning } from '@embrace-io/react-native';
 *
 * logWarning('API response took longer than expected');
 * ```
 */
const logWarning = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, "warning", undefined, includeStacktrace);
};

/**
 * Logs an error message with an optional stack trace.
 *
 * @param message - The error message to log
 * @param includeStacktrace - Whether to capture and attach a stack trace. Defaults to `true`.
 * @returns A promise that resolves to `true` if the log was successfully sent, `false` otherwise
 *
 * @example
 * ```typescript
 * import { logError } from '@embrace-io/react-native';
 *
 * logError('Failed to load user profile');
 * ```
 */
const logError = (
  message: string,
  includeStacktrace = true,
): Promise<boolean> => {
  return logMessage(message, "error", undefined, includeStacktrace);
};

/**
 * Logs a handled error (caught exception) along with its stack trace.
 *
 * Use this to report errors that your app caught and handled gracefully but that
 * you still want visibility into. The full stack trace from the Error object is
 * automatically included.
 *
 * @param error - The caught Error object to log. Must be an instance of Error.
 * @param properties - Optional key-value pairs for additional context
 * @returns A promise that resolves to `true` if the error was logged, `false` if the
 *   argument was not an Error instance or the log failed
 *
 * @example
 * ```typescript
 * import { logHandledError } from '@embrace-io/react-native';
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logHandledError(error, { operation: 'riskyOperation' });
 * }
 * ```
 */
const logHandledError = (
  error: Error,
  properties: LogProperties = {},
): Promise<boolean> => {
  if (error instanceof Error) {
    const {stack, message} = error;
    return EmbraceManagerModule.logHandledError(message, stack, properties);
  }

  return Promise.resolve(false);
};

export {logInfo, logWarning, logError, logHandledError, logMessage};
