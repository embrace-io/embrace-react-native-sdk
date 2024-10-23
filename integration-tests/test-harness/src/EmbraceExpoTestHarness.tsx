import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";

export const EmbraceExpoTestHarness = () => {
  const {tracerProvider} = useEmbraceNativeTracerProvider({});
  const expoNavigationRef = useExpoNavigationContainerRef();
  return (
    <NavigationTracker
      // @ts-ignore
      ref={expoNavigationRef}
      provider={tracerProvider || undefined}
      config={{
        attributes: {
          "emb.type": "ux.view",
        },
        debug: true,
      }}>
      <Stack>
        {/*
            NOTE: because expo router using a file-based navigation system the
            tabs can't be added here, if a new testing screen is added make sure
            it is included in templates/expo-test-app-template/app/(tabs)/
           */}
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      </Stack>
    </NavigationTracker>
  );
};
