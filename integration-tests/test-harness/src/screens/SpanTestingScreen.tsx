import * as React from "react";
import {View, Text} from "react-native";
import {Tracer} from "@opentelemetry/api";
import {styles} from "../helpers/styles";
import TestButton from "../components/TestButton";
import {
  generateBasicSpan,
  generateGlobalApiSpans,
  generateNestedSpans,
  generateTestSpans,
} from "../helpers/generateSpans";
import {
  addBreadcrumb,
  getEmbraceTracer,
  recordCompletedSpan,
  startView,
} from "@embrace-io/react-native";

const getTracer = (): Tracer => {
  const tracer = getEmbraceTracer("span-test", "1.0");
  if (!tracer) {
    throw new Error("The Embrace tracer provider is not registered");
  }
  return tracer;
};

const recordView = () => {
  try {
    const viewSpan = startView(getTracer(), "my-view");
    viewSpan.end();
  } catch (e) {
    console.log("failed to record view: ", e);
  }
};

const recordCompletedSpans = () => {
  try {
    const tracer = getTracer();
    const parentSpan = tracer.startSpan("test-1");
    parentSpan.end();
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
    });
    recordCompletedSpan(tracer, "my-minimal-completed-span");
    recordCompletedSpan(tracer, "my-completed-span-with-parent", {
      parent: parentSpan,
    });
  } catch (e) {
    console.log("failed to record completed span: ", e);
  }
};

const addTestBreadcrumb = async () => {
  try {
    await addBreadcrumb("my-breadcrumb");
  } catch (e) {
    console.log("failed to add breadcrumb");
  }
};

const SpanTestingScreen = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.title}>Spans</Text>
      <TestButton
        onPress={() => generateBasicSpan(getTracer())}
        title={"GENERATE BASIC SPAN"}
      />
      <TestButton
        onPress={() => generateTestSpans(getTracer())}
        title={"GENERATE TEST SPANS"}
      />
      <TestButton
        onPress={() => generateNestedSpans(getTracer())}
        title={"GENERATE NESTED SPANS"}
      />
      <TestButton
        onPress={() => generateGlobalApiSpans(getTracer())}
        title={"GENERATE GLOBAL API SPANS"}
      />
      <TestButton onPress={recordView} title="Record View" />
      <TestButton
        onPress={recordCompletedSpans}
        title="Record Completed Span"
      />
    </View>
    <View style={styles.section}>
      <Text style={styles.title}>Span Events</Text>
      <TestButton onPress={addTestBreadcrumb} title="Add Breadcrumb" />
    </View>
  </View>
);

export {SpanTestingScreen};
