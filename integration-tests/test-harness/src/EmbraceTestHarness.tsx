import * as React from "react";
import {useEmbrace, useOrientationListener} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";
import {EmbraceWixTestHarness} from "./EmbraceWixTestHarness";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native" | "wix";
  allowCustomExport?: boolean;
  children: React.ReactNode;
};

const EmbraceTestHarness = ({
  sdkConfig,
  navigationStyle,
  allowCustomExport = false,
  children,
}: Props) => {
  if (!allowCustomExport) {
    sdkConfig.exporters = undefined;
  }

  const {isPending, isStarted} = useEmbrace(sdkConfig);

  // initializing orientation listener
  useOrientationListener(isStarted);

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text>Loading Embrace</Text>
      </View>
    );
  } else {
    if (!isStarted) {
      return (
        <View style={styles.container}>
          <Text>An error occurred during the Embrace initialization</Text>
        </View>
      );
    }
  }

  if (navigationStyle === "expo") {
    return <EmbraceExpoTestHarness />;
  } else if (navigationStyle === "wix") {
    return <EmbraceWixTestHarness>{children}</EmbraceWixTestHarness>;
  } else {
    return <EmbraceReactNativeTestHarness />;
  }
};

export {EmbraceTestHarness};
