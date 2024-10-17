import {Image, StyleSheet, Button} from "react-native";
import {useCallback} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
/*
import {
  endSession,
  logHandledError,
  logError,
  logInfo,
  logMessage,
  logWarning,
} from "@embrace-io/react-native";

 */

const HomeScreen = () => {
  /*
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const handleErrorLog = useCallback(() => {
    logHandledError(
      new TypeError("triggering handled error (will show js stacktrace)"),
    );
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    throw new ReferenceError(
      "testing 6.4.0-rc4 / triggering a crash (unhandled js exception)",
    );
  }, []);

  const handleLogUnhandledErrorNotAnonymous = useCallback(
    function myLovellyUnhandledError() {
      throw new ReferenceError("triggering a crash (unhandled js exception)");
    },
    [],
  );

  const sendLogs = useCallback(() => {
    logWarning("Warning log (manually triggered)");

    logInfo("Info log (manually triggered)");

    logError("Error log (manually triggered)");
  }, []);

  const sendMessage = useCallback(() => {
    logMessage("Message log (manually triggered) with severity", "warning", {
      "custom.property.test": "hey",
      "another.property": "ho",
      "yet.another": "hum",
      "rn.sdk.test": 1234567,
    });
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: "#A1CEDC", dark: "#1D3D47"}}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">End Session</ThemedText>
        <Button onPress={handleEndSession} title="END SESSION" />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Logs</ThemedText>
        <Button onPress={sendLogs} title="LOGs (war/info/error)" />
        <Button onPress={sendMessage} title="Custom Message (also a log)" />
        <Button onPress={handleErrorLog} title="Handled JS Exception" />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Crashes (Unhandled Exceptions)</ThemedText>
        <Button onPress={handleLogUnhandledError} title="CRASH" />
        <Button
          onPress={handleLogUnhandledErrorNotAnonymous}
          title="CRASH (not anonymous)"
        />
      </ThemedView>
    </ParallaxScrollView>
  );

   */

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: "#A1CEDC", dark: "#1D3D47"}}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">No Embrace</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

export default HomeScreen;
