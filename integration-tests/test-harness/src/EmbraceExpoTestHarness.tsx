import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {NavigationTracker as NavigationOpenTelemetryTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";
import EmbraceExpoNavigation from "./components/EmbraceExpoNavigation";

const EmbraceExpoTestHarness = ({
  allowExternalTelemetryInstrumentation = true,
}) => {
  const {tracerProvider} = useEmbraceNativeTracerProvider({});
  const expoNavigationRef = useExpoNavigationContainerRef();

  if (!allowExternalTelemetryInstrumentation) {
    return <EmbraceExpoNavigation />;
  }

  return (
    <NavigationOpenTelemetryTracker
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
    </NavigationOpenTelemetryTracker>
  );
};

export {EmbraceExpoTestHarness};
