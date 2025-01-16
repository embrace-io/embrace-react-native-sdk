import {EmbraceManagerModule} from "../EmbraceManagerModule";

const tracking = require("promise/setimmediate/rejection-tracking");

const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";

const trackUnhandledError = (_: unknown, error: Error) => {
  let message = `${UNHANDLED_PROMISE_REJECTION_PREFIX}: ${error}`;
  let stackTrace = "";

  if (error instanceof Error) {
    message = `${UNHANDLED_PROMISE_REJECTION_PREFIX}: ${error.message}`;
    stackTrace = error.stack || "";
  }

  return EmbraceManagerModule.logMessageWithSeverityAndProperties(
    message,
    "error",
    {},
    stackTrace,
  );
};

const setUnhandledErrors = () => {
  tracking.enable({
    allRejections: true,
    onUnhandled: trackUnhandledError,
    onHandled: () => {},
  });
};

export {setUnhandledErrors, trackUnhandledError};
