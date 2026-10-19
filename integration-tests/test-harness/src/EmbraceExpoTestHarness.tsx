import {embraceInitialized} from "./embrace";
import * as React from "react";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";
import {EmbraceNotInitialized} from "./EmbraceNotInitialized";

export const EmbraceExpoTestHarness = () => {
  const expoNavigationRef = useExpoNavigationContainerRef();

  if (!embraceInitialized) {
    return <EmbraceNotInitialized />;
  }

  return (
    <EmbraceNavigationTracker
      ref={expoNavigationRef}
      screenAttributes={{
        "test.attr": 123456,
        package: "expo-router",
      }}>
      <Stack>
        {/*
          NOTE: because expo router using a file-based navigation system the
          tabs can't be added here, if a new testing screen is added make sure
          it is included in templates/expo-test-app-template/app/(tabs)/
        */}
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      </Stack>
    </EmbraceNavigationTracker>
  );
};
