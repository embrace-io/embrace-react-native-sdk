import * as React from "react";
import {forwardRef, ReactNode} from "react";
import {TracerProvider} from "@opentelemetry/api";

import useTracerRef from "../utils/hooks/useTracerRef";
import {NavigationTrackerConfig} from "../types/navigation";
import useNativeNavigationTracker, {
  NativeNavRef,
} from "../hooks/useNativeNavigationTracker";

type NativeNavigationTrackerRef = NativeNavRef;

interface NativeNavigationTrackerProps {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider?: TracerProvider;
  config?: NavigationTrackerConfig;
}

const NativeNavigationTracker = forwardRef<
  NativeNavigationTrackerRef,
  NativeNavigationTrackerProps
>(({children, provider, config}, ref) => {
  // Initializing a Trace instance
  const tracer = useTracerRef(provider, config);

  useNativeNavigationTracker(ref, tracer, config);

  return <>{children}</>;
});

NativeNavigationTracker.displayName = "NativeNavigationTracker";
export {NativeNavigationTracker};
export type {NativeNavigationTrackerRef};
