import {useEffect, useState} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import MainTestScreen from "./MainTestScreen";
import {styles} from "./styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";

type Props = {
  sdkConfig: SDKConfig;
};

export const EmbraceTestHarness = ({sdkConfig}: Props) => {
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

  return <MainTestScreen />;
};
