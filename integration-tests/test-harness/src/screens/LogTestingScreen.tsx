import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import {
  logHandledError,
  logError,
  logInfo,
  logMessage,
  logWarning,
} from "@embrace-io/react-native";

const SubErrorComponent2 = () => {
  throw new TypeError("Upssssssss");
};

const SubErrorComponent1 = () => {
  return (
    <View>
      <SubErrorComponent2 />
    </View>
  );
};

const ErrorComponent = () => {
  return (
    <View>
      <SubErrorComponent1 />
    </View>
  );
};

const LogTestingScreen = () => {
  const triggerErrorLog = useCallback(() => {
    logHandledError(new TypeError("This is an Error Log (with JS Stacktrace)"));
  }, []);

  const triggerAnonymousCrash = useCallback(() => {
    throw new ReferenceError("Anonymous Crash (Unhandled JS Exception)");
  }, []);

  const triggerCrash = useCallback(function myLovellyUnhandledError() {
    throw new ReferenceError("Crash (Unhandled JS Exception)");
  }, []);

  const triggerLogs = useCallback(() => {
    logWarning("This is a Warning log");
    logInfo("This is a Info log");
    logError("This is a Error log");

    logMessage("This is a Message (log)", "warning", {
      "property.test": "abcd",
      "another.property": "efghy-jklmn-opqrs-tuvwx-yz",
    });
  }, []);

  const triggerNoStacktraceLogs = useCallback(() => {
    logWarning("This is a Warning log without stacktrace", false);
    logError("This is a Error log without stacktrace", false);

    logMessage(
      "This is a Message (log without stacktrace)",
      "warning",
      {
        "property.test": "abcd",
        "another.property": "efghy-jklmn-opqrs-tuvwx-yz",
      },
      false,
    );
  }, []);

  const [isError, setIsError] = React.useState(false);
  const triggerRenderError = useCallback(() => {
    setIsError(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Logs</Text>
        <Button
          onPress={triggerLogs}
          title="Info / Warning / Error / Message"
        />
        <Button onPress={triggerErrorLog} title="Handled Exception" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Logs (no Stack Traces)</Text>
        <Button
          onPress={triggerNoStacktraceLogs}
          title="Warning / Error / Message"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Unhandled Exceptions</Text>
        <Button onPress={triggerAnonymousCrash} title="Anonymous Crash" />
        <Button onPress={triggerCrash} title="Crash" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Render Errors</Text>
        <Button onPress={triggerRenderError} title="Trigger a Render error" />
        {isError && <ErrorComponent />}
      </View>
    </View>
  );
};

export {LogTestingScreen};
