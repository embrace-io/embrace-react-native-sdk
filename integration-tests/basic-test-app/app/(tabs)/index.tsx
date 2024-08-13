import {Image, StyleSheet, Button} from "react-native";
import {useCallback} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {endSession, logHandledError} from "@embrace-io/react-native";

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    /**
     * Android Log
     */

    /**
     * iOS Log
     * TBD
     */

    throw new Error("handleLogUnhandledError (auto-captured by init sdk)");
  }, []);

  const handleLogHandledError = useCallback(() => {
    const error1 = new Error("logHandledError");
    const error2 = new Error("logHandledError with properties");

    logHandledError(error1);
    logHandledError(error2, {prop1: "test", prop2: "hey"});
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
        <ThemedText type="subtitle">Errors</ThemedText>
        <Button
          onPress={handleLogUnhandledError}
          title="Unhandled JS Exception"
        />
        <Button onPress={handleLogHandledError} title="Handled JS Error" />
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
