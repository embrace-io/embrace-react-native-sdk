import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import "react-native-reanimated";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {initialize as initEmbraceWithCustomExporters} from "@embrace-io/react-native-otlp";

import {useColorScheme} from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const endpoint = "https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1";
const token = ""; // base64 -> instance:token

export default function RootLayout() {
  const initWithCustomExporters = initEmbraceWithCustomExporters({
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
  });

  useEffect(() => {
    const init = async () => {
      await initEmbrace({
        sdkConfig: {
          ios: {
            appId: "abcdf",
            // endpointBaseUrl: "http://localhost:8877",
          },
          replaceInit: initWithCustomExporters, // rename arg? (`startCustomExporters`),
        },
      });
    };

    init();
  }, []);

  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
