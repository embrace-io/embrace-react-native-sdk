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
    async (action: IAnyAction) => {
      if (!next || typeof next !== "function") {
        console.warn(
          "[Embrace] The state managment middleware was not applied succesfully",
        );
        return 0;
      }

      if (!action) {
        console.warn(
          "[Embrace] You have to provide an action in order to track actions",
        );
        return 0;
      }
      if (!action.type) {
        console.warn(
          "[Embrace] You have to provide an action type in order to track actions",
        );
        return 0;
      }
      const startTime = new Date().getTime();
      const attributes = {
        name: action.type.toString().toUpperCase(),
        payload_size: zip(action.payload || 0).length.toString(),
        "emb.type": "sys.rn_action",
        outcome: "INCOMPLETE",
      };
      const spanId = await NativeModules.EmbraceManager.startSpan(
        "emb-rn-action",
        undefined,
        startTime,
      );
      Object.entries(attributes).forEach(([key, value]) =>
        NativeModules.EmbraceManager.addSpanAttributeToSpan(spanId, key, value),
      );

      try {
        const result = next(action);
        if (!action || !action.type) {
          console.warn(
            "[Embrace] An action without name was dispatched, track was skipped",
          );
        } else {
          const endTime = new Date().getTime();
          NativeModules.EmbraceManager.addSpanAttributeToSpan(
            spanId,
            "outcome",
            "SUCCESS",
          ),
            NativeModules.EmbraceManager.stopSpan(spanId, "None", endTime);
        }
        return result;
      } catch (e) {
        if (!action || !action.type) {
          console.warn(
            "[Embrace] An action without name was dispatched, track was skipped",
          );
        } else {
          const endTime = new Date().getTime();

          NativeModules.EmbraceManager.addSpanAttributeToSpan(
            spanId,
            "outcome",
            "FAIL",
          ),
            NativeModules.EmbraceManager.stopSpan(spanId, "Failure", endTime);
          throw e;
        }
      }

      return 0;
    };
};
