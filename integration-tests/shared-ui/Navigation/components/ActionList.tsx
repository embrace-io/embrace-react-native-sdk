import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import ActionButton, { IAction } from "./ActionButton";

interface IActionList {
  actions: IAction[];
}
const ActionList = ({ actions }: IActionList) => {
  const renderAction = ({ item }: { item: IAction }) => {
    return (
      <ActionButton
        id={item.id}
        onPress={item.onPress}
        name={item.name}
        backgroundColor={item.backgroundColor}
      />
    );
  };
  return (
    <View style={styles.container}>
      <FlatList data={actions} renderItem={renderAction} numColumns={2} />
    </View>
  );
};
export default ActionList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 50,
  },
});
