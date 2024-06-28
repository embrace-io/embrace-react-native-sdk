import { Image, StyleSheet, Button } from "react-native";
import { useCallback, useMemo } from "react";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { endSession } from "@embrace-io/react-native";
import {
  generateNestedSpans,
  generateTestSpans,
} from "@/helpers/generateSpans";
import { Tracer } from "@opentelemetry/api";
import { EmbraceNativeTracerProvider } from "@embrace-io/react-native-tracer-provider";

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);
  const tracer = useMemo<Tracer>(() => {
    return new EmbraceNativeTracerProvider().getTracer("span-test", "1.0");
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Session</ThemedText>
        <Button onPress={handleEndSession} title="END SESSION" />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Span</ThemedText>
        <Button
          onPress={() => generateTestSpans(tracer)}
          title={"GENERATE TEST SPANS"}
        />
        <Button
          onPress={() => generateNestedSpans(tracer)}
          title={"GENERATE NESTED SPANS"}
        />
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
