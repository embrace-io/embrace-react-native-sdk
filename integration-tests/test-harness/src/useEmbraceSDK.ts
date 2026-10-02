import {useEffect, useState} from "react";
import {
  initialize,
  useEmbraceIsStarted,
  useOrientationListener,
  SDKConfig,
} from "@embrace-io/react-native";

const HARNESS_SDK_CONFIG: SDKConfig = {trackUnhandledRejections: true};

const initializeStartedNatively = async (startedNatively: boolean) => {
  if (!startedNatively) {
    throw new Error(
      "The Embrace native SDK was not started. The test harness requires Embrace to be started natively and will not start it from JavaScript.",
    );
  }

  return initialize({sdkConfig: HARNESS_SDK_CONFIG});
};

export const useEmbraceSDK = () => {
  const startedNatively = useEmbraceIsStarted();
  const [isPending, setIsPending] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (startedNatively === null) {
      return;
    }

    initializeStartedNatively(startedNatively)
      .then(setIsStarted)
      .catch((e: Error) => {
        console.error(e);
        setError(e);
      })
      .finally(() => setIsPending(false));
  }, [startedNatively]);

  useOrientationListener(isStarted);

  return {isPending, isStarted, error};
};
