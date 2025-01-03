import EmbraceLogger from "../logger";
import {
  AndroidConfig,
  IOSConfig,
  OTLPExporterConfig,
} from "../interfaces/common";

interface OTLPModule {
  initialize: (
    otlpExporterConfig: OTLPExporterConfig,
  ) => (sdkConfig: IOSConfig | AndroidConfig) => Promise<boolean>;
}

const RN_EMBRACE_OTLP_PATH =
  "../../../../../@embrace-io/react-native-otlp/lib/src";

class EmbraceOTLP {
  public module: OTLPModule | null = null;
  private logger: EmbraceLogger;

  constructor(logger: EmbraceLogger) {
    this.logger = logger;
  }

  public get = () => {
    // TBD: Still an issue with Metro bundler
    // https://github.com/facebook/metro/issues/666, will use require.context for now
    // this.module = require("@embrace-io/react-native-otlp");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const context = require.context(RN_EMBRACE_OTLP_PATH, false, /index\.js$/);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    context.keys().forEach(filename => {
      // Init RNEmbraceOTLP (if available)
      this.module = context(filename);
    });

    return module;
  };

  public set = (exporters: OTLPExporterConfig) => {
    if (this.module?.initialize) {
      this.logger.log(
        "@embrace-io/react-native-otlp` is installed and will be used",
      );

      return this.module?.initialize(exporters);
    } else {
      this.logger.log(
        "`@embrace-io/react-native-otlp` is not installed and it's required. OTLP exporters will not be used",
      );
    }
  };
}

export {EmbraceOTLP};
