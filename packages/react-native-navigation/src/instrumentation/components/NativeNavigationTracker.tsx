import * as React from "react";
import {forwardRef} from "react";

import useTracerRef from "../utils/hooks/useTracerRef";
import {TrackerProps} from "../types/navigation";
import useNativeNavigationTracker, {
  NativeNavRef as NativeNavigationTrackerRef,
} from "../hooks/useNativeNavigationTracker";

const NativeNavigationTracker = forwardRef<
  NativeNavigationTrackerRef,
  TrackerProps
>(({children, provider, config}, ref) => {
  // Initializing a Trace instance
  const tracer = useTracerRef(provider, config);

  useNativeNavigationTracker(ref, tracer, config);

  return <>{children}</>;
});

NativeNavigationTracker.displayName = "NativeNavigationTracker";
export {NativeNavigationTracker};
export type {NativeNavigationTrackerRef};
