import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect, useMemo, useState} from "react";
import "react-native-reanimated";
import {
  initialize as initEmbrace,
  endAppStartup as endEmbraceAppStartup,
} from "@embrace-io/react-native";

import {useColorScheme} from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [embraceSDKLoaded, setEmbraceSDKLoaded] = useState<boolean>(false)
  useEffect(() => {
    const init = async () => {
      const hasStarted = await initEmbrace();

      if (hasStarted) {
        endEmbraceAppStartup();
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
    return embraceSDKLoaded && fontsLoaded;
  }, [embraceSDKLoaded, fontsLoaded]);

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
