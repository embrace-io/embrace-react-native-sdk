/**
 * will track navigation change events
 * react-native-navigation
 */

import {AppStateStatus} from "react-native";
import {ForwardedRef, useCallback, useEffect, useMemo, useRef} from "react";

import spanCreator, {
  spanCreatorAppState,
  spanEnd,
} from "../utils/otel/spanCreator";
import {TracerRef} from "../utils/otel/hooks/useTrace";
import useSpan from "../utils/otel/hooks/useSpan";
import {INativeNavigationContainer} from "../types/navigation";

import useAppStateListener from "./useAppStateListener";

type NativeNavRef = INativeNavigationContainer;

const useNativeNavigationTracker = (
  ref: ForwardedRef<NativeNavRef>,
  tracer: TracerRef,
) => {
  const navigationElRef = useMemo(() => {
    const isMutableRef = ref !== null && typeof ref !== "function";
    return isMutableRef ? ref.current : undefined;
  }, [ref]);

  const navView = useRef<string | null>(null);

  // Initializing a Span
  const span = useSpan();

  useEffect(() => {
    if (!navigationElRef) {
      // do nothing in case for some reason there is no navigationElRef
      return;
    }

    navigationElRef.registerComponentDidAppearListener(({componentName}) => {
      if (!componentName) {
        // do nothing in case for some reason there is no route
        return;
      }

      spanCreator(tracer, span, navView, componentName);
    });

    navigationElRef.registerComponentDidDisappearListener(({componentName}) => {
      if (!componentName) {
        // do nothing in case for some reason there is no route
        return;
      }

      spanEnd(span);
    });
  }, [navigationElRef, span, tracer]);

  useEffect(
    () => () => {
      // making sure the final span is ended when the app is unmounted
      spanEnd(span);
    },
    [span],
  );

  const handleAppStateListener = useCallback(
    (currentState: AppStateStatus) => {
      const appStateHandler = spanCreatorAppState(tracer, span);

      if (navView?.current === null) {
        return;
      }

      appStateHandler(navView?.current, currentState);
    },
    [span, tracer],
  );

  useAppStateListener(handleAppStateListener);
};

export default useNativeNavigationTracker;
export {type NativeNavRef};
