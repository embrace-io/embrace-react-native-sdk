import {AndroidConfig, IOSConfig, OTLPExporterConfig} from "../interfaces";

import EmbraceLogger from "./EmbraceLogger";

interface Package {
  initialize: (
    otlpExporterConfig: OTLPExporterConfig,
  ) => (sdkConfig: IOSConfig | AndroidConfig) => Promise<boolean>;
}

// should represent the relative path from `@embrace-io/react-native` to `@embrace-io/react-native-otlp` package,
// both installed in the `node_modules` folder assuming the structure:
// node_modules
// └── @embrace-io
//     ├── react-native
//     │   └── lib
//     │       └── src
//     │           └── utils
//     │               ├── EmbraceOTLP.js
//     │               └── ...
//     └── react-native-otlp
//         └── lib
//             └── src
//                 ├── index.js
//                 └── ...
const RN_EMBRACE_OTLP_PATH =
  "../../../../../@embrace-io/react-native-otlp/lib/src";

class EmbraceOTLP {
  public package: Package | null = null;
  private logger: EmbraceLogger;

  constructor(logger: EmbraceLogger) {
    this.logger = logger;

    try {
      // there is an issue with Metro bundler (https://github.com/facebook/metro/issues/666)
      // that doesn't allow to import the package dynamically
      // this.package = require("@embrace-io/react-native-otlp");

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
        // init RNEmbraceOTLP (if available)
        this.package = context(filename);
      });
    } catch {
      this.logger.error(
        "an error ocurred when checking if `@embrace-io/react-native-otlp` was installed",
      );
    }
  }

  public getStart = (exporters: OTLPExporterConfig) => {
    if (this.package?.initialize) {
      this.logger.log(
        "`@embrace-io/react-native-otlp` is installed and will be used",
      );

      return this.package?.initialize(exporters);
    } else {
      this.logger.log(
        "`@embrace-io/react-native-otlp` is not installed and it's required. OTLP exporters won't be used",
      );
    }
  };
}

export default EmbraceOTLP;
