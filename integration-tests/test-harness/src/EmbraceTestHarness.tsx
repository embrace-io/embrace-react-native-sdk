import * as React from "react";
import {useEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";
import {CONFIG} from "./helpers/otlp";

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
  const {isPending} = useEmbrace(
    sdkConfig,
    allowCustomExport ? CONFIG : undefined,
  );

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text>Loading Embrace</Text>
      </View>
    );
  }

  if (navigationStyle === "expo") {
    return <EmbraceExpoTestHarness />;
  } else {
    return <EmbraceReactNativeTestHarness />;
  }
};

export {EmbraceTestHarness};
