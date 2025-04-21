import {ErrorInfo} from "react";

import {EmbraceManagerModule} from "../EmbraceManagerModule";

type ComponentError = Error & ErrorInfo;
const isJSXError = (error: Error): error is ComponentError => {
  return "componentStack" in error;
};

/**
 * Logs errors with additional React component stack information if available.
 *
 * This function checks if the provided error is a React Native rendering error
 * (i.e., it includes a `componentStack` property). If the `componentStack` is
 * present and non-empty the error details are logged using
 * `EmbraceManagerModule.logMessageWithSeverityAndProperties`, including the message
 * and the component stack trace.
 *
 * NOTES
 * - The `componentStack` provides a trace of the React component tree at the time
 *   of the error but does not include line or column numbers.
 * - This function is complementary to other logging mechanisms that capture more
 *   detailed stack traces, including line and column numbers.
 *
 * Example `componentStack` trace:
 * ```
 * in App
 * in RCTView
 * in Unknown
 * in AppContainer
 * ```
 *
 * @param error - The error object to be checked and logged.
 * @returns A promise that resolves to `true` if the error was logged, or `false`
 * if the error was not a React Native rendering error or the `componentStack` was empty.
 */
const logIfComponentError = (error: Error): Promise<boolean> => {
  if (!isJSXError(error) || error.componentStack === "") {
    return Promise.resolve(false);
  }

  const {message, componentStack} = error;
  return EmbraceManagerModule.logMessageWithSeverityAndProperties(
    message,
    "error",
    {},
    componentStack,
    true,
  );
};

export {logIfComponentError, ComponentError};
