import React, {useCallback, useRef} from "react";
import {Button, View, Text} from "react-native";
import {styles} from "../helpers/styles";
import {startSpan, stopSpan} from "@embrace-io/react-native-spans";

const OTLPTestingScreen = () => {
  const spanIdRef = useRef<string | null>(null);

  const startManualSpan = useCallback(async () => {
    const spanId = await startSpan("wed23, testing span for custom exporter");

    if (typeof spanId === "string") {
      spanIdRef.current = spanId;
    }
  }, []);

  const stopManualSpan = useCallback(() => {
    if (spanIdRef.current) {
      stopSpan(spanIdRef.current);
      spanIdRef.current = null;
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Create Span</Text>
        <Button onPress={startManualSpan} title="Start Span" />
        <Button onPress={stopManualSpan} title="Stop Span" />
      </View>
    </View>
  );
};

export {OTLPTestingScreen};
