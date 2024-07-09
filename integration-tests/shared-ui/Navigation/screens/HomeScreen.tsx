import React, {useRef, useState} from "react";
import {View, Alert, StyleSheet} from "react-native";
import {
  endMoment,
  addBreadcrumb,
  logMessage,
  startMoment,
  getLastRunEndState,
  getCurrentSessionId,
} from "@embrace-io/react-native";
import {getPokemonWithAxios, getPokemonWithFetch} from "../api/apis";
import ActionButton, {IAction} from "../components/ActionButton";
import WebViewScreen from "./WebViewScreen";
import ActionList from "../components/ActionList";
import {
  addSpanAttributeToSpan,
  addSpanEventToSpan,
  recordCompletedSpan,
  recordSpan,
  startSpan,
  stopSpan,
} from "@embrace-io/react-native-spans";

const HomeScreen = () => {
  const [hasMomentStarted, setHasMomentStarted] = useState(false);

  const spanIdBase = useRef<string>();
  const spanIdChildrenLevel1 = useRef<string>();
  const spanIdChildrenLevel2 = useRef<string>();

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
      id: "get-last-run",
      name: "Show LastRunEndState",
      onPress: () => {
        getLastRunEndState().then(resp => {
          Alert.alert("LastRunEndState", resp);
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "get-last-session",
      name: "Show Current Session ID",
      onPress: () => {
        getCurrentSessionId().then(resp => {
          Alert.alert("Current Session ID", resp);
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "start-base-span",
      name: "Start Span With Name",
      onPress: () => {
        const date = new Date();
        startSpan(`Span Name`, undefined, date.getTime()).then(id => {
          if (id === false) {
            return;
          }
          spanIdBase.current = id as string;
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "start-child-span-level-1",
      name: "Start Span With Name 2",
      onPress: () => {
        const date = new Date();
        startSpan(
          `Span Child Level 1`,
          spanIdBase.current,
          date.getTime(),
        ).then(id => {
          if (id === false) {
            return;
          }
          spanIdChildrenLevel1.current = id as string;
        });
      },
      backgroundColor: "lightblue",
    },

    {
      id: "start-child-span-level-2",
      name: "Start Span With Name 2",
      onPress: () => {
        const date = new Date();
        startSpan(
          `Span Child Level 2`,
          spanIdChildrenLevel1.current,
          date.getTime(),
        ).then(id => {
          if (id === false) {
            return;
          }
          spanIdChildrenLevel2.current = id as string;
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "stop-base-span",
      name: "Stop Base Span",
      onPress: () => {
        const date = new Date();
        if (spanIdBase.current) {
          stopSpan(spanIdBase.current, "None", date.getTime());
        } else {
          console.log("Couldn't find the Span Id, stop span will be ignored");
        }
      },
      backgroundColor: "lightblue",
    },
    {
      id: "stop-child-span-level-1",
      name: "Stop Child Span Level 1",
      onPress: () => {
        const date = new Date();
        console.log("START TIME 1-", date);
        date.setMinutes(-25);
        console.log("START TIME 2-", date);

        if (spanIdChildrenLevel1.current) {
          stopSpan(spanIdChildrenLevel1.current, "None", date.getTime());
        } else {
          console.log("Couldn't find the Span Id, stop span will be ignored");
        }
      },
      backgroundColor: "lightblue",
    },
    {
      id: "stop-child-span-level-2",
      name: "Stop Child Span Level 2",
      onPress: () => {
        const date = new Date();
        if (spanIdChildrenLevel2.current) {
          stopSpan(spanIdChildrenLevel2.current, "None", date.getTime());
        } else {
          console.log("Couldn't find the Span Id, stop span will be ignored");
        }
      },
      backgroundColor: "lightblue",
    },
    {
      id: "add-event-to-base-span",
      name: "Add Event to Base Span",
      onPress: () => {
        const name = `Event Name - Base Span`;
        const time = new Date().getTime();
        const at = {atName: "atValue"};
        if (spanIdBase.current) {
          addSpanEventToSpan(spanIdBase.current, name, time, at)
            .catch(e => console.log("addSpanEventToSpanId CATCH", e))
            .then(r => console.log("addSpanEventToSpanId THEN", r));
        } else {
          console.log(
            "Couldn't find the Span Id, add event to base span will be ignored",
          );
        }
      },
      backgroundColor: "lightblue",
    },
    {
      id: "add-attribute-to-base-span",
      name: "Add Attribute to Base Span",
      onPress: () => {
        const key = "atName";
        const value = "atValue";
        if (spanIdBase.current) {
          addSpanAttributeToSpan(spanIdBase.current, key, value)
            .catch(e => console.log("addSpanAttributesToSpanId CATCH", e))
            .then(r => console.log("addSpanAttributesToSpanId THEN", r));
        } else {
          console.log(
            "Couldn't find the Span Id, add attribute to base span will be ignored",
          );
        }
      },
      backgroundColor: "lightblue",
    },
    {
      id: "record-span-arround-callback",
      name: "Record Event Span",
      onPress: () => {
        const name = `Span Name - Arround Callback`;
        const at = {at1: "ValueAt1"};
        const at2 = {at2: "ValueAt2"};
        const events = [
          {
            name: "Event 2",
            timeStampMs: new Date().getTime(),
            attributes: at2,
          },
        ];

        const myCallback = () => {
          console.log("Callback Span Recorded Called Successfully");
        };

        recordSpan(name, myCallback, at, events, spanIdBase.current).then(r => {
          console.log("Span Recorded Successfully");
        });
      },
      backgroundColor: "lightblue",
    },
    {
      id: "record-completed-no-base-span",
      name: "recordCompletedSpan Event Span",
      onPress: () => {
        const name = `Completed Span without parent`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = "None";
        const at = {at1: "value at 1"};
        const events = [
          {
            name: "Event f",
            timestampNanos: new Date().getTime(),
            attributes: {eventAtt: "value event att"},
          },
        ];

        recordCompletedSpan(name, st, et, errorCode, undefined, at, events)
          .catch(e => console.log("crash", e))
          .then(r => console.log("Record Completed Span Successfully", r));
      },
      backgroundColor: "lightblue",
    },
    {
      id: "record-completed-base-span",
      name: "recordCompletedSpan Event Span",
      onPress: () => {
        const name = `Record completed base span as parent`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = "None";
        const at = {at1: "value at 1"};
        const events = [
          {
            name: "Event f",
            timestampNanos: new Date().getTime(),
            attributes: {eventAtt: "value event att"},
          },
        ];

        recordCompletedSpan(
          name,
          st,
          et,
          errorCode,
          spanIdBase.current,
          at,
          events,
        )
          .catch(e => console.log("Record Complete Base Span Fails", e))
          .then(r => console.log("Record Complete Base Span Successfully", r));
      },
      backgroundColor: "lightblue",
    },
    {
      id: "record-completed-span-children-level-1",
      name: "recordCompletedSpan Event Span",
      onPress: () => {
        const name = `Record completed children span level 1 as parent`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = "None";
        const at = {at1: "value at 1"};
        const events = [
          {
            name: "Event f",
            timestampNanos: new Date().getTime(),
            attributes: {eventAtt: "value event att"},
          },
        ];

        recordCompletedSpan(
          name,
          st,
          et,
          errorCode,
          spanIdChildrenLevel1.current,
          at,
          events,
        )
          .catch(e =>
            console.log("Record Complete Children Span Level 1 Fails", e),
          )
          .then(r =>
            console.log(
              "Record Complete Children Span Level 1 Successfully",
              r,
            ),
          );
      },
      backgroundColor: "lightblue",
    },
    {
      id: "record-completed-span-children-level-2",
      name: "recordCompletedSpan Event Span",
      onPress: () => {
        const name = `Record completed children span level 2 as parent`;
        const st = new Date().getTime();
        const et = new Date().getTime();
        const errorCode = "None";
        const at = {at1: "value at 1"};
        const events = [
          {
            name: "Event f",
            timestampNanos: new Date().getTime(),
            attributes: {eventAtt: "value event att"},
          },
        ];

        recordCompletedSpan(
          name,
          st,
          et,
          errorCode,
          spanIdChildrenLevel2.current,
          at,
          events,
        )
          .catch(e =>
            console.log("Record Complete Children Span Level 2 Fails", e),
          )
          .then(r =>
            console.log(
              "Record Complete Children Span Level 2 Successfully",
              r,
            ),
          );
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
  endMomentButtonContainer: {position: "absolute", bottom: 10, width: "100%"},
});
