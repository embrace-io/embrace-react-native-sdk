import {NativeModules} from "react-native";
import {zip} from "gzip-js";

import {
  IAnyAction,
  IDispatch,
  IMiddleware,
} from "../interfaces/MiddlewareInterfaces";

/**
 * This method generates a Middleware that has to be attached to the
 * enhancer using applyMiddleware and compose
 * @returns an Embrace's middleware instance
 */
export const buildEmbraceMiddleware = () => {
  return (store: IMiddleware<IDispatch, any>) =>
    (next: IDispatch<IAnyAction>) =>
    (action: IAnyAction) => {
      if (!next || typeof next !== "function") {
        console.warn(
          "[Embrace] The state managment middleware was not applied succesfully",
        );
        return 0;
      }
      const startTime = new Date().getTime();

      try {
        const result = next(action);
        if (!action || !action.type) {
          console.warn(
            "[Embrace] An action without name was dispatched, track was skipped",
          );
        } else {
          const endTime = new Date().getTime();
          NativeModules.EmbraceManager.logRNAction(
            action.type.toString().toUpperCase(),
            startTime,
            endTime,
            {},
            zip(action.payload || 0).length,
            "SUCCESS",
          );
        }
        return result;
      } catch (e) {
        if (!action || !action.type) {
          console.warn(
            "[Embrace] An action without name was dispatched, track was skipped",
          );
        } else {
          const endTime = new Date().getTime();
          NativeModules.EmbraceManager.logRNAction(
            action.type.toString().toUpperCase(),
            startTime,
            endTime,
            {},
            zip(action.payload || 0).length,
            "FAIL",
          );
          throw e;
        }
      }

      return 0;
    };
};
