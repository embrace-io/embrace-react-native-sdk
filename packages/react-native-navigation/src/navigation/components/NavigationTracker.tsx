import React, {forwardRef, ReactNode} from "react";
import {TracerProvider} from "@opentelemetry/api";

import useTracerRef from "../utils/hooks/useTracerRef";
import {NavigationTrackerConfig} from "../types/navigation";
import useNavigationTracker, {NavRef} from "../hooks/useNavigationTracker";

type NavigationTrackerRef = NavRef;

interface NavigationTrackerProps {
  children: ReactNode;
  // selected provider, configured by the app consumer if global tracer is not enough
  provider?: TracerProvider;
  config?: NavigationTrackerConfig;
}

const NavigationTracker = forwardRef<
  NavigationTrackerRef,
  NavigationTrackerProps
>(({children, provider, config}, ref) => {
  // Initializing a Trace instance
  const tracer = useTracerRef(provider, config);

  useNavigationTracker(ref, tracer, config);

  return <>{children}</>;
});

NavigationTracker.displayName = "NavigationTracker";

export {NavigationTracker};
export type {NavigationTrackerRef};
