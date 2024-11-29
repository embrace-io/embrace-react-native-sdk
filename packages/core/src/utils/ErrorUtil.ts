"use strict";

import {NativeModules, Platform} from "react-native";

import {logIfComponentError} from "./ComponentError";

type ErrorHandler = (error: Error, callback: () => void) => Promise<boolean>;

type GlobalErrorHandler = (
  // initial handler, coming from React Native
  previousHandler: (error: Error, isFatal?: boolean) => void,
  // custom handler, created by Embrace
  handleError: ErrorHandler,
) => (error: Error, isFatal?: boolean) => void;

const STACK_LIMIT = 200;

const handleGlobalError: GlobalErrorHandler =
  (previousHandler, handleError) => (error, isFatal) => {
    const callback = () => {
      setTimeout(() => {
        previousHandler(error, isFatal);
      }, 150);
    };
    handleError(error, callback);
  };

const generateStackTrace = (): string => {
  const err = new Error();
  return err.stack || "";
};

// will cover unhandled errors, js crashes
const handleError = async (error: Error, callback: () => void) => {
  if (!(error instanceof Error)) {
    console.warn("[Embrace] error must be of type Error");
    return Promise.resolve(false);
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

  await NativeModules.EmbraceManager.logUnhandledJSException(
    name,
    message,
    errorType,
    Platform.OS === "android" ? stTruncated.join("\n") : iosStackTrace,
  );

  callback();
  return Promise.resolve(true);
};

export {handleGlobalError, generateStackTrace, handleError};
export {STACK_LIMIT};
