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

const LogTestingScreen = () => {
  const handleErrorLog = useCallback(() => {
    logHandledError(
      new TypeError("triggering handled error (will show js stacktrace)"),
    );
  }, []);

  const handleLogUnhandledError = useCallback(() => {
    throw new ReferenceError(
      "testing 6.4.0-rc4 / triggering a crash (unhandled js exception)",
    );
  }, []);

  const handleLogUnhandledErrorNotAnonymous = useCallback(
    function myLovellyUnhandledError() {
      throw new ReferenceError("triggering a crash (unhandled js exception)");
    },
    [],
  );

  const sendLogInfo = useCallback(() => {
    logInfo("Info log (manually triggered)");
  }, []);

  const sendLogError = useCallback(() => {
    logError("Error log (manually triggered)");
  }, []);
  const sendLogWarn = useCallback(() => {
    logWarning("Warning log (manually triggered)");
  }, []);

  const sendMessage = useCallback(() => {
    logMessage("Message log (manually triggered) with severity", "warning", {
      "custom.property.test": "hey",
      "another.property": "ho",
      "yet.another": "hum",
      "rn.sdk.test": "1234567",
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Logs</Text>
        <Button onPress={sendLogInfo} title="LOG info" />
        <Button onPress={sendLogError} title="LOG error" />
        <Button onPress={sendLogWarn} title="LOG warn" />
        <Button onPress={sendMessage} title="Custom Message (also a log)" />
        <Button onPress={handleErrorLog} title="Handled JS Exception" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Crashes (Unhandled Exceptions)</Text>
        <Button onPress={handleLogUnhandledError} title="CRASH" />
        <Button
          onPress={handleLogUnhandledErrorNotAnonymous}
          title="CRASH (not anonymous)"
        />
      </View>
    </View>
  );
};

export {LogTestingScreen};
