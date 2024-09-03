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

  const handleErrorLog = useCallback(() => {
    logHandledError(new Error("error log test (manually triggered)"));
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    throw new Error("new approach for js crashes (auto-captured by sdk)");
  }, []);

  const handlePromiseUnhandledError = useCallback(async () => {
    await new Promise((_, reject) => {
      reject(new Error("rejecting manually promise - testing"));
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
        <Button onPress={handleErrorLog} title="HANDLED ERROR LOG" />
        <Button onPress={handleLogUnhandledError} title="CRASH" />
        <Button onPress={handlePromiseUnhandledError} title="PROMISE" />
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
