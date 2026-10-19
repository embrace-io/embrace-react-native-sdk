import * as React from "react";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";

export const EmbraceNotInitialized = () => (
  <View style={styles.container}>
    <Text>
      Embrace failed to initialize. The test harness requires Embrace to be
      started natively.
    </Text>
  </View>
);
