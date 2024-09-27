import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import {Stack, useNavigationContainerRef} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect, useMemo, useState} from "react";
import "react-native-reanimated";
import {initialize as initEmbrace} from "@embrace-io/react-native";

import {useColorScheme} from "@/hooks/useColorScheme";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [embraceSDKLoaded, setEmbraceSDKLoaded] = useState<boolean>(false);
  const {tracerProvider} = useEmbraceNativeTracerProvider({}, embraceSDKLoaded);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const init = async () => {
      const hasStarted = await initEmbrace({
        sdkConfig: {
          ios: {
            appId: "cvKeD",
            endpointBaseUrl: "http://localhost:8877",
            disableAutomaticViewCapture: true,
          },
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
