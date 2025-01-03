import {useEffect, useState} from "react";

import {SDKConfig} from "../interfaces/common";

import {initialize} from "./../index";

const useEmbrace = (sdkConfig: SDKConfig, debug: boolean = true) => {
  // States
  const [isPending, setIsPending] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  /**
   * Init SDK
   */
  useEffect(() => {
    const initSDK = async () => {
      const config = {
        sdkConfig,
        debug,
      };

      try {
        const isEmbraceStarted = await initialize(config);

        setIsPending(false);
        setIsStarted(isEmbraceStarted);
      } catch (error) {
        setIsPending(false);
      }
    };

    if (!isStarted) {
      initSDK();
    }
  }, [sdkConfig, isStarted, debug]);

  return {
    isPending,
    isStarted,
  };
};

export default useEmbrace;
