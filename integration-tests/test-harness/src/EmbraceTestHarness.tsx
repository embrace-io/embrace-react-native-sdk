import * as React from "react";
import {
  useEmbrace,
  useEmbraceIsStarted,
  useOrientationListener,
} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";
import {useEffect} from "react";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native";
  allowCustomExport?: boolean;
};

const EmbraceTestHarness = ({
  sdkConfig,
  navigationStyle,
  allowCustomExport = false,
}: Props) => {
  if (!allowCustomExport) {
    sdkConfig.exporters = undefined;
  }
  const alreadyStarted = useEmbraceIsStarted();
  const {isPending, isStarted} = useEmbrace(sdkConfig);

  useEffect(() => {
    if (alreadyStarted === null) {
      // still checking
      return;
    }

    if (alreadyStarted) {
      console.log(
        "Embrace SDK has already been started, sdkConfig won't have an effect",
      );
    } else {
      console.log(
        `Embrace SDK will be started using the following config: ${JSON.stringify(sdkConfig, null, 2)}`,
      );
    }
  }, [alreadyStarted]);

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
  } else {
    return <EmbraceReactNativeTestHarness />;
  }
};

export {EmbraceTestHarness};
