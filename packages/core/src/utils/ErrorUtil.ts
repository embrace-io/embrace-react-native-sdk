import {UIError} from "..";

type ErrorHandler = (error: Error, callback: () => void) => void;

type GlobalErrorHandler = (
  // initial handler, coming from React Native
  previousHandler: (error: Error, isFatal?: boolean) => void,
  // custom handler, created by Embrace
  handleError: ErrorHandler,
) => (error: Error, isFatal?: boolean) => void;

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

const isJSXError = (error: Error | UIError): error is UIError => {
  return "componentStack" in error;
};

export {handleGlobalError, generateStackTrace, isJSXError};
