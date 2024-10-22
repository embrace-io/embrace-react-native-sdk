import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, {useMemo, useEffect} from "react";
import "react-native-reanimated";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";
import {EmbraceTestHarness} from "@embrace-io/react-native-test-harness";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const endpoint = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const token = ""; // base64 -> instance:token

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

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <EmbraceTestHarness
      navigationStyle="expo"
      sdkConfig={{
        ios: {
          appId: "abcdf",
          endpointBaseUrl: "http://localhost:8877",
          disableAutomaticViewCapture: true,
          replaceInit: initWithCustomExporters, // rename arg? (`startCustomExporters`),
        },
      }}
    />
  );
}
