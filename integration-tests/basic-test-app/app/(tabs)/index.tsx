import {Image, StyleSheet, Button} from "react-native";
import {useCallback, useMemo} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import {endSession, logHandledError} from "@embrace-io/react-native";
import {
  startSpan,
  stopSpan,
  addSpanEventToSpan,
  addSpanAttributeToSpan,
  recordSpan,
  recordCompletedSpan,
} from "@embrace-io/react-native-spans";

const getTimeWithSuffix = (last4digits: number) => {
  return Math.round(new Date().getTime() / 1000) * 1000 + last4digits;
};

const HomeScreen = () => {
  const handleEndSession = useCallback(() => {
    endSession();
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    throw new Error("handleLogUnhandledError (auto-captured by init sdk)");
  }, []);

  const handleLogHandledError = useCallback(() => {
    const error1 = new Error("logHandledError");
    const error2 = new Error("logHandledError with properties");

    logHandledError(error1);
    logHandledError(error2, {prop1: "test", prop2: "hey"});
  }, []);

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
          onPress={async () => {
            let id = null;
            try {
              id = await startSpan("my-span");
              console.log("id: ", id);
            } catch (e) {
              console.log(e);
            }

            if (typeof id === "string") {
              const result = await stopSpan(id);
              if (!result) {
                console.log("failed to stop span");
              }
            } else {
              console.log("failed to start span");
            }
          }}
          title={"SIMPLE SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan(
              "span-code-test-2",
              undefined,
              1722011284001,
            );
            console.log("id: ", id);
            stopSpan(id as string, "Unknown");
          }}
          title={"STOP SPAN ERROR CODE TEST"}
        />

        <Button
          onPress={async () => {
            const time = getTimeWithSuffix(1111);
            const id = await startSpan("span-end-inside", undefined, time);
            stopSpan(id as string, "None", time + 1);
          }}
          title={"STOP SPAN INSIDE SESSION TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan(
              "span-end-outside",
              undefined,
              1722011284001,
            );
            stopSpan(id as string, "None", 1722011287002);
          }}
          title={"STOP SPAN OUTSIDE SESSION TEST"}
        />

        <Button
          onPress={async () => {
            await startSpan("still-active-span");
          }}
          title={"STILL ACTIVE SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const parentID = await startSpan("parent-span");
            const childID = await startSpan("child-span", parentID as string);

            stopSpan(parentID as string, "None");
            stopSpan(childID as string);
          }}
          title={"START SPAN PARENT TEST"}
        />

        <Button
          onPress={async () => {
            const id = await startSpan("span-with-stuff");

            addSpanEventToSpan(
              id as string,
              "event-no-attributes",
              new Date().getTime(),
            );

            addSpanEventToSpan(
              id as string,
              "event-with-attributes",
              getTimeWithSuffix(4177),
              {"attr-1": "foo", "attr-2": "bar"},
            );
            addSpanAttributeToSpan(id as string, "other-attr", "baz");

            stopSpan(id as string);
          }}
          title={"SPAN EVENTS AND ATTRIBUTES TEST"}
        />

        <Button
          onPress={async () => {
            recordSpan(
              "recorded-span",
              () => {},
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD SPAN TEST"}
        />

        <Button
          onPress={async () => {
            const time = getTimeWithSuffix(1111);

            recordCompletedSpan(
              "recorded-completed-span-inside",
              time,
              time + 1,
              "Unknown",
              undefined,
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD COMPLETED SPAN INSIDE TEST"}
        />

        <Button
          onPress={async () => {
            recordCompletedSpan(
              "recorded-completed-span-outside",
              1722011284001,
              1722011287002,
              "Unknown",
              undefined,
              {"attr-1": "foo", "attr-2": "bar"},
              [
                {
                  name: "event-no-attributes",
                  timeStampMs: new Date().getTime(),
                },
                {
                  name: "event-with-attributes",
                  timeStampMs: new Date().getTime(),
                  attributes: {"event-attr-1": "baz"},
                },
              ],
            );
          }}
          title={"RECORD COMPLETED SPAN OUTSIDE TEST"}
        />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Errors</ThemedText>
        <Button
          onPress={handleLogUnhandledError}
          title="Unhandled JS Exception"
        />
        <Button onPress={handleLogHandledError} title="Handled JS Error" />
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
