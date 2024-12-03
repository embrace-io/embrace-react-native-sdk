import * as React from "react";
import {useState} from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  logNetworkClientError,
  recordNetworkRequest,
} from "@embrace-io/react-native";

const NSFTestingScreen = () => {
  const [isDone, setIsDone] = useState<boolean | null>(null);

  const handleAutoNetworkCall = useCallback(async () => {
    try {
      setIsDone(false);
      await fetch("https://webhook.site/ca294063-8b5f-4e3f-85f2-22900ad8e732");

      setIsDone(true);
    } catch (error) {
      setIsDone(false);
      console.log("Error fetching cat facts", error);
    }
  }, []);

  const handlelogNetworkClientError = useCallback(() => {
    const now = new Date();

    logNetworkClientError(
      "https://request.fake/log/network/client/error",
      "POST",
      now.getTime().valueOf(),
      now.getTime().valueOf() + 400000,
      "Bad Request",
      "an error message",
    );
  }, []);

  const handleRecordNetworkRequest = useCallback(() => {
    const now = new Date();

    recordNetworkRequest(
      "https://request.fake/record/network/request",
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
        <Button onPress={handleAutoNetworkCall} title="webhook.site" />
        {isDone === null && (
          <Text style={styles.text}>No network call made yet</Text>
        )}
        {isDone === false && <Text style={styles.text}>Fetching...</Text>}
        {isDone === true && <Text style={styles.text}>Done!</Text>}
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
