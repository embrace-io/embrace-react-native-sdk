import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {addBreadcrumb} from "@embrace-io/react-native";

const SpanTestingScreen = () => {
  const addBreadcrumbHandler = useCallback(async () => {
    try {
      await addBreadcrumb("my-breadcrumb");
    } catch (e) {
      console.log("failed to add breadcrumb");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Spans</Text>
        <Button onPress={addBreadcrumbHandler} title="Add Breadcrumb" />
      </View>
    </View>
  );
};

export {SpanTestingScreen};
