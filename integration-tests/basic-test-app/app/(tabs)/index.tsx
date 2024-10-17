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
import {useRouter} from "expo-router";

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
  const router = useRouter();

  const [deviceId, setDeviceId] = useState<string>();

  useEffect(() => {
    setTimeout(() => {
      getDeviceId().then(setDeviceId);
    }, 2000);
  }, []);

  const showLastRunEndState = () => {
    getLastRunEndState().then(state => {
      Alert.alert(`Last Exit State: ${state}`);
    });
  };

  const handleShowCurrentSessionId = () => {
    getCurrentSessionId().then(sId => {
      Alert.alert(`Session Id: ${sId}`);
    });
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
  const handleCrashMeAnonymous = useCallback(() => {
    throw new Error("A SIMPLE CRASH");
  }, []);
  // useEffect(()=>{
  //   if(deviceId)
  //   crash()
  // },[deviceId])

  const handleAddPayer = () => {
    setUserAsPayer();
  };
  const handleClearPayer = () => {
    clearUserAsPayer();
  };

  const handleNavigateToSpans = () => {
    router.push("/spans");
  };
  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView>
        <ThemedView style={styles.stepContainer}>
          <Button
            onPress={handleShowCurrentSessionId}
            title="SHOW SESSION ID"
          />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button
            onPress={showLastRunEndState}
            title="SHOW LAST SESSION EXIT STATE"
          />
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
          <Button onPress={handleCrashMeAnonymous} title="CRASH ME ANONYMOUS" />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleCallApi} title="Call API" />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleEndSession} title="END SESSION" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleAddPayer} title="ADD PAYER" />
          <Button onPress={handleClearPayer} title="CLEAN PAYER" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <Button onPress={sendLogs} title="LOGS (WAR/INFO/ERROR)" />
          <Button onPress={sendMessage} title="Custom Message (also a log)" />
          <Button onPress={handleErrorLog} title="Handled JS Exception" />
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleLogUnhandledError} title="CRASH" />
          <Button
            onPress={handleLogUnhandledErrorNotAnonymous}
            title="CRASH (not anonymous)"
          />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Button onPress={handleNavigateToSpans} title="NAVIGATE TO SPANS" />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginTop: 20},
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 5,
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
