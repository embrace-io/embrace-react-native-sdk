import {useEffect, useState} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {EmbraceExpoTestHarness} from "./EmbraceExpoTestHarness";
import {EmbraceReactNativeTestHarness} from "./EmbraceReactNativeTestHarness";
import {initWithCustomExporters as initEmbraceWithCustomExporters} from "./helpers/otlp";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "react-native";
  allowCustomExport?: boolean;
};

export const EmbraceTestHarness = ({
  sdkConfig,
  navigationStyle,
  allowCustomExport = false,
}: Props) => {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const config = {
        sdkConfig,
      };

      if (allowCustomExport) {
        config.sdkConfig.startCustomExport = initEmbraceWithCustomExporters();
      }

      await initEmbrace(config);

      setEmbraceLoaded(true);
    };

    init();
  }, [allowCustomExport]);

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
