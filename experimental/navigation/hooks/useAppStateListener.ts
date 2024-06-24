import {AppState, AppStateStatus} from "react-native";
import {useEffect} from "react";

type CallbackFn = (currentState: AppStateStatus) => void;

const useAppStateListener = (callback?: CallbackFn) => {
  useEffect(() => {
    const handleAppStateChange = (currentState: AppStateStatus) => {
      callback?.(currentState);
    };

    AppState.addEventListener("change", handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, [callback]);
};

export default useAppStateListener;
