import * as React from "react";
import {useEmbraceNavigationTracker} from "@embrace-io/react-navigation";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";

const EmbraceExpoNavigation = () => {
  const expoNavigationRef = useExpoNavigationContainerRef();

  useEmbraceNavigationTracker(expoNavigationRef);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
    </Stack>
  );
};

export default EmbraceExpoNavigation;
