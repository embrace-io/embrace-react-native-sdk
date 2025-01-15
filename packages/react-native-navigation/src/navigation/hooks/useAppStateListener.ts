import {AppState, AppStateStatus} from "react-native";
import {MutableRefObject, useCallback, useEffect} from "react";
import {Attributes} from "@opentelemetry/api";

import {spanCreatorAppState} from "../utils/spanFactory";
import {TracerRef} from "../utils/hooks/useTracerRef";
import {SpanRef} from "../utils/hooks/useSpanRef";

const useAppStateListener = (
  tracer: TracerRef,
  span: SpanRef,
  view: MutableRefObject<string | null>,
  attributes?: Attributes,
) => {
  /**
   * App State Span Factory
   */
  const initAppStateSpan = useCallback(
    (currentState: AppStateStatus) => {
      const appStateHandler = spanCreatorAppState(tracer, span, attributes);

      if (view?.current === null) {
        return;
      }

      appStateHandler(view?.current, currentState);
    },
    [tracer, span, attributes, view],
  );

  /**
   * App State Listener changes
   */
  useEffect(() => {
    const handleAppStateChange = (currentState: AppStateStatus) => {
      initAppStateSpan(currentState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [initAppStateSpan]);
};

export default useAppStateListener;
