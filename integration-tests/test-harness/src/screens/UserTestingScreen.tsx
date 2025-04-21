import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";
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

  const getMetadata = useCallback(async () => {
    try {
      const deviceId = await getDeviceId();
      const sessionId = await getCurrentSessionId();
      const lastRunEndState = await getLastRunEndState();
      console.log("deviceId: ", deviceId);
      console.log("sessionId: ", sessionId);
      console.log("lastRunEndState: ", lastRunEndState);
    } catch (e) {
      console.log("failed to get metadata from the SDK");
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>User Properties</Text>
        <Button onPress={setUserProperties} title="Set User Properties" />
        <Button onPress={clearUserProperties} title="Clear User Properties" />
        <Button onPress={clearPersonas} title="Clear All User Personas" />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Session Properties</Text>
        <Button onPress={setSessionProperties} title="Set Session Properties" />
        <Button
          onPress={clearSessionProperties}
          title="Clear Session Properties"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Retrieval</Text>
        <Button onPress={getMetadata} title="Retrieve Metadata" />
      </View>
    </View>
  );
};

export {UserTestingScreen};
