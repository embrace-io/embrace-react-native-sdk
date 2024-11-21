import {NativeModules} from "react-native";

interface ComponentError extends Error {
  componentStack: string;
}

const isJSXError = (error: Error): error is ComponentError => {
  return "componentStack" in error;
};

const logIfComponentError = (error: Error): Promise<boolean> => {
  if (!isJSXError(error) || error.componentStack === "") {
    return Promise.resolve(false);
  }
  const {message, componentStack} = error;

  return NativeModules.EmbraceManager.logHandledError(
    message,
    componentStack,
    {},
  );
};

export {logIfComponentError};
