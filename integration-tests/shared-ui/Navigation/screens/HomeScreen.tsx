import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import {
  endMoment,
  addBreadcrumb,
  logMessage,
  startMoment,
  getLastRunEndState,
  getCurrentSessionId,
} from "@embrace-io/react-native";
import { getPokemonWithAxios, getPokemonWithFetch } from "../api/apis";
import ActionButton, { IAction } from "../components/ActionButton";
import WebViewScreen from "./WebViewScreen";
import ActionList from "../components/ActionList";

const HomeScreen = () => {
  const [hasMomentStarted, setHasMomentStarted] = useState(false);

  const [showWebView, setShowWebView] = useState(false);

  const handleOnStartMoment = () => {
    startMoment("MomentFromEmbraceTestSuite-4");
    setHasMomentStarted(true);
  };
  const handleOnEndMoment = () => {
    endMoment("MomentFromEmbraceTestSuite-4");
    setHasMomentStarted(false);
  };

  const actions: IAction[] = [
    {
      id: "start-moment",
      name: "Start Moment",
      onPress: handleOnStartMoment,
      backgroundColor: "#6bf",
    },
    {
      id: "log-message",
      name: "Log Message",
      onPress: () => {
        logMessage("Custom Message From Embrace Test Suite");
      },
      backgroundColor: "#fd6",
    },
    {
      id: "add-breadcrumb",
      name: "Add Breadcrumb",
      onPress: () => {
        addBreadcrumb("Custom Breadcrumb From Embrace Test Suite");
      },
      backgroundColor: "#26b3bd",
    },
    {
      id: "call-api-fetch",
      name: "Log API Call Fetch",
      onPress: () => {
        getPokemonWithFetch();
      },
      backgroundColor: "#26b3bd",
    },
    {
      id: "call-api-axios",
      name: "Log API Call Fetch",
      onPress: () => {
        getPokemonWithAxios();
      },
      backgroundColor: "#26b3bd",
    },
    {
      id: "show-webview",
      name: "Show WebView",
      onPress: () => {
        setShowWebView(true);
      },
      backgroundColor: "green",
    },
    {
      id: "show-last-run",
      name: "Show LastRunEndState",
      onPress: () => {
        getLastRunEndState().then((resp) => {
          Alert.alert("LastRunEndState", resp);
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "show-last-session",
      name: "Show Current Session ID",
      onPress: () => {
        getCurrentSessionId().then((resp) => {
          Alert.alert("Current Session ID", resp);
        });
      },
      backgroundColor: "lightblue",
    },
  ];

  const handleClosePopUp = () => {
    setShowWebView(false);
  };

  return (
    <>
      <View style={styles.actionsContainer}>
        <ActionList actions={actions} />
      </View>
      <WebViewScreen visible={showWebView} closePopup={handleClosePopUp} />
      {hasMomentStarted && (
        <View style={styles.endMomentButtonContainer}>
          <ActionButton
            id="end-moment"
            backgroundColor="green"
            name="End Moment"
            onPress={handleOnEndMoment}
          />
        </View>
      )}
    </>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  actionsContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 50,
  },
  endMomentButtonContainer: { position: "absolute", bottom: 10, width: "100%" },
});
