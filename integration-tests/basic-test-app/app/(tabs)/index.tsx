import {
  StyleSheet,
  Button,
  ScrollView,
  SafeAreaView,
  Text,
  TextComponent,
  Alert,
} from "react-native";
import {useCallback, useEffect, useState} from "react";

import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

import {
  endSession,
  logHandledError,
  logError,
  logInfo,
  logMessage,
  logWarning,
  getCurrentSessionId,
  addBreadcrumb,
  getLastRunEndState,
  setUserAsPayer,
  clearUserAsPayer,
  getDeviceId,
} from "@embrace-io/react-native";

export const LOG_MESSAGE_WARN = "Warning log (manually triggered)";
export const LOG_MESSAGE_INFO = "Info log (manually triggered)";
export const LOG_MESSAGE_ERROR = "Error log (manually triggered)";

const HomeScreen = () => {
  const [refreshSessionId, setRefreshSessionId] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>("SESSION_ID_NOT_LOADED");
  const [lastRunEndState, setLastRunEndState] = useState<string>(
    "SESSION_ID_NOT_LOADED",
  );
  const [deviceId, setDeviceId] = useState<string>("DEVICE_ID_NOT_LOADED");

  useEffect(() => {
    if (refreshSessionId) {
      setTimeout(() => {
        getCurrentSessionId().then(sId => {
          setSessionId(sId);
          setRefreshSessionId(false);
          Alert.alert(`Session Id: ${sId}`);
        });
      }, 2000);
    }
  }, [refreshSessionId]);

  useEffect(() => {
    setTimeout(() => {
      getLastRunEndState().then(setLastRunEndState);
    }, 2000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      getDeviceId().then(setDeviceId);
    }, 2000);
  }, []);

  const handleRefreshCurrentSessionId = () => {
    setRefreshSessionId(true);
  };

  const handleEndSession = () => {
    endSession().then(r => {});
  };

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

  const sendLogs = useCallback(() => {
    logWarning(LOG_MESSAGE_WARN);

    logInfo(LOG_MESSAGE_INFO);

    logError(LOG_MESSAGE_ERROR);
  }, []);

  const sendMessage = useCallback(() => {
    logMessage("Message log (manually triggered) with severity", "warning", {
      "custom.property.test": "hey",
      "another.property": "ho",
      "yet.another": "hum",
      "rn.sdk.test": 1234567,
    });
  }, []);

  const handleAddSimpleBreadcrumb = () => {
    addBreadcrumb("A SIMPLE BREADCRUMB");
  };
  const handleAddComplexBreadcrumb = () => {
    addBreadcrumb("A COMPLEX BREADCRUMB");
  };
  const handleCallApi = () => {
    fetch("https://");
  };

  const handleCrashMe = () => {
    throw new Error("A SIMPLE CRASH");
  };

  const handleAddPayer = () => {
    setUserAsPayer();
  };
  const handleClearPayer = () => {
    clearUserAsPayer();
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Current Session Id</ThemedText>
          {/* <Button
            testID="CURRENT_SESSION_ID"
            accessibilityLabel="CURRENT_SESSION_ID"
            title={sessionId}
          /> */}
          {/* <TextComponent
            testID="CURRENT_SESSION_ID"
            accessibilityLabel="CURRENT_SESSION_ID" 
>
            {sessionId}
          </TextComponent> */}
          <Button
            onPress={handleRefreshCurrentSessionId}
            title="REFRESH SESSION ID"
          />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Last Session exit</ThemedText>
          <ThemedText
            type="defaultSemiBold"
            accessibilityLabel="LAST_SESSION_EXIT">
            LAST_SESSION_EXIT:{lastRunEndState}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button
            onPress={handleAddSimpleBreadcrumb}
            title="A SIMPLE BREADCRUMB"
          />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button
            onPress={handleAddComplexBreadcrumb}
            title="A COMPLEX BREADCRUMB"
          />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleCrashMe} title="CRASH ME" />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleCallApi} title="Call API" />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">End Session</ThemedText>
          <Button onPress={handleEndSession} title="END SESSION" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleAddPayer} title="ADD PAYER" />
          <Button onPress={handleClearPayer} title="CLEAN PAYER" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Logs</ThemedText>
          <Button onPress={sendLogs} title="LOGs (war/info/error)" />
          <Button onPress={sendMessage} title="Custom Message (also a log)" />
          <Button onPress={handleErrorLog} title="Handled JS Exception" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">
            Crashes (Unhandled Exceptions)
          </ThemedText>
          <Button onPress={handleLogUnhandledError} title="CRASH" />
          <Button
            onPress={handleLogUnhandledErrorNotAnonymous}
            title="CRASH (not anonymous)"
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
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
