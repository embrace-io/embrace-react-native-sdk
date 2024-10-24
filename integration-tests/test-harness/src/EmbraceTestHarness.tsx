import {useEffect, useState} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native";
};

export const EmbraceTestHarness = ({sdkConfig, navigationStyle}: Props) => {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);
  useEffect(() => {
    const init = async () => {
      await initEmbrace({
        sdkConfig,
      });

      setEmbraceLoaded(true);
    };

    init();
  }, []);

  if (!embraceLoaded) {
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
