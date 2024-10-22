import * as React from "react";
import {View, Text} from "react-native";
import {styles} from "../helpers/styles";

type Props = {
  msg: string;
};

const FullScreenMessage = ({msg}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{msg}</Text>
      </View>
    </View>
  );
};

export default FullScreenMessage;
