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
  const [catFact, setCatFact] = useState<string>("Discover a cat fact");

  const handleGetCatFacts = useCallback(async () => {
    try {
      const res = await fetch("https://catfact.ninja/fact");
      const data = await res.json();

      setCatFact(data.fact);
    } catch (error) {
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
        <Button onPress={handleGetCatFacts} title="Cat lovers" />
        <Text>{catFact}</Text>
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
