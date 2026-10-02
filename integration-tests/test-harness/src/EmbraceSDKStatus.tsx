import * as React from "react";
import {Text, View} from "react-native";
import {styles} from "./helpers/styles";

type Props = {
  isPending: boolean;
  error: Error | null;
};

const statusMessage = ({isPending, error}: Props) => {
  if (isPending) {
    return "Loading Embrace";
  }

  if (error) {
    return error.message;
  }

  return "An error occurred during the Embrace initialization";
};

export const EmbraceSDKStatus = (props: Props) => (
  <View style={styles.container}>
    <Text>{statusMessage(props)}</Text>
  </View>
);
