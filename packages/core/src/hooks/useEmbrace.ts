import {useEffect, useState} from "react";

import {SDKConfig, EmbraceLoggerLevel} from "../interfaces";
import {initialize} from "../index";

const useEmbrace = (
  sdkConfig: SDKConfig,
  patch?: string,
  logLevel?: EmbraceLoggerLevel,
) => {
  // States
  const [isPending, setIsPending] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  /**
   * Init SDK
   */
  useEffect(() => {
    const initSDK = async () => {
      const config = {
        patch,
        sdkConfig,
        logLevel,
      };

      try {
        const isEmbraceStarted = await initialize(config);
        setIsStarted(isEmbraceStarted);
      } finally {
        setIsPending(false);
      }
    };

    if (!isStarted) {
      initSDK();
    }
  }, [sdkConfig, isStarted, logLevel, patch]);

  return {
    isPending,
    isStarted,
  };
};

export {useEmbrace};
