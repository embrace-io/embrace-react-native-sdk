import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {EmbraceNavigationTracker} from "@embrace-io/react-native-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";
import FullScreenMessage from "./components/FullScreenMessage";

export const EmbraceExpoTestHarness = () => {
  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({});
  const expoNavigationRef = useExpoNavigationContainerRef();

  if (isLoadingTracerProvider || tracerProvider === null) {
    return <FullScreenMessage msg="Loading Tracer Provider" />;
  }

  return (
    <EmbraceNavigationTracker
      ref={expoNavigationRef}
      tracerProvider={tracerProvider}
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
