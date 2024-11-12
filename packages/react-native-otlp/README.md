# React Native Embrace - OTLP

The [OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otel/protocol/) (OTLP) is an open standard that enables the transfer of observability data—such as traces and logs—from applications to various monitoring and analytics backends. By adopting OTLP, developers can send telemetry data in a consistent format, making integration with multiple backends straightforward. 

This component provides an easy way to export trace and log data to any OTLP-compatible backend over HTTP. The component also keeps sending telemetry data to Embrace, ensuring continuous observability with Embrace’s platform while allowing users to export data to other observability backends.

# Requirements

It's mandatory for the use of this package to have previously installed `@embrace-io/react-native` and integrated. For more information visit our [docs](https://embrace.io/docs/react-native/integration/).

# Integration

## Add the JavaScript library

```sh
npm install @embrace-io/react-native-otlp
```

Or

```sh
yarn add @embrace-io/react-native-otlp
```

For iOS you will also need to install or update pods for the application:

```shell
// <root_app>/ios
cd ios && pod install --repo-update
```

## Initialize

For this example we will use Grafana Cloud in terms of redirecting telemetry data over there using OTLP endpoints. For more information about this please visit their online (docs)[https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/]

```javascript
import React, {useEffect, useMemo, useState} from "react";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {View, Text} from "react-native";
import {Stack} from "expo-router";

// NOTE: for this particular case where we use Grafana Cloud this token should be passed with the format `instance:token` converted into a base64 string.
const token = "base64:instance:token";

function RootLayout() {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);

  const handleStartCustomExporters = useMemo(
    () =>
      // returns a callback that need to be passed to the Embrace React Native SDK configuration
      initEmbraceWithCustomExporters({
        logExporter: {
          endpoint:
            "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/logs",
          headers: [
            {
              key: "Authorization",
              token: `Basic ${token}`,
            },
          ],
        },
        traceExporter: {
          endpoint:
            "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/traces",
          headers: [
            {
              key: "Authorization",
              token: `Basic ${token}`,
            },
          ],
        },
      }),
    [],
  );

  useEffect(() => {
    const init = async () => {
      await initEmbrace({
        sdkConfig: {
          // this is the minimum of configuration needed at this point,
          // for more information please refer to docs under @embrace-io/react-native.
          // iOS is configurable through code, Android configuration happens at build time
          ios: {
            appId: "abcde",
          },
          // inject here the new method for initialize the Embrace React Native SDK using custom export
          startCustomExport: handleStartCustomExporters,
        },
      });

      setEmbraceLoaded(true);
    };

    init();
  }, [onStartCustomExporters]);

  if (!embraceLoaded) {
    return (
      <View>
        <Text>Loading Embrace</Text>
      </View>
    );
  }

  // regular content of the application
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
    </Stack>
  );
}

export default RootLayout;

```

## Troubleshooting

Please refer to our [complete integration guide](https://embrace.io/docs/react-native/integration/). If you continue
to run into issues please [contact us directly](mailto:support@embrace.io) or reach out in our [Community Slack](https://community.embrace.io)
