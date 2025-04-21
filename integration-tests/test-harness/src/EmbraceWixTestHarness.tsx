import * as React from "react";
import {useRef} from "react";
import {Navigation} from "react-native-navigation";
import {EmbraceNativeNavigationTracker} from "@embrace-io/react-native-navigation";
import {useOrientationListener} from "@embrace-io/react-native";
import {TracerProvider} from "@opentelemetry/api";

type Props = {
  children?: React.ReactNode;
  provider?: TracerProvider;
};

const EmbraceWixTestHarness = ({children, provider}: Props) => {
  const nativeNavigationRef = useRef(Navigation.events());

  // initializing orientation listener
  useOrientationListener(true);

  return (
    <EmbraceNativeNavigationTracker
      ref={nativeNavigationRef}
      tracerProvider={provider}
      screenAttributes={{
        "test.attr": 98765,
        package: "wix/react-native-navigation",
      }}>
      {children}
    </EmbraceNativeNavigationTracker>
  );
};

export {EmbraceWixTestHarness};
