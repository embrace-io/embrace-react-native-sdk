import * as React from "react";
import {ReactNode, forwardRef, useMemo} from "react";
import {TracerProvider, TracerOptions, Attributes} from "@opentelemetry/api";

import {NavigationTracker, NavigationTrackerRef} from "./instrumentation";

interface EmbraceNavigationTrackerProps {
  children: ReactNode;
  tracerProvider?: TracerProvider;
  tracerOptions?: TracerOptions;
  screenAttributes?: Attributes;
  debug?: boolean;
}

const EMBRACE_ATTRIBUTES = {
  "emb.type": "ux.view",
};

const EmbraceNavigationTracker = forwardRef<
  NavigationTrackerRef,
  EmbraceNavigationTrackerProps
>(
  (
    {
      children,
      tracerProvider,
      tracerOptions,
      screenAttributes = {},
      debug = true,
    },
    ref,
  ) => {
    const attributes = useMemo(() => {
      if (screenAttributes) {
        return {
          ...EMBRACE_ATTRIBUTES,
          ...screenAttributes,
        };
      }

      return EMBRACE_ATTRIBUTES;
    }, [screenAttributes]);

    return (
      <NavigationTracker
        ref={ref}
        provider={tracerProvider}
        config={{
          attributes,
          debug,
          tracerOptions,
        }}>
        {children}
      </NavigationTracker>
    );
  },
);

export {EmbraceNavigationTracker};
