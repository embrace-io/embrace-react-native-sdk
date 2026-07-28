import * as React from "react";
import {View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
import TestButton from "../components/TestButton";
import {
  setUserIdentifier,
  clearUserIdentifier,
  setUsername,
  clearUsername,
  setUserEmail,
  clearUserEmail,
  addUserPersona,
  clearUserPersona,
  clearAllUserPersonas,
  addSessionProperty,
  removeSessionProperty,
  getDeviceId,
  getCurrentSessionId,
  getLastRunEndState,
} from "@embrace-io/react-native";

const UserTestingScreen = () => {
  const setUserProperties = useCallback(async () => {
    try {
      await setUserIdentifier("user-identifier");
      await setUsername("user-name");
      await setUserEmail("user@test.com");
      await addUserPersona("persona1");
    } catch (e) {
      console.log("failed to set user properties");
    }
  }, []);

  const clearUserProperties = useCallback(async () => {
    try {
      await clearUserIdentifier();
      await clearUsername();
      await clearUserEmail();
      await clearUserPersona("persona1");
    } catch (e) {
      console.log("failed to clear user properties");
    }
  }, []);

  const clearPersonas = useCallback(async () => {
    try {
      await addUserPersona("all-personas1");
      await addUserPersona("all-personas2");
      await clearAllUserPersonas();
    } catch (e) {
      console.log("failed to clear user personas");
    }
  }, []);

  const setSessionProperties = useCallback(async () => {
    try {
      await addSessionProperty("my-property", "foo-bar", false);
      await addSessionProperty(
        "my-permanent-property",
        "foo-bar-permanent",
        true,
      );
    } catch (e) {
      console.log("failed to set session properties");
    }
  }, []);

  const clearSessionProperties = useCallback(async () => {
    try {
      await removeSessionProperty("my-property");
      await removeSessionProperty("my-permanent-property");
    } catch (e) {
      console.log("failed to clear session properties");
    }
  }, []);

  const [metadata, setMetadata] = React.useState({
    deviceId: "",
    sessionId: "",
    lastRunEndState: "",
  });

  const getMetadata = useCallback(async () => {
    try {
      setMetadata({
        deviceId: await getDeviceId(),
        sessionId: await getCurrentSessionId(),
        lastRunEndState: await getLastRunEndState(),
      });
    } catch (e) {
      console.log("failed to get metadata from the SDK");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>User Properties</Text>
        <TestButton onPress={setUserProperties} title="Set User Properties" />
        <TestButton onPress={clearUserProperties} title="Clear User Properties" />
        <TestButton onPress={clearPersonas} title="Clear All User Personas" />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Session Properties</Text>
        <TestButton onPress={setSessionProperties} title="Set Session Properties" />
        <TestButton
          onPress={clearSessionProperties}
          title="Clear Session Properties"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Retrieval</Text>
        <TestButton onPress={getMetadata} title="Retrieve Metadata" />
        {/* These getters return values in-app rather than sending a payload, so render them
            for Appium to read. testID gives iOS its accessibility id, accessibilityLabel
            gives Android its content-desc, so `~metadata-*` resolves on both platforms. */}
        <Text
          style={styles.text}
          testID="metadata-device-id"
          accessibilityLabel="metadata-device-id">
          {metadata.deviceId}
        </Text>
        <Text
          style={styles.text}
          testID="metadata-session-id"
          accessibilityLabel="metadata-session-id">
          {metadata.sessionId}
        </Text>
        <Text
          style={styles.text}
          testID="metadata-last-run-end-state"
          accessibilityLabel="metadata-last-run-end-state">
          {metadata.lastRunEndState}
        </Text>
      </View>
    </View>
  );
};

export {UserTestingScreen};
