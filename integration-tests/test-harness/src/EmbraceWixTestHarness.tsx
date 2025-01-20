import * as React from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {Navigation} from "react-native-navigation";
import {EmbraceNativeNavigationTracker} from "@embrace-io/react-native-navigation";
import FullScreenMessage from "./components/FullScreenMessage";
import {
  SDKConfig,
  useEmbrace,
  useOrientationListener,
} from "@embrace-io/react-native";

type Props = {
  sdkConfig: SDKConfig;
  allowCustomExport?: boolean;
  children?: React.ReactNode;
};

const EmbraceWixTestHarness = ({
  sdkConfig,
  allowCustomExport = false,
  children,
}: Props) => {
  if (!allowCustomExport) {
    sdkConfig.exporters = undefined;
  }

  const {isPending, isStarted} = useEmbrace(sdkConfig);

  const {tracerProvider, isLoading: isLoadingTracerProvider} =
    useEmbraceNativeTracerProvider({}, isStarted);

  const nativeNavigationRef = React.useRef(Navigation.events());

  // initializing orientation listener
  useOrientationListener(isStarted);

  return (
    <EmbraceNativeNavigationTracker
      ref={nativeNavigationRef}
      tracerProvider={tracerProvider || undefined}
      screenAttributes={{
        "test.attr": 98765,
        package: "wix/react-native-navigation",
      }}>
      {isPending && <FullScreenMessage msg="Loading Embrace" />}

      {!isPending && !isStarted && (
        <FullScreenMessage msg="An error occurred during the Embrace initialization" />
      )}

      {(isLoadingTracerProvider || tracerProvider === null) && (
        <FullScreenMessage msg="Loading Tracer Provider" />
      )}

      {isStarted &&
        !isLoadingTracerProvider &&
        tracerProvider !== null &&
        children}
    </EmbraceNativeNavigationTracker>
  );
};

export {EmbraceWixTestHarness};
