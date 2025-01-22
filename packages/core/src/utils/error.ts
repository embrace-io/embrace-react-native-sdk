import {EmbraceManagerModule} from "../EmbraceManagerModule";

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
    !!stackTrace,
  );
};

// [Unhandled Rejections](https://github.com/then/promise/blob/master/Readme.md#unhandled-rejections)
// [promise/setimmediate/rejection-tracking](https://github.com/then/promise/blob/master/src/rejection-tracking.js)
const tracking = require("promise/setimmediate/rejection-tracking");

const setUnhandledErrors = () => {
  tracking.enable({
    allRejections: true,
    onUnhandled: trackUnhandledError,
    onHandled: () => {},
  });
};

export {setUnhandledErrors, trackUnhandledError};
