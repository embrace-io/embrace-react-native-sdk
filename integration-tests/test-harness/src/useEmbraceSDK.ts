import {useEffect} from "react";
import {
  useEmbrace,
  useEmbraceIsStarted,
  useOrientationListener,
  SDKConfig,
} from "@embrace-io/react-native";

export const useEmbraceSDK = (
  sdkConfig: SDKConfig,
  allowCustomExport?: boolean,
) => {
  if (!allowCustomExport) {
    sdkConfig.exporters = undefined;
  }

  const alreadyStarted = useEmbraceIsStarted();
  const {isPending, isStarted} = useEmbrace(sdkConfig);

  useEffect(() => {
    if (alreadyStarted === null) {
      return;
    }

    if (alreadyStarted) {
      console.log(
        "Embrace SDK has already been started, sdkConfig won't have an effect",
      );
    } else {
      console.log(
        `Embrace SDK will be started using the following config: ${JSON.stringify(sdkConfig, null, 2)}`,
      );
    }
  }, [alreadyStarted]);

  useOrientationListener(isStarted);

  return {isPending, isStarted};
};
