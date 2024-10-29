import {useEffect, useState, useMemo} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native";
  allowCustomExport?: boolean;
  allowExternalTelemetryInstrumentation?: boolean;
};

const ENDPOINT = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const GRAFANA_TOKEN = "base64:instance:token";

const OTLP_CUSTOM_CONFIG = {
  logExporter: {
    endpoint: `${ENDPOINT}/logs`,
    headers: [
      {
        key: "Authorization",
        token: `Basic ${GRAFANA_TOKEN}`,
      },
    ],
    timeout: 30000,
  },
  traceExporter: {
    endpoint: `${ENDPOINT}/traces`,
    headers: [
      {
        key: "Authorization",
        token: `Basic ${GRAFANA_TOKEN}`,
      },
    ],
  },
};

export const EmbraceTestHarness = ({
  sdkConfig,
  navigationStyle,
  allowCustomExport = false,
  allowExternalTelemetryInstrumentation = true,
}: Props) => {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);

  const startWithCustomExporters = useMemo(
    // returns a callback function that initializes Embrace with custom exporters
    () => initEmbraceWithCustomExporters(OTLP_CUSTOM_CONFIG),
    [],
  );

  useEffect(() => {
    if (!embraceLoaded) {
      const init = async () => {
        const config = {
          sdkConfig,
        };

        if (allowCustomExport) {
          config.sdkConfig.startCustomExport = startWithCustomExporters;
        }

        await initEmbrace(config);

        setEmbraceLoaded(true);
      };

      init();
    }
  }, [allowCustomExport, embraceLoaded]);

  if (!embraceLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading Embrace</Text>
      </View>
    );
  }

  if (navigationStyle === "expo") {
    return (
      <EmbraceExpoTestHarness
        allowExternalTelemetryInstrumentation={
          allowExternalTelemetryInstrumentation
        }
      />
    );
  } else {
    return (
      <EmbraceReactNativeTestHarness
        allowExternalTelemetryInstrumentation={
          allowExternalTelemetryInstrumentation
        }
      />
    );
  }
};
