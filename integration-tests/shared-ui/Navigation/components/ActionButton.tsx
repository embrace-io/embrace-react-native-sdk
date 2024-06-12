import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

export interface IAction {
  name: string;
  onPress: () => void;
  backgroundColor: string;
  id: string;
}
const ActionButton = ({
  name,
  onPress,
  backgroundColor = "white",
  id,
}: IAction) => {
  return (
    <TouchableOpacity
      testID={id}
      accessibilityLabel={id}
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.nameStyle,
          { color: backgroundColor === "white" ? "black" : "white" },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.4,
    shadowRadius: 9,
    elevation: 14,
    margin: 10,
    borderRadius: 10,
  },
  nameStyle: {
    fontSize: 14,
    fontWeight: "bold",

    textAlign: "center",
  },
});
