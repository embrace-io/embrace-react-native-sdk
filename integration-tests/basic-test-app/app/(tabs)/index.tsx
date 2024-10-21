import {Image, StyleSheet, Button} from "react-native";
import React, {useCallback, useMemo, useRef} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {
  endSession,
  logHandledError,
  logError,
  logInfo,
  logMessage,
  logWarning,
} from "@embrace-io/react-native";
import {
  addSpanAttributeToSpan,
  startSpan,
  stopSpan,
} from "@embrace-io/react-native-spans";
import {
  generateBasicSpan,
  generateNestedSpans,
  generateTestSpans,
} from "@/helpers/generateSpans";
import {Tracer} from "@opentelemetry/api";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";

const HomeScreen = () => {
  const spanIdRef = useRef<string | null>(null);
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const {isLoading, isError, error, tracerProvider} =
    useEmbraceNativeTracerProvider();

  const tracer = useMemo<Tracer | undefined>(() => {
    if (tracerProvider) {
      return tracerProvider.getTracer("span-test", "1.0");
    }
  }, [isLoading, isError, error, tracerProvider]);

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

  // start/end custom span
  const handleStartSpan = useCallback(async () => {
    const spanId = await startSpan("testing custom exporter - Start");

    if (typeof spanId === "string" && spanId !== undefined) {
      console.log(`storing ${spanId}`);

      spanIdRef.current = spanId;
    }
  }, []);

  const handleEndSpan = useCallback(() => {
    if (spanIdRef.current) {
      addSpanAttributeToSpan(spanIdRef.current, "custom.ios.exporter", "test");

      console.log(`ending ${spanIdRef.current}`);
      stopSpan(spanIdRef.current);
    }
  }, []);

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
      "rn.sdk.test": "1234567",
    });
  }, []);

  if (isLoading) {
    return <ThemedText type="subtitle">Loading Tracer Provider</ThemedText>;
  }

  if (isError) {
    return <ThemedText type="subtitle">{error}</ThemedText>;
  }

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
        <ThemedText type="subtitle">Session</ThemedText>
        <Button onPress={handleEndSession} title="END SESSION" />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Span</ThemedText>
        <Button
          onPress={() => generateBasicSpan(tracer!)}
          title={"GENERATE BASIC SPAN"}
        />
        <Button
          onPress={() => generateTestSpans(tracer!)}
          title={"GENERATE TEST SPANS"}
        />
        <Button
          onPress={() => generateNestedSpans(tracer!)}
          title={"GENERATE NESTED SPANS"}
        />
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

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Logs</ThemedText>
        <Button onPress={sendLogs} title="LOGs (war/info/error)" />
        <Button onPress={sendMessage} title="Custom Message (also a log)" />
        <Button onPress={handleErrorLog} title="Handled JS Exception" />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Spans</ThemedText>
        <Button onPress={handleStartSpan} title="Start span" />
        <Button onPress={handleEndSpan} title="Stop span" />
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
