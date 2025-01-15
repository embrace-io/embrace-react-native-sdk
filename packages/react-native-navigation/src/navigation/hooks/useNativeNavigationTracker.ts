import {ForwardedRef, useEffect, useMemo, useRef} from "react";

import {spanCreator, spanEnd} from "../utils/spanFactory";
import {TracerRef} from "../utils/hooks/useTracerRef";
import useSpanRef from "../utils/hooks/useSpanRef";
import useConsole from "../utils/hooks/useConsole";
import {
  INativeNavigationContainer,
  NavigationTrackerConfig,
} from "../types/navigation";

import useAppStateListener from "./useAppStateListener";

export type NativeNavRef = INativeNavigationContainer;

const useNativeNavigationTracker = (
  ref: ForwardedRef<NativeNavRef>,
  tracer: TracerRef,
  config?: NavigationTrackerConfig,
) => {
  const navigationElRef = useMemo(() => {
    const isMutableRef = ref !== null && typeof ref !== "function";
    return isMutableRef ? ref?.current : undefined;
  }, [ref]);

  const {attributes: customAttributes, debug} = config ?? {};
  const console = useConsole(!!debug);

  const view = useRef<string | null>(null);
  const span = useSpanRef();

  /**
   * Navigation Span Factory
   */
  const initNativeNavigationSpan = useMemo(
    () => spanCreator(tracer, span, view, customAttributes),
    [customAttributes, span, tracer],
  );

  /**
   * Registering the componentDidAppear and componentDidDisappear listeners
   * to start and end spans depending on the navigation lifecycle
   */
  useEffect(() => {
    if (!navigationElRef) {
      console.warn(
        "Navigation ref is not available. Make sure this is properly configured.",
      );

      // do nothing in case for some reason there is no navigationElRef
      return;
    }

    navigationElRef.registerComponentDidAppearListener(({componentName}) => {
      if (!componentName) {
        console.warn(
          "Navigation component name is not available. Make sure this is properly configured.",
        );

        // do nothing in case for some reason there is no route
        return;
      }

      initNativeNavigationSpan(componentName);
    });

    navigationElRef.registerComponentDidDisappearListener(({componentName}) => {
      if (!componentName) {
        console.warn(
          "Navigation component name is not available. Make sure this is properly configured.",
        );

        // do nothing in case for some reason there is no route
        return;
      }

      spanEnd(span);
    });
  }, [navigationElRef, span, initNativeNavigationSpan, console]);

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

export default useNativeNavigationTracker;
