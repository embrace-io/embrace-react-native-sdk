/**
 * Error Handling API
 *
 * Provides the global error handler that the Embrace SDK installs to capture unhandled
 * JavaScript exceptions and crashes. This module wraps React Native's `ErrorUtils` to
 * intercept uncaught errors, log them to the Embrace backend, and then forward them
 * to the previous error handler.
 *
 * This is set up automatically during SDK initialization and does not typically
 * need to be called directly by consumers.
 */

import {Platform} from "react-native";

import {logIfComponentError} from "./component";
import {EmbraceManagerModule} from "./../EmbraceManagerModule";

/** @internal */
type ErrorHandler = (error: Error, callback: () => void) => void;

/** @internal */
type GlobalErrorHandler = (
  // initial handler, coming from React Native
  previousHandler: (error: Error, isFatal?: boolean) => void,
  // custom handler, created by Embrace
  handleError: ErrorHandler,
) => (error: Error, isFatal?: boolean) => void;

/** Maximum number of stack trace lines to retain when logging exceptions. */
const STACK_LIMIT = 200;

/**
 * Creates a composed error handler that logs errors to Embrace before forwarding
 * to the previous global error handler.
 *
 * The previous handler is called after a short delay (150ms) to allow the Embrace
 * logging to complete before React Native's default crash behavior takes effect.
 *
 * @param previousHandler - The existing global error handler to forward errors to
 * @param handleError - The Embrace error handler that logs the exception
 * @returns A new error handler function to be set as the global handler
 *
 * @internal
 */
const handleGlobalError: GlobalErrorHandler =
  (previousHandler, handleError) => (error, isFatal) => {
    const callback = () => {
      setTimeout(() => {
        previousHandler(error, isFatal);
      }, 150);
    };
    handleError(error, callback);
  };

/**
 * Processes an unhandled JavaScript error by logging it to the Embrace backend.
 *
 * This function:
 * 1. Checks if the error includes a React component stack and logs it if present
 * 2. Truncates the stack trace to {@link STACK_LIMIT} lines
 * 3. Formats the stack trace for the current platform (JSON for iOS, plain text for Android)
 * 4. Sends the exception details to the native SDK
 * 5. Invokes the callback to forward to the previous error handler
 *
 * @param error - The unhandled Error object
 * @param callback - A function to call after logging completes (typically forwards to the previous handler)
 *
 * @internal
 */
const handleError = async (error: Error, callback: () => void) => {
  if (!(error instanceof Error)) {
    console.warn("[Embrace] error must be of type Error");
    return;
  }

  const {name, message, stack = ""} = error;

  logIfComponentError(error);

  // same as error.name? why is it pulled differently?
  const errorType = error.constructor.name;

  // truncating stacktrace to 200 lines
  const stTruncated = stack.split("\n").slice(0, STACK_LIMIT);

  // specifically for iOS for now, the same formatting is done in the Android layer
  // in the future Android will get rid of all related to js and use this format as well
  const iosStackTrace = JSON.stringify({
    n: name,
    m: message,
    t: errorType,
    // removing the Type from the first part of the stacktrace.
    st: stTruncated.slice(1, stTruncated.length).join("\n"),
  });

  let logException;
  try {
    logException = await EmbraceManagerModule.logUnhandledJSException(
      name,
      message,
      errorType,
      Platform.OS === "android" ? stTruncated.join("\n") : iosStackTrace,
    );
  } catch {
    logException = false;
  }

  if (!logException) {
    console.warn("[Embrace] Failed to log exception");
  }

  callback();
};

export {handleGlobalError, handleError};
