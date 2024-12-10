import {EmbraceManagerModule} from "../EmbraceManagerModule";

interface ComponentError extends Error {
  componentStack: string;
}

const isJSXError = (error: Error): error is ComponentError => {
  return "componentStack" in error;
};

const undefinedInComponentStackRegex = /at undefined \((.*)\)/g;

/**
 * Logs errors with additional React component stack information if available.
 *
 * This function checks if the provided error is a React Native rendering error
 * (i.e., it includes a `componentStack` property). If the `componentStack` is
 * present and non-empty, the error details, including the message and the component
 * stack trace, are logged using `EmbraceManager.logHandledError`.
 *
 * **Important Notes:**
 * - The `componentStack` provides a trace of the React component tree at the time
 *   of the error but does not include line or column numbers.
 * - This function is complementary to other logging mechanisms that capture more
 *   detailed stack traces, including line and column numbers.
 * - By default, in release builds, the screen names in the `componentStack` appear as
 *   `Unknown`. To retain meaningful screen names in release builds, you must configure
 *   Metro to preserve the names of React components during minification. For detailed
 *   instructions, refer to https://docs.embrace.io/docs/react-native/features/tracking-error-component/.
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

  const componentStackShrinked = componentStack.replace(
    undefinedInComponentStackRegex,
    "$1",
  );

  return EmbraceManagerModule.logHandledError(
    message,
    componentStackShrinked,
    {},
  );
};

export {logIfComponentError, ComponentError};
