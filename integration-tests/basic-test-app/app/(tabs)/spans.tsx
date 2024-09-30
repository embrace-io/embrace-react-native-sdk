import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import {startSpan, stopSpan} from "@embrace-io/react-native-spans";
import {useRef} from "react";
import {StyleSheet, ScrollView, Button} from "react-native";

export default function TabTwoScreen() {
  const spanIdA = useRef<string>();
  const spanIdAB = useRef<string>();
  const spanIdBA = useRef<string>();
  const spanIdA2 = useRef<string>();

  const handleAddSpanParentA = async () => {
    const spanId = await startSpan(
      "SPAN-PARENT-A",
      undefined,
      new Date().getTime(),
    );

    if (spanId) {
      spanIdA.current = spanId as string;
    }
  };

  const handleOnStopParentA = async () => {
    stopSpan(spanIdA.current as string, "None", new Date().getTime());
  };

  const handleAddSpanChildA = async () => {
    const spanId = await startSpan(
      "SPAN-CHILD-A-B",
      spanIdAB.current,
      new Date().getTime(),
    );
    if (spanId) {
      spanIdAB.current = spanId as string;
    }
  };

  const handleStopSpanChildA = async () => {
    stopSpan(spanIdAB.current as string, "None", new Date().getTime());
  };

  const handleAddSpanChildB = async () => {
    const spanId = await startSpan(
      "SPAN-A-CHILD-B",
      spanIdBA.current,
      new Date().getTime(),
    );
    if (spanId) {
      spanIdBA.current = spanId as string;
    }
  };
  const handleStopSpanChildB = async () => {
    stopSpan(spanIdBA.current as string, "None", new Date().getTime());
  };

  const handleAddSpanChildA2 = async () => {
    const spanId = await startSpan(
      "SPAN-CHILD-A-2",
      spanIdA2.current,
      new Date().getTime(),
    );
    if (spanId) {
      spanIdA2.current = spanId as string;
    }
  };

  const handleStopSpanChildA2 = async () => {
    stopSpan(spanIdA2.current as string, "None", new Date().getTime());
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.stepContainer}>
        <Button onPress={handleAddSpanParentA} title="START SPAN PARENT - A" />
        <Button onPress={handleOnStopParentA} title="STOP SPAN PARENT - A" />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Button
          onPress={handleAddSpanChildA}
          title="START SPAN CHILD OF A - PARENT - B"
        />
        <Button
          onPress={handleStopSpanChildA}
          title="STOP SPAN CHILD OF A - PARENT - B"
        />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Button onPress={handleAddSpanChildB} title="START SPAN CHILD OF B" />
        <Button onPress={handleStopSpanChildB} title="STOP SPAN CHILD OF B" />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Button
          onPress={handleAddSpanChildA2}
          title="START SECOND SPAN CHILD OF A"
        />
        <Button
          onPress={handleStopSpanChildA2}
          title="STOP SECOND SPAN CHILD OF A"
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: "10%",
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
