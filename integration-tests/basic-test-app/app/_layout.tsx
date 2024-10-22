import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import {Stack, useNavigationContainerRef} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect, useMemo, useState} from "react";
import "react-native-reanimated";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";

import {useColorScheme} from "@/hooks/useColorScheme";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import React from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const endpoint = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const token = ""; // base64 -> instance:token

export default function RootLayout() {
  const [embraceSDKLoaded, setEmbraceSDKLoaded] = useState<boolean>(false);
  const {tracerProvider} = useEmbraceNativeTracerProvider({}, embraceSDKLoaded);
  const navigationRef = useNavigationContainerRef();

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

  useEffect(() => {
    const init = async () => {
      const hasStarted = await initEmbrace({
        sdkConfig: {
          ios: {
            appId: "abcdf",
            // endpointBaseUrl: "http://localhost:8877",
            disableAutomaticViewCapture: true,
          },
          replaceInit: initWithCustomExporters, // rename arg? (`startCustomExporters`),
        },
      });

      if (hasStarted) {
        setEmbraceSDKLoaded(true);
      }
    };

    init();
  }, []);

  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const loaded = useMemo<boolean>(() => {
    return embraceSDKLoaded && fontsLoaded && !!tracerProvider;
  }, [embraceSDKLoaded, fontsLoaded, tracerProvider]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavigationTracker
        // @ts-ignore
        ref={navigationRef}
        provider={tracerProvider || undefined}
        config={{
          attributes: {
            "emb.type": "ux.view",
          },
          debug: true,
        }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </NavigationTracker>
    </ThemeProvider>
  );
}
