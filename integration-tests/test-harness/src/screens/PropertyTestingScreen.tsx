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
  setUserAsPayer,
  clearUserAsPayer,
  addSessionProperty,
  removeSessionProperty,
} from "@embrace-io/react-native";

const PropertyTestingScreen = () => {
  const setUserProperties = useCallback(async () => {
    try {
      await setUserIdentifier("user-identifier");
      await setUsername("user-name");
      await setUserEmail("user@test.com");
      await addUserPersona("persona1");
      await setUserAsPayer();
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
      await clearUserAsPayer();
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

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>User</Text>
        <Button onPress={setUserProperties} title="Set User Properties" />
        <Button onPress={clearUserProperties} title="Clear User Properties" />
        <Button onPress={clearPersonas} title="Clear All User Personas" />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>User</Text>
        <Button onPress={setSessionProperties} title="Set Session Properties" />
        <Button
          onPress={clearSessionProperties}
          title="Clear Session Properties"
        />
      </View>
    </View>
  );
};

export {PropertyTestingScreen};
