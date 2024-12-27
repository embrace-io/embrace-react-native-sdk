import {useEffect, useRef, useState} from "react";

import {SDKConfig} from "../interfaces/common";

import {initialize} from "./../index";

const RN_EMBRACE_OTLP_PATH =
  "../../../../../@embrace-io/react-native-otlp/lib/src";

class Logger {
  constructor(enabled = true) {
    if (!enabled) {
      this.log = () => {};
      this.warn = () => {};
      this.error = () => {};
      return;
    }

    this.log = this.log.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
  }

  log(message: string) {
    console.log(`[Embrace] ${message}`);
  }

  warn(message: string) {
    console.warn(`[Embrace] ${message}`);
  }

  error(message: string) {
    console.error(`[Embrace] ${message}`);
  }
}

// Placeholder for `@embrace-io/react-native-otlp`
let RNEmbraceOTLP: {
  initialize: (exporters: {
    logExporter?: unknown;
    traceExporter?: unknown;
  }) => SDKConfig["startCustomExport"];
} | null = null;

const useEmbrace = (
  sdkConfig: SDKConfig,
  exporters?: {logExporter?: unknown; traceExporter?: unknown},
  debug: boolean = true,
) => {
  // Debug
  const logger = useRef(new Logger(debug));

  // States
  const [isPending, setIsPending] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  /**
   * Init OTLP (if available)
   */
  useEffect(() => {
    try {
      // TBD: Still an issue with Metro bundler
      // https://github.com/facebook/metro/issues/666, will use require.context for now
      // RNEmbraceOTLP = require("@embrace-io/react-native-otlp");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const context = require.context(
        RN_EMBRACE_OTLP_PATH,
        false,
        /index\.js$/,
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.keys().forEach(filename => {
        RNEmbraceOTLP = context(filename);

        if (exporters) {
          const message = RNEmbraceOTLP?.initialize
            ? "`@embrace-io/react-native-otlp` is installed and will be used"
            : "`@embrace-io/react-native-otlp` is not installed";

          logger.current.log(message);
        }
      });
    } catch {
      if (exporters) {
        logger.current.error(
          "`@embrace-io/react-native-otlp` is not installed",
        );
      }
    }
  }, [exporters]);

  /**
   * Init SDK
   */
  useEffect(() => {
    const initSDK = async () => {
      const config = {
        sdkConfig,
      };

      // Handling OTLP
      if (exporters && RNEmbraceOTLP) {
        config.sdkConfig.startCustomExport =
          RNEmbraceOTLP.initialize(exporters);
      }

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
  }, [sdkConfig, exporters, isStarted]);

  return {
    isPending,
    isStarted,
  };
};

export default useEmbrace;
