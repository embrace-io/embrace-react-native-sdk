import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  getDeviceId,
  getLastRunEndState,
  getCurrentSessionId,
  recordNetworkRequest,
  logNetworkClientError,
} from "@embrace-io/react-native";

const SubErrorComponent2 = () => {
  throw new TypeError("Upssssssss");
};

const SubErrorComponent1 = () => {
  return (
    <View>
      <SubErrorComponent2 />
    </View>
  );
};

const ErrorComponent = () => {
  return (
    <View>
      <SubErrorComponent1 />
    </View>
  );
};

const MiscTestingScreen = () => {
  const [isError, setIsError] = React.useState(false);
  const handleRenderError = useCallback(() => {
    setIsError(true);
  }, []);

  const getInfo = useCallback(async () => {
    try {
      const deviceId = await getDeviceId();
      const sessionId = await getCurrentSessionId();
      const lastRunEndState = await getLastRunEndState();
      console.log("deviceId: ", deviceId);
      console.log("sessionId: ", sessionId);
      console.log("lastRunEndState: ", lastRunEndState);
    } catch (e) {
      console.log("failed to get info from SDK");
    }
  }, []);

  const networkRequestsHandler = useCallback(async () => {
    try {
      const start = Date.now();
      await new Promise(r => setTimeout(r, 200));
      const end = Date.now();

      await recordNetworkRequest("https://example.com", "GET", start, end);
      await logNetworkClientError(
        "https://example.com",
        "GET",
        start,
        end,
        "400",
        "bad request",
      );
    } catch (e) {
      console.log("failed to record network requests");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Info</Text>
        <Button onPress={getInfo} title="Get Info" />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Network</Text>
        <Button
          onPress={networkRequestsHandler}
          title="Record Network Requests"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Render</Text>
        <Button onPress={handleRenderError} title="Trigger a Render error" />
        {isError && <ErrorComponent />}
      </View>
    </View>
  );
};

export {MiscTestingScreen};
