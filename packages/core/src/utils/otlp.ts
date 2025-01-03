import EmbraceLogger from "../logger";
import {
  AndroidConfig,
  IOSConfig,
  OTLPExporterConfig,
} from "../interfaces/common";

const RN_EMBRACE_OTLP_PATH =
  "../../../../../@embrace-io/react-native-otlp/lib/src";

// Placeholder for `@embrace-io/react-native-otlp`
let RNEmbraceOTLP: {
  initialize: (
    otlpExporterConfig: OTLPExporterConfig,
  ) => (sdkConfig: IOSConfig | AndroidConfig) => Promise<boolean>;
} | null = null;

const getEmbraceOTLP = () => {
  // TBD: Still an issue with Metro bundler
  // https://github.com/facebook/metro/issues/666, will use require.context for now
  // RNEmbraceOTLP = require("@embrace-io/react-native-otlp");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const context = require.context(RN_EMBRACE_OTLP_PATH, false, /index\.js$/);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  context.keys().forEach(filename => {
    // Init OTLP (if available)
    RNEmbraceOTLP = context(filename);
  });

  return RNEmbraceOTLP;
};

const setEmbraceOTLP = (
  logger: EmbraceLogger,
  otlpExporters: OTLPExporterConfig,
) => {
  let startNativeEmbraceSDKWithOTLP:
    | ((sdkConfig: IOSConfig | AndroidConfig) => Promise<boolean>)
    | null = null;

  if (RNEmbraceOTLP?.initialize) {
    startNativeEmbraceSDKWithOTLP = RNEmbraceOTLP?.initialize(otlpExporters);

    logger.log("@embrace-io/react-native-otlp` is installed and will be used");
  } else {
    logger.log(
      "`@embrace-io/react-native-otlp` is not installed and it's required. OTLP exporters will not be used",
    );
  }

  return startNativeEmbraceSDKWithOTLP;
};

export {getEmbraceOTLP, setEmbraceOTLP};
