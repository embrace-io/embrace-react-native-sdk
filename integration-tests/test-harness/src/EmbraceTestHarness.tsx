import {useEffect, useState, useMemo} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native";
  allowCustomExport?: boolean;
};

const endpoint = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const token = "base64:instance:token";

export const EmbraceTestHarness = ({
  sdkConfig,
  navigationStyle,
  allowCustomExport = false,
}: Props) => {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);

  /*
  TODO EMBR-5735, restore this when ready to release the otlp package
  const initWithCustomExporters = useMemo(
    () =>
      initEmbraceWithCustomExporters({
        logExporter: {
          endpoint: `${endpoint}/logs`,
          headers: [
            {
              key: "Authorization",
              token: `Basic ${token}`,
            },
          ],
          timeout: 30000,
        },
        traceExporter: {
          endpoint: `${endpoint}/traces`,
          headers: [
            {
              key: "Authorization",
              token: `Basic ${token}`,
            },
          ],
          timeout: 30000,
        },
      }),
    [],
  );
   */

  useEffect(() => {
    const init = async () => {
      const config = {
        sdkConfig,
      };

      if (allowCustomExport) {
        // config.sdkConfig.startCustomExport = initWithCustomExporters;
        console.log(
          "not allowing custom export yet, would have setup with: ",
          endpoint,
          ", ",
          token,
        );
      }

      await initEmbrace(config);

      setEmbraceLoaded(true);
    };

    init();
  }, [allowCustomExport]);

  if (!embraceLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading Embrace</Text>
      </View>
    );
  }

  if (navigationStyle === "expo") {
    return <EmbraceExpoTestHarness />;
  } else {
    return <EmbraceReactNativeTestHarness />;
  }
};
