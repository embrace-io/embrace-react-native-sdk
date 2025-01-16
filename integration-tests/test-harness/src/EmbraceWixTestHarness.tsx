import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {Navigation} from "react-native-navigation";
import {EmbraceNativeNavigationTracker} from "@embrace-io/react-native-navigation";

export const EmbraceWixTestHarness: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const navigationContainer = useNavigationContainerRef();
  const {tracerProvider} = useEmbraceNativeTracerProvider({});
  const nativeNavigationRef = React.useRef(Navigation.events());

  return (
    // `NavigationContainer` is waiting for what `useNavigationContainerRef` is returning (both exported from `@react-navigation/native`)
    <NavigationContainer ref={navigationContainer}>
      <EmbraceNativeNavigationTracker
        ref={nativeNavigationRef}
        tracerProvider={tracerProvider || undefined}
        screenAttributes={{
          "is-test-harness": true,
          package: "wix/react-native-navigation",
        }}>
        {children}
      </EmbraceNativeNavigationTracker>
    </NavigationContainer>
  );
};
