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
  recordCompletedSpan,
} from "@embrace-io/react-native-tracer-provider";
import FullScreenMessage from "../components/FullScreenMessage";
import {addBreadcrumb} from "@embrace-io/react-native";

const SpanTestingScreen = () => {
  const {isLoading, isError, error, tracerProvider} =
    useEmbraceNativeTracerProvider();

  const tracer = useMemo<Tracer | undefined>(() => {
    if (tracerProvider) {
      return tracerProvider.getTracer("span-test", "1.0");
    }
  }, [tracerProvider]);

  const recordViewHandler = useCallback(async () => {
    if (!tracer) {
      console.log("failed to record view, tracer not ready");
      return;
    }

    try {
      const viewSpan = startView(tracer, "my-view");
      viewSpan.end();
    } catch (e) {
      console.log("failed to record view: ", e);
    }
  }, [tracer]);

  const recordCompletedSpanHandler = useCallback(async () => {
    if (!tracer) {
      console.log("failed to record completed span, tracer not ready");
      return;
    }

    try {
      const parentSpan = tracer.startSpan("test-1");
      const startTime = new Date().getTime();
      const eventTime = startTime + 300;
      const endTime = startTime + 1500;
      recordCompletedSpan(tracer, "my-completed-span", {
        startTime,
        endTime,
        attributes: {
          "my-attr": "foo",
        },
        events: [
          {
            name: "completed-span-event",
            attributes: {"event-attr": "bar"},
            timeStamp: eventTime,
          },
        ],
        parent: parentSpan,
      });
      recordCompletedSpan(tracer, "my-minimal-completed-span");
    } catch (e) {
      console.log("failed to record completed span: ", e);
    }
  }, [tracer]);

  const addBreadcrumbHandler = useCallback(async () => {
    try {
      await addBreadcrumb("my-breadcrumb");
    } catch (e) {
      console.log("failed to add breadcrumb");
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
        <Text style={styles.title}>Spans</Text>
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
        <Button onPress={recordViewHandler} title="Record View" />
        <Button
          onPress={recordCompletedSpanHandler}
          title="Record Completed Span"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Span Events</Text>
        <Button onPress={addBreadcrumbHandler} title="Add Breadcrumb" />
      </View>
    </View>
  );
};

export {SpanTestingScreen};
