import {Image, StyleSheet, Button} from "react-native";
import {useCallback} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {endSession} from "@embrace-io/react-native";

import { startSpan, stopSpan, addSpanEventToSpan } from "@embrace-io/react-native-spans";

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    console.log("end session was clicked");
    endSession();
  }, []);


  const handleTestSpanAPI = useCallback(async () => {
    try {
     const spanId =  await startSpan("my-span");

     if (typeof spanId === "boolean") {
       console.error("Failed to start span");
       return
     }

     /* fails on both iOS and Android, neither handle this being null
     const addedEventNoTS = await addSpanEventToSpan(spanId, "my-span-event-no-ts");
     if (!addedEventNoTS) {
       console.error("Failed to add span event without TS");
       return
     }
      */

     const addedEventWithTS = await addSpanEventToSpan(spanId, "my-span-event-with-ts", new Date().getTime());
     if (!addedEventWithTS) {
       console.error("Failed to add span event with TS");
       return
     }

     await stopSpan(spanId, "Failure")

    } catch (error) {
        console.error(`Failed to add event: ${error}`);
    }
  }, [])

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
        <ThemedText type="subtitle">Performance Tracing</ThemedText>
        <Button onPress={handleTestSpanAPI} title="TEST SPAN API" />
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
