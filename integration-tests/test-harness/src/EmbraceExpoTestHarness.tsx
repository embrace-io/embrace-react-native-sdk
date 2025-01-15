import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";

export const EmbraceExpoTestHarness = () => {
  const {tracerProvider} = useEmbraceNativeTracerProvider({});
  const expoNavigationRef = useExpoNavigationContainerRef();

  return (
    <EmbraceNavigationTracker
      ref={expoNavigationRef}
      tracerProvider={tracerProvider || undefined}
      screenAttributes={{
        "is-test-harness": true,
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
