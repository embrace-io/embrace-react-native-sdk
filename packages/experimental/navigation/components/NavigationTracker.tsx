import React, {forwardRef, ReactNode} from "react";
import {TracerProvider} from "@opentelemetry/api";

import useTrace from "../otel/hooks/useTrace";
import useNavigationTracker, {type NavRef} from "../hooks/useNavigationTracker";

type NavigationTrackerRef = NavRef;
interface NavigationTrackerProps {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider: TracerProvider;
}

const NavigationTracker = forwardRef<
  NavigationTrackerRef,
  NavigationTrackerProps
>(({children, provider}, ref) => {
  // Initializing a Trace instance
  const tracer = useTrace({name: "navigation", version: "0.1.0"}, provider);

  useNavigationTracker(ref, tracer);

  return <>{children}</>;
});

NavigationTracker.displayName = "NavigationTracker";

export default NavigationTracker;
export type {NavigationTrackerRef};
