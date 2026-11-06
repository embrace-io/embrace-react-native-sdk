import * as React from "react";
import {View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import TestButton from "../components/TestButton";
import {
  EmbraceErrorBoundary,
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

  const triggerUnhandledPromiseRejection = useCallback(() => {
    Promise.reject(new Error("fail"));
  }, []);

  const [renderErrorCount, setRenderErrorCount] = React.useState(0);
  const triggerRenderError = useCallback(() => {
    setRenderErrorCount(count => count + 1);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Logs</Text>
        <TestButton
          onPress={triggerLogs}
          title="Info / Warning / Error / Message"
        />
        <TestButton onPress={triggerErrorLog} title="Handled Exception" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Logs (no Stack Traces)</Text>
        <TestButton
          onPress={triggerNoStacktraceLogs}
          title="Warning / Error / Message"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Errors</Text>
        <TestButton onPress={triggerAnonymousCrash} title="Anonymous Crash" />
        <TestButton onPress={triggerCrash} title="Crash" />
        <TestButton
          onPress={triggerUnhandledPromiseRejection}
          title="Trigger an Unhandled Promise rejection"
        />
        <TestButton onPress={triggerRenderError} title="Trigger a Render error" />
        {renderErrorCount > 0 && (
          <EmbraceErrorBoundary
            key={renderErrorCount}
            fallback={() => <Text>Render error caught</Text>}>
            <ErrorComponent />
          </EmbraceErrorBoundary>
        )}
      </View>
    </View>
  );
};

export {LogTestingScreen};
