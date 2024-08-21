import {Image, StyleSheet, Button} from "react-native";
import {useCallback} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {
  endSession,
  logError,
  logHandledError,
  recordNetworkRequest,
} from "@embrace-io/react-native";

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const handleThrowError = useCallback(() => {
    throw new Error("Flor: This is a second test - exception (unhandled)");
  }, []);

  const handleError = useCallback(() => {
    try {
      throw new Error("Flor test (handled)");
    } catch (e: any) {
      // this method produces an unhandled exception.
      // react native doesn't expose the Unhandled Exception page in the dashboard (flutter and unity do it)
      logHandledError(e, {
        "flor.manual.attr.message": e.message,
        test: "hey",
      });

      // NOTE: why this method doesn't allow properties?
      logError(e.message);
    }
  }, []);

  // const handleNetworkCall = useCallback(() => {https://jsonplaceholder.typicode.com/posts
  //   const start = new Date();
  //   const response = fetch("https://jsonplaceholder.typicode.com/posts");
  //   recordNetworkRequest()
  // }, [])

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
        <Button onPress={handleError} title="Handle" />
        <Button onPress={handleThrowError} title="Throw" />
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
