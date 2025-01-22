import * as React from "react";
import {forwardRef} from "react";

import useTracerRef from "../utils/hooks/useTracerRef";
import {TrackerProps} from "../types/navigation";
import useNavigationTracker, {
  NavRef as NavigationTrackerRef,
} from "../hooks/useNavigationTracker";

const NavigationTracker = forwardRef<NavigationTrackerRef, TrackerProps>(
  ({children, provider, config}, ref) => {
    // Initializing a Trace instance
    const tracer = useTracerRef(provider, config);

    useNavigationTracker(ref, tracer, config);

    return <>{children}</>;
  },
);

NavigationTracker.displayName = "NavigationTracker";

export {NavigationTracker};
export type {NavigationTrackerRef};
