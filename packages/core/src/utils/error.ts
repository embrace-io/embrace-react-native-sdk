import {EmbraceManagerModule} from "../EmbraceManagerModule";

const UNHANDLED_PROMISE_REJECTION_PREFIX = "Unhandled promise rejection";

const trackUnhandledRejection = (_: unknown, error: Error) => {
  let message = `${UNHANDLED_PROMISE_REJECTION_PREFIX}: ${error}`;
  let stackTrace = "";

  if (error && error.message) {
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

const REJECTION_TRACKING_CONFIG = {
  allRejections: true,
  onUnhandled: trackUnhandledRejection,
  onHandled: () => {},
};

const enableUnhandledRejectionTracking = () => {
  // @ts-expect-error to allow for checking if HermesInternal exists on `global` since it isn't part of its type
  const hermesInternal = global?.HermesInternal;

  // Do the same checking as react-native to make sure we add tracking to the right Promise implementation
  // https://github.com/facebook/react-native/blob/v0.77.0/packages/react-native/Libraries/Core/polyfillPromise.js#L25
  if (hermesInternal?.hasPromise?.()) {
    hermesInternal?.enablePromiseRejectionTracker?.(REJECTION_TRACKING_CONFIG);
  } else {
    // [Unhandled Rejections](https://github.com/then/promise/blob/master/Readme.md#unhandled-rejections)
    // [promise/setimmediate/rejection-tracking](https://github.com/then/promise/blob/master/src/rejection-tracking.js)
    require("promise/setimmediate/rejection-tracking").enable(
      REJECTION_TRACKING_CONFIG,
    );
  }
};

export {enableUnhandledRejectionTracking, trackUnhandledRejection};
