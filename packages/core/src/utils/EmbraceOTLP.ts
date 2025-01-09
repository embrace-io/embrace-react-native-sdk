import {
  AndroidConfig,
  IOSConfig,
  OTLPExporterConfig,
} from "../interfaces/common";

import EmbraceLogger from "./EmbraceLogger";

interface Package {
  initialize: (
    otlpExporterConfig: OTLPExporterConfig,
  ) => (sdkConfig: IOSConfig | AndroidConfig) => Promise<boolean>;
}

const RN_EMBRACE_OTLP_PATH =
  "../../../../../@embrace-io/react-native-otlp/lib/src";

class EmbraceOTLP {
  public package: Package | null = null;
  private logger: EmbraceLogger;

  constructor(logger: EmbraceLogger) {
    this.logger = logger;
  }

  public get = () => {
    // TBD: Still an issue with Metro bundler
    // https://github.com/facebook/metro/issues/666, will use require.context for now
    // this.package = require("@embrace-io/react-native-otlp");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const context = require.context(RN_EMBRACE_OTLP_PATH, false, /index\.js$/);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    context.keys().forEach(filename => {
      // Init RNEmbraceOTLP (if available)
      this.package = context(filename);
    });

    return this.package;
  };

  public set = (exporters: OTLPExporterConfig) => {
    if (this.package?.initialize) {
      this.logger.log(
        "@embrace-io/react-native-otlp` is installed and will be used",
      );

      return this.package?.initialize(exporters);
    } else {
      this.logger.log(
        "`@embrace-io/react-native-otlp` is not installed and it's required. OTLP exporters will not be used",
      );
    }
  };
}

export default EmbraceOTLP;
