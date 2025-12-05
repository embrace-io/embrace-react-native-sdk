import * as React from "react";
import {Button, View, Text, ScrollView, Alert} from "react-native";
import {useCallback, useState} from "react";
import {styles} from "../helpers/styles";
import {
  // Configuration
  configurePromiseRejection,
  getPromiseRejectionConfig,
  // Breadcrumb
  addBreadcrumbAsync,
  // Logging
  logInfoAsync,
  logWarningAsync,
  logErrorAsync,
  logHandledErrorAsync,
  logMessageAsync,
  // Session
  addSessionPropertyAsync,
  removeSessionPropertyAsync,
  endSessionAsync,
  // User
  setUserIdentifierAsync,
  setUsernameAsync,
  setUserEmailAsync,
  clearUserIdentifierAsync,
  clearUsernameAsync,
  clearUserEmailAsync,
  addUserPersonaAsync,
  clearUserPersonaAsync,
  clearAllUserPersonasAsync,
  // Network
  recordNetworkRequestAsync,
  logNetworkClientErrorAsync,
} from "@embrace-io/react-native";

const AsyncTestingScreen = () => {
  const [rejectionCount, setRejectionCount] = useState(0);
  const [lastRejection, setLastRejection] = useState("");
  const [loggingEnabled, setLoggingEnabled] = useState(false);

  // Configure promise rejection handler
  const setupCustomHandler = useCallback(() => {
    configurePromiseRejection({
      enabled: true,
      logToConsole: true,
      customHandler: (methodName: string, error: Error) => {
        setRejectionCount(prev => prev + 1);
        setLastRejection(`${methodName}: ${error.message}`);
      },
    });
    Alert.alert("Success", "Custom rejection handler configured");
  }, []);

  const toggleConsoleLogging = useCallback(() => {
    const newState = !loggingEnabled;
    setLoggingEnabled(newState);
    configurePromiseRejection({
      logToConsole: newState,
    });
    Alert.alert(
      "Success",
      `Console logging ${newState ? "enabled" : "disabled"}`,
    );
  }, [loggingEnabled]);

  const checkConfig = useCallback(() => {
    const config = getPromiseRejectionConfig();
    Alert.alert(
      "Configuration",
      `Enabled: ${config.enabled}\nLog to console: ${config.logToConsole}\nCustom handler: ${config.customHandler ? "Yes" : "No"}`,
    );
  }, []);

  // Breadcrumb tests
  const testBreadcrumb = useCallback(() => {
    addBreadcrumbAsync("Test breadcrumb from async API");
    Alert.alert("Success", "Breadcrumb added (fire-and-forget)");
  }, []);

  const testMultipleBreadcrumbs = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      addBreadcrumbAsync(`Rapid breadcrumb ${i}`);
    }
    Alert.alert("Success", "Added 10 breadcrumbs (fire-and-forget)");
  }, []);

  // Logging tests
  const testLogging = useCallback(() => {
    logInfoAsync("Info log from async API");
    logWarningAsync("Warning log from async API");
    logErrorAsync("Error log from async API");
    logMessageAsync("Custom message from async API", "info", {
      test_key: "test_value",
    });
    Alert.alert("Success", "4 logs sent (fire-and-forget)");
  }, []);

  const testHandledError = useCallback(() => {
    const testError = new Error("Test error from async API");
    testError.stack = "Mock stack trace";
    logHandledErrorAsync(testError, {
      context: "async_test",
      screen: "AsyncTestingScreen",
    });
    Alert.alert("Success", "Handled error logged (fire-and-forget)");
  }, []);

  const testHighFrequencyLogs = useCallback(() => {
    for (let i = 0; i < 50; i++) {
      logInfoAsync(`High-frequency log ${i}`);
    }
    Alert.alert("Success", "Sent 50 logs (fire-and-forget)");
  }, []);

  // User tests
  const testUserIdentifier = useCallback(() => {
    setUserIdentifierAsync("async_test_user_123");
    setUsernameAsync("async_tester");
    setUserEmailAsync("async@test.com");
    Alert.alert("Success", "User info set (fire-and-forget)");
  }, []);

  const testUserPersonas = useCallback(() => {
    addUserPersonaAsync("tester");
    addUserPersonaAsync("async_user");
    addUserPersonaAsync("integration_test");
    Alert.alert("Success", "3 personas added (fire-and-forget)");
  }, []);

  const testClearUser = useCallback(() => {
    clearUserIdentifierAsync();
    clearUsernameAsync();
    clearUserEmailAsync();
    clearAllUserPersonasAsync();
    Alert.alert("Success", "All user data cleared (fire-and-forget)");
  }, []);

  // Session tests
  const testSessionProperties = useCallback(() => {
    addSessionPropertyAsync("test_key", "test_value", false);
    addSessionPropertyAsync("permanent_key", "permanent_value", true);
    Alert.alert("Success", "Session properties added (fire-and-forget)");
  }, []);

  const testRemoveProperty = useCallback(() => {
    removeSessionPropertyAsync("test_key");
    Alert.alert("Success", "Property removed (fire-and-forget)");
  }, []);

  const testEndSession = useCallback(() => {
    endSessionAsync();
    Alert.alert("Success", "Session ended (fire-and-forget)");
  }, []);

  // Network tests
  const testNetworkRequest = useCallback(() => {
    const startTime = Date.now();
    const endTime = startTime + 250;

    recordNetworkRequestAsync(
      "https://api.example.com/test",
      "GET",
      startTime,
      endTime,
      100,
      500,
      200,
    );
    Alert.alert("Success", "Network request recorded (fire-and-forget)");
  }, []);

  const testNetworkError = useCallback(() => {
    const startTime = Date.now();
    const endTime = startTime + 1000;

    logNetworkClientErrorAsync(
      "https://api.example.com/error",
      "POST",
      startTime,
      endTime,
      "NetworkError",
      "Connection timeout",
    );
    Alert.alert("Success", "Network error logged (fire-and-forget)");
  }, []);

  // Real-world scenario tests
  const testLoginFlow = useCallback(() => {
    // Simulate user login
    addBreadcrumbAsync("user_login_started");
    setUserIdentifierAsync("user_real_123");
    setUsernameAsync("john_doe");
    setUserEmailAsync("john@example.com");
    addUserPersonaAsync("premium");
    addSessionPropertyAsync("login_method", "email", true);
    logInfoAsync("User login completed");
    addBreadcrumbAsync("user_login_completed");
    Alert.alert("Success", "Login flow completed (fire-and-forget)");
  }, []);

  const testCheckoutFlow = useCallback(() => {
    // Simulate e-commerce checkout
    addBreadcrumbAsync("checkout_started");
    addSessionPropertyAsync("cart_items", "3", false);
    addSessionPropertyAsync("cart_value", "99.99", false);
    logInfoAsync("User viewing checkout");

    addBreadcrumbAsync("payment_submitted");
    logInfoAsync("Processing payment");

    const startTime = Date.now();
    recordNetworkRequestAsync(
      "https://api.payment.com/charge",
      "POST",
      startTime,
      startTime + 500,
      200,
      50,
      200,
    );

    addBreadcrumbAsync("payment_success");
    logInfoAsync("Payment completed");
    Alert.alert("Success", "Checkout flow completed (fire-and-forget)");
  }, []);

  const testLogoutFlow = useCallback(() => {
    // Simulate user logout
    addBreadcrumbAsync("user_logout_started");
    clearUserIdentifierAsync();
    clearUsernameAsync();
    clearUserEmailAsync();
    clearAllUserPersonasAsync();
    removeSessionPropertyAsync("cart_items");
    removeSessionPropertyAsync("cart_value");
    logInfoAsync("User logged out");
    addBreadcrumbAsync("user_logout_completed");
    Alert.alert("Success", "Logout flow completed (fire-and-forget)");
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Promise Rejection Configuration</Text>
        <Button
          onPress={setupCustomHandler}
          title="Setup Custom Handler"
        />
        <Button
          onPress={toggleConsoleLogging}
          title={`${loggingEnabled ? "Disable" : "Enable"} Console Logging`}
        />
        <Button onPress={checkConfig} title="Check Configuration" />
        {rejectionCount > 0 && (
          <Text style={styles.text}>
            Rejections: {rejectionCount}
            {"\n"}
            Last: {lastRejection}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Breadcrumb Tests</Text>
        <Button onPress={testBreadcrumb} title="Add Single Breadcrumb" />
        <Button
          onPress={testMultipleBreadcrumbs}
          title="Add 10 Breadcrumbs"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Logging Tests</Text>
        <Button onPress={testLogging} title="Test All Log Levels" />
        <Button onPress={testHandledError} title="Log Handled Error" />
        <Button onPress={testHighFrequencyLogs} title="Send 50 Logs" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>User Tests</Text>
        <Button onPress={testUserIdentifier} title="Set User Info" />
        <Button onPress={testUserPersonas} title="Add 3 Personas" />
        <Button onPress={testClearUser} title="Clear All User Data" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Session Tests</Text>
        <Button onPress={testSessionProperties} title="Add Properties" />
        <Button onPress={testRemoveProperty} title="Remove Property" />
        <Button onPress={testEndSession} title="End Session" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Network Tests</Text>
        <Button onPress={testNetworkRequest} title="Log Network Request" />
        <Button onPress={testNetworkError} title="Log Network Error" />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Real-World Scenarios</Text>
        <Button onPress={testLoginFlow} title="Simulate Login Flow" />
        <Button onPress={testCheckoutFlow} title="Simulate Checkout Flow" />
        <Button onPress={testLogoutFlow} title="Simulate Logout Flow" />
      </View>
    </ScrollView>
  );
};

export {AsyncTestingScreen};
