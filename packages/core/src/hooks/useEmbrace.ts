import {useEffect, useState} from "react";

import {SDKConfig} from "../interfaces";

import {initialize} from "./../index";

const useEmbrace = (
  sdkConfig: SDKConfig,
  patch?: string,
  debug: boolean = true,
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
        debug,
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
  }, [sdkConfig, isStarted, debug, patch]);

  return {
    isPending,
    isStarted,
  };
};

export default useEmbrace;
