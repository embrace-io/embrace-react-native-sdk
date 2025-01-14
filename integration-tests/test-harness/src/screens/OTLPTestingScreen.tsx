import * as React from "react";
import {useCallback, useState} from "react";
import {Button, View, Text} from "react-native";
import {styles} from "../helpers/styles";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import FullScreenMessage from "../components/FullScreenMessage";
import {Span} from "@opentelemetry/api";

const OTLPTestingScreen = () => {
  const {tracer} = useEmbraceNativeTracerProvider();
  const [span, setSpan] = useState<Span>();

  if (!tracer) {
    return <FullScreenMessage msg="Loading Tracer" />;
  }

  const startManualSpan = useCallback(async () => {
    setSpan(tracer.startSpan("otlp - custom export"));
  }, []);

  const stopManualSpan = useCallback(() => {
    if (span) {
      span.end();
    }
  }, [span]);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Create Span</Text>
        <Button onPress={startManualSpan} title="START SPAN" />
        <Button onPress={stopManualSpan} title="STOP SPAN" />
      </View>
    </View>
  );
};

export {OTLPTestingScreen};
