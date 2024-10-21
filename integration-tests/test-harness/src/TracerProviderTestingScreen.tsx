import * as React from "react";
import {Button, View, Text} from "react-native";
import {useMemo} from "react";
import {styles} from "./styles";

import {
  generateBasicSpan,
  generateNestedSpans,
  generateTestSpans,
} from "@/helpers/generateSpans";
import {Tracer} from "@opentelemetry/api";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";

const TracerProviderTestingScreen = () => {
  const {isLoading, isError, error, tracerProvider} =
    useEmbraceNativeTracerProvider();

  const tracer = useMemo<Tracer | undefined>(() => {
    if (tracerProvider) {
      return tracerProvider.getTracer("span-test", "1.0");
    }
  }, [isLoading, isError, error, tracerProvider]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>Loading Tracer Provider</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>{error}</Text>
        </View>
      </View>
    );
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
      </View>
    </View>
  );
};

export default TracerProviderTestingScreen;
