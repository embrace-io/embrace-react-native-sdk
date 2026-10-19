import * as React from "react";
import {View, Text} from "react-native";
import {styles} from "../../helpers/styles";
import TestButton from "../../components/TestButton";
import {configureStore, Tuple} from "@reduxjs/toolkit";
import {trace} from "@opentelemetry/api";
import rootReducer from "./reducers";
import {counterIncrease, counterDecrease} from "./actions";
import {createEmbraceMiddleware} from "@embrace-io/react-native-redux";

const store = configureStore({
  reducer: rootReducer,
  middleware: () =>
    new Tuple(createEmbraceMiddleware(trace.getTracerProvider())),
});

const increase = () => store.dispatch(counterIncrease());

const decrease = () => store.dispatch(counterDecrease());

const ReduxTestingScreen = () => (
  <View style={styles.container}>
    <View style={styles.section}>
      <Text style={styles.title}>Actions</Text>
      <TestButton onPress={increase} title="Increase" />
      <TestButton onPress={decrease} title="Decrease" />
    </View>
  </View>
);

export {ReduxTestingScreen};
