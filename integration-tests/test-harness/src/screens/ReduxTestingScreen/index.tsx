import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback, useEffect, useState} from "react";
import {styles} from "../../helpers/styles";
import {EnhancedStore, configureStore, Tuple} from "@reduxjs/toolkit";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import FullScreenMessage from "../../components/FullScreenMessage";
import rootReducer from "./reducers";
import {counterIncrease, counterDecrease} from "./actions";
import {useEmbrace} from "@embrace-io/react-native";
import {useEmbraceMiddleware} from "@embrace-io/react-native-redux";

const ReduxTestingScreen = () => {
  const {isStarted} = useEmbrace({ios: {appId: "abc123"}});
  const {isError, error, tracerProvider} = useEmbraceNativeTracerProvider(
    {},
    isStarted,
  );
  const {middleware} = useEmbraceMiddleware(tracerProvider);
  const [store, setStore] = useState<EnhancedStore>();

  useEffect(() => {
    if (middleware && !store) {
      setStore(
        configureStore({
          reducer: rootReducer,
          middleware: () => new Tuple(middleware),
        }),
      );
    }
  }, [middleware, store]);

  const increaseActionHandler = useCallback(async () => {
    if (store) {
      store.dispatch(counterIncrease());
    } else {
      console.log("store isn't ready yet");
    }
  }, [store]);

  const decreaseActionHandler = useCallback(async () => {
    if (store) {
      store.dispatch(counterDecrease());
    } else {
      console.log("store isn't ready yet");
    }
  }, [store]);

  if (!store) {
    return <FullScreenMessage msg="Setting up store" />;
  }

  if (isError) {
    return <FullScreenMessage msg={error} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Actions</Text>
        <Button onPress={increaseActionHandler} title="Increase" />
        <Button onPress={decreaseActionHandler} title="Decrease" />
      </View>
    </View>
  );
};

export {ReduxTestingScreen};
