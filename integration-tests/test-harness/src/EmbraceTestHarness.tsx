import {useEffect, useState} from "react";
import * as React from "react";
import {initialize as initEmbrace} from "@embrace-io/react-native";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {Text, View} from "react-native";
import {MainTestScreen} from "./screens/MainTestScreen";
import {styles} from "./helpers/styles";
import {SDKConfig} from "@embrace-io/react-native/lib/src/interfaces/Config";
import {
  Stack,
  useNavigationContainerRef as useExpoNavigationContainerRef,
} from "expo-router";

type Props = {
  sdkConfig: SDKConfig;
  navigationStyle: "expo" | "TODO-react-native";
};

export const EmbraceTestHarness = ({sdkConfig, navigationStyle}: Props) => {
  const [embraceLoaded, setEmbraceLoaded] = useState(false);
  const {tracerProvider} = useEmbraceNativeTracerProvider({}, embraceLoaded);
  const expoNavigationRef = useExpoNavigationContainerRef();
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
    return (
      <NavigationTracker
        // @ts-ignore
        ref={expoNavigationRef}
        provider={tracerProvider || undefined}
        config={{
          attributes: {
            "emb.type": "ux.view",
          },
          debug: true,
        }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </NavigationTracker>
    );
  } else {
    // TODO react native navigation
    return <MainTestScreen />;
  }
};
