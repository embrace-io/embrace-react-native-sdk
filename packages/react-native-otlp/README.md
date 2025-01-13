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

For this example we will use Grafana Cloud in terms of redirecting telemetry data over there using OTLP endpoints. For more information about this please visit their online [docs](https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/).

```javascript
import React, {useEffect, useMemo, useState} from "react";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";
import {useEmbrace} from "@embrace-io/react-native";
import {View, Text} from "react-native";
import {Stack} from "expo-router";

// for this particular case where we use Grafana Cloud this token should be passed with the format `instance:token` converted into a base64 string.
const GRAFANA_TOKEN = "base64(instance:token)";
const EXPORT_CONFIG = {
  logExporter: {
    endpoint: "https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/logs",
    headers: [
      {
        key: "Authorization",
        token: `Basic ${GRAFANA_TOKEN}`,
      },
    ],
  },
  traceExporter: {
    endpoint:
      "https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces",
    headers: [
      {
        key: "Authorization",
        token: `Basic ${GRAFANA_TOKEN}`,
      },
    ],
  },
};

// this is the minimum of configuration needed at this point,
// for more information please refer to docs under [`@embrace-io/react-native`](../core).
// iOS is configurable through code, Android configuration happens at build time
const SDK_CONFIG = {appId: "abcde"};

function RootLayout() {
  const {isPending, isStarted} = useEmbrace({
    ios: SDK_CONFIG,
    exporters: EXPORT_CONFIG,
    debug: true,
  });

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text>Loading Embrace</Text>
      </View>
    );
  } else {
    if (!isStarted) {
      console.log('An error occurred during Embrace initialization');
    }
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

## Initializing in the Native Layer

If you already have the Embrace React Native SDK initialized in the Native Side or if you are planning to run the install scripts mentioned in our docs section you could still get benefit of the OTLP custom export feature. Remember that the the install scripts are adding the minimum code needed for initializing Embrace in the Native side but are not integrating the configuration for exporting the telemetry data into your backend of your choice. For this you would need to tweak manually both the Android/iOS sides.

### iOS

If you already ran the install script mentioned above you would be able to find the `EmbraceInitializer.swift` file with some initial code that you can update:

```swift
import Foundation
import EmbraceIO
import RNEmbraceOTLP // Do not forget to import `RNEmbraceOTLP` module which will make the proper classes available

let GRAFANA_AUTH_TOKEN = "Basic __YOUR TOKEN__"
let GRAFANA_TRACES_ENDPOINT = "https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces"
let GRAFANA_LOGS_ENDPOINT = "https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/logs"

@objcMembers class EmbraceInitializer: NSObject {
    static func start() -> Void {
        do {
          // Preparing Span Exporter config with the minimum required
          let traceExporter = OtlpHttpTraceExporter(endpoint: URL(string: GRAFANA_TRACES_ENDPOINT)!,
            config: OtlpConfiguration(
                headers: [("Authorization", GRAFANA_AUTH_TOKEN)]
            )
          )
          
          // Preparing Log Exporter config with the minimum required
          let logExporter = OtlpHttpLogExporter(endpoint: URL(string: GRAFANA_LOGS_ENDPOINT)!,
             config: OtlpConfiguration(
                headers: [("Authorization", GRAFANA_AUTH_TOKEN)]
             )
          )
          
          try Embrace
              .setup(
                  options: Embrace.Options(
                      appId: "__YOUR APP ID__",
                      platform: .reactNative,
                      export: OpenTelemetryExport(spanExporter: traceExporter, logExporter: logExporter) // passing the configuration into `export`
                  )
              )
              .start()
        } catch let e {
            print("Error starting Embrace \(e.localizedDescription)")
        }
    }
}
```

## Android

Similar to iOS, if you already ran the install script you will see the following line already in place in your `MainApplication` file:

```
Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE)
```

Tweak the `onCreate` method using this following this snippet to initialize the exporters with the minimum configuration needed. Notice that you already have all of what you need, so no extra imports are required into this file.

```kotlin
// Preparing Span Exporter config with the minimum required
val spanExporter = OtlpHttpSpanExporter.builder()
                                .setEndpoint("https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces")
                                .addHeader("Authorization", "Basic __YOUR TOKEN__")

// Preparing Log Exporter config with the minimum required
val logExporter = OtlpHttpLogRecordExporter.builder()
                                .setEndpoint("https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/logs")
                                .addHeader("Authorization", "Basic __YOUR TOKEN__")

Embrace.getInstance().addSpanExporter(spanExporter.build())
Embrace.getInstance().addLogRecordExporter(logExporter.build())

// This is the line already added by the install script
Embrace.getInstance().start(this, false, Embrace.AppFramework.REACT_NATIVE)
```


## Troubleshooting

Please refer to our [complete integration guide](https://embrace.io/docs/react-native/integration/). If you continue
to run into issues please [contact us directly](mailto:support@embrace.io) or reach out in our [Community Slack](https://community.embrace.io)
