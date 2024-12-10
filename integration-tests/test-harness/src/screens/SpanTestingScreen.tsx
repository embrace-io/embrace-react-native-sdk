import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  addBreadcrumb,
  logScreen,
  startView,
  endView,
} from "@embrace-io/react-native";

const SpanTestingScreen = () => {
  const addBreadcrumbHandler = useCallback(async () => {
    try {
      await addBreadcrumb("my-breadcrumb");
    } catch (e) {
      console.log("failed to add breadcrumb");
    }
  }, []);

  const logScreenHandler = useCallback(async () => {
    try {
      await logScreen("my-screen");
    } catch (e) {
      console.log("failed to log screen");
    }
  }, []);

  const recordView = useCallback(async () => {
    try {
      await startView("my-view");
      await new Promise(r => setTimeout(r, 2000));
      await endView("my-view");
    } catch (e) {
      console.log("failed to record view");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Spans</Text>
        <Button onPress={addBreadcrumbHandler} title="Add Breadcrumb" />
        <Button onPress={logScreenHandler} title="Log Screen" />
        <Button onPress={recordView} title="Record View" />
      </View>
    </View>
  );
};

export {SpanTestingScreen};
