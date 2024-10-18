import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, {useEffect} from "react";
import "react-native-reanimated";
import {EmbraceTestHarness} from "@embrace-io/react-native-test-harness";
import sdkConfig from "./embrace-sdk-config.json";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  return <EmbraceTestHarness sdkConfig={sdkConfig} />;
}
