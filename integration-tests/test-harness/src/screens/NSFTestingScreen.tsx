import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  logNetworkClientError,
  recordNetworkRequest,
} from "@embrace-io/react-native";

const NSFTestingScreen = () => {
  const handleAutoNetworkCall = useCallback(async () => {
    try {
      await fetch("https://request.fake/sdk/auto/interception");
    } catch (error) {
      console.log("Error fetching...", error);
    }
  }, []);

  const handlelogNetworkClientError = useCallback(() => {
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
        <Button onPress={handleAutoNetworkCall} title="Discover!" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Manual Record (no API call)</Text>
        <Button
          onPress={handleRecordNetworkRequest}
          title="Record Network Request"
        />
        <Button
          onPress={handlelogNetworkClientError}
          title="Log Network Client Error"
        />
      </View>
    </View>
  );
};

export {NSFTestingScreen};
