/**
 * will track navigation change events
 * react-navigation / expo or react-native-navigation
 */

import {AppStateStatus} from "react-native";
import {ForwardedRef, useCallback, useEffect, useMemo, useRef} from "react";

import {INavigationContainer} from "../types/navigation";
import spanCreator, {spanEnd, spanStart} from "../otel/spanCreator";
import {TracerRef} from "../otel/hooks/useTrace";
import useSpan from "../otel/hooks/useSpan";

import useAppStateListener from "./useAppStateListener";

type NavRef = INavigationContainer;

const useNavigationTracker = (ref: ForwardedRef<NavRef>, tracer: TracerRef) => {
  const navigationElRef = useMemo(() => {
    const isMutableRef = ref !== null && typeof ref !== "function";
    return isMutableRef ? ref.current : undefined;
  }, [ref]);

  // tracking specific (no otel related)
  const navView = useRef<string | null>(null);

  // Initializing a Span
  const span = useSpan();

  useEffect(() => {
    if (navigationElRef) {
      navigationElRef.addListener("state", () => {
        const {name: routeName} = navigationElRef.getCurrentRoute() ?? {};

        if (!routeName) {
          // do nothing in case for some reason there is no route
          return;
        }

        spanCreator(tracer, span, navView, routeName);
      });
    }
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
      if (
        navView.current === null ||
        currentState === null ||
        currentState === undefined
      ) {
        return;
      }

      if (currentState === "active") {
        spanStart(tracer, span, navView?.current);
      } else {
        spanEnd(span, currentState);
      }
    },
    [span, tracer],
  );

  useAppStateListener(handleAppStateListener);
};

export default useNavigationTracker;
export {type NavRef};
