import * as React from "react";
import LogTestingScreen from "./LogTestingScreen";
import {StyleSheet, Button, Dimensions, ScrollView, View} from "react-native";
import {endSession} from "@embrace-io/react-native";

type Props = {};

export default function MainTestScreen({}: Props) {
  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: "center"}}>
        <View style={styles.scrollViewContainer}>
          <Button onPress={endSession} title="END SESSION" />
          <LogTestingScreen />
        </View>
      </ScrollView>
    </View>
  );
}

// https://stackoverflow.com/a/45739033
const styles = StyleSheet.create({
  mainContainer: {flex: 1},
  scrollView: {height: Dimensions.get("window").height},
  scrollViewContainer: {},
});
