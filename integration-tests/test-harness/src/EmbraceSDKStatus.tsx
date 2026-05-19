import * as React from "react";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";

type Props = {
  isPending: boolean;
};

export const EmbraceSDKStatus = ({isPending}: Props) => (
  <View style={styles.container}>
    <Text>
      {isPending
        ? "Loading Embrace"
        : "An error occurred during the Embrace initialization"}
    </Text>
  </View>
);
