import {useEffect, useState} from "react";
import {
  initialize,
  useEmbraceIsStarted,
  useOrientationListener,
  SDKConfig,
} from "@embrace-io/react-native";

const HARNESS_SDK_CONFIG: SDKConfig = {trackUnhandledRejections: true};

export const useEmbraceSDK = () => {
  const isStartedNatively = useEmbraceIsStarted();
  const [isPending, setIsPending] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isStartedNatively === null) {
      return;
    }

    if (!isStartedNatively) {
      const err = new Error(
        "The Embrace native SDK was not started. The test harness requires Embrace to be started natively and will not start it from JavaScript.",
      );
      console.error(err);
      setError(err);
      setIsPending(false);
      return;
    }

    initialize({sdkConfig: HARNESS_SDK_CONFIG})
      .then(setIsStarted)
      .catch((e: Error) => {
        console.error(e);
        setError(e);
      })
      .finally(() => setIsPending(false));
  }, [isStartedNatively]);

  useOrientationListener(isStarted);

  return {isPending, isStarted, error};
};
