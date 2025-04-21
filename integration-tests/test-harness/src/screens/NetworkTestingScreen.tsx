import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  logNetworkClientError,
  recordNetworkRequest,
} from "@embrace-io/react-native";

const NetworkTestingScreen = () => {
  const handleAuto200NetworkCall = useCallback(async () => {
    try {
      await fetch("https://example.com");
    } catch (error) {
      console.log("Error fetching...", error);
    }
  }, []);

  const handleAuto404NetworkCall = useCallback(async () => {
    try {
      await fetch("https://example.com/sdk/auto/interception");
    } catch (error) {
      console.log("Error fetching...", error);
    }
  }, []);

  const handleLogNetworkClientError = useCallback(() => {
    const now = new Date();

    logNetworkClientError(
      "https://request.fake/manual/method/log/network/client/error",
      "POST",
      now.getTime().valueOf(),
      now.getTime().valueOf() + 3000,
      "Bad Request",
      "an error message",
    );
  }, []);

  const handleRecordNetworkRequest = useCallback(() => {
    const now = new Date();

    recordNetworkRequest(
      "https://request.fake/manual/method/record/network/request",
      "GET",
      now.getTime().valueOf(),
      now.getTime().valueOf() + 400000,
      12938,
      199,
      200,
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Regular Network Call</Text>
        <Button onPress={handleAuto200NetworkCall} title="200 Request" />
        <Button onPress={handleAuto404NetworkCall} title="404 Request" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Manual Record (no API call)</Text>
        <Button
          onPress={handleRecordNetworkRequest}
          title="Record Network Request"
        />
        <Button
          onPress={handleLogNetworkClientError}
          title="Log Network Client Error"
        />
      </View>
    </View>
  );
};

export {NetworkTestingScreen};
