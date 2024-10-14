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

export default function RootLayout() {
  const initWithCustomExporters = initEmbraceWithCustomExporters({
    // logExporter: {
    //   endpoint: "http://localhost:4317/v1/logs",
    //   header: {
    //     key: "a-key",
    //     token: "a-token",
    //   },
    //   timeout: 30000,
    // },
    traceExporter: {
      endpoint: "http://localhost:8080/otlp-http/v1/traces",
      // header: {
      //   key: "a-key",
      //   token: "a-token",
      // },
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
          replaceInit: initWithCustomExporters,
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
