/**
 * will track navigation change events
 * react-native-navigation
 */

import {ForwardedRef, useEffect, useMemo, useRef} from "react";

import {INativeNavigationContainer} from "../types/navigation";
import spanCreator, {spanEnd} from "../otel/spanCreator";
import {TracerRef} from "../otel/hooks/useTrace";
import useSpan from "../otel/hooks/useSpan";

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
};

export default useNativeNavigationTracker;
export {type NativeNavRef};
