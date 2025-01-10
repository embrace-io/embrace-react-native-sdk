import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback, useMemo} from "react";
import {styles} from "../helpers/styles";
import {
  generateBasicSpan,
  generateNestedSpans,
  generateTestSpans,
} from "../helpers/generateSpans";
import {Tracer} from "@opentelemetry/api";
import {
  useEmbraceNativeTracerProvider,
  startView,
} from "@embrace-io/react-native-tracer-provider";
import FullScreenMessage from "../components/FullScreenMessage";

const TracerProviderTestingScreen = () => {
  const {isLoading, isError, error, tracerProvider} =
    useEmbraceNativeTracerProvider();

  const tracer = useMemo<Tracer | undefined>(() => {
    if (tracerProvider) {
      return tracerProvider.getTracer("span-test", "1.0");
    }
  }, [isLoading, isError, error, tracerProvider]);

  const recordView = useCallback(async () => {
    try {
      const viewSpan = startView(tracer, "my-view");
      viewSpan.end();
    } catch (e) {
      console.log("failed to record view");
    }
  }, []);

  if (isLoading) {
    return <FullScreenMessage msg="Loading Tracer Provider" />;
  }

  if (isError) {
    return <FullScreenMessage msg={error} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Tracer Provider</Text>
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
        <Button onPress={recordView} title="Record View" />
      </View>
    </View>
  );
};

export {TracerProviderTestingScreen};
