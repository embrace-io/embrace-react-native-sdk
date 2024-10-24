import React, {useMemo} from "react";
import "react-native-reanimated";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";
import {EmbraceTestHarness} from "@embrace-io/react-native-test-harness";
import sdkConfig from "./embrace-sdk-config.json";

const endpoint = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const token = "base64:instance:token";

export default function RootLayout() {
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

  return (
    <EmbraceTestHarness
      navigationStyle="expo"
      sdkConfig={{...sdkConfig, startCustomExport: initWithCustomExporters}}
    />
  );
}
