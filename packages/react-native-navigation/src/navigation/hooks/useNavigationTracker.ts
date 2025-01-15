import {ForwardedRef, useEffect, useMemo, useRef} from "react";

import {spanCreator, spanEnd} from "../utils/spanFactory";
import {TracerRef} from "../utils/hooks/useTracerRef";
import useSpanRef from "../utils/hooks/useSpanRef";
import useConsole from "../utils/hooks/useConsole";
import {
  INavigationContainer,
  NavigationTrackerConfig,
} from "../types/navigation";

import useAppStateListener from "./useAppStateListener";

export type NavRef = INavigationContainer;

const useNavigationTracker = (
  ref: ForwardedRef<NavRef>,
  tracer: TracerRef,
  config?: NavigationTrackerConfig,
) => {
  const navigationElRef = useMemo(() => {
    const isMutableRef = ref !== null && typeof ref !== "function";
    return isMutableRef ? ref?.current : undefined;
  }, [ref]);

  const {attributes: customAttributes, debug} = config ?? {};
  const console = useConsole(!!debug);

  const span = useSpanRef();
  const view = useRef<string | null>(null);

  /**
   * Native Navigation Span Factory
   */
  const initNavigationSpan = useMemo(
    () => spanCreator(tracer, span, view, customAttributes),
    [customAttributes],
  );

  /**
   * Registering the Navigation 'state' Listener
   * to start and end spans depending on the navigation lifecycle
   */
  useEffect(() => {
    if (!navigationElRef) {
      console.warn(
        "Navigation ref is not available. Make sure this is properly configured.",
      );

      return;
    }

    if (navigationElRef) {
      navigationElRef.addListener("state", () => {
        const {name: routeName} = navigationElRef.getCurrentRoute() ?? {};

        if (!routeName) {
          console.warn(
            "Navigation route name is not available. Make sure this is properly configured.",
          );

          // do nothing in case for some reason there is no route
          return;
        }

        initNavigationSpan(routeName);
      });
    }
  }, [navigationElRef, initNavigationSpan]);

  /**
   * Start and end spans depending on the app state changes
   */
  useAppStateListener(tracer, span, view, customAttributes);

  /**
   * Ending the final span depending on the app lifecycle
   */
  useEffect(
    () => () => {
      // making sure the final span is ended when the app is unmounted
      spanEnd(span, undefined, true);
    },
    [span],
  );
};

export default useNavigationTracker;
