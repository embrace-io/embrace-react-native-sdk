import * as React from "react";
import {ReactNode, forwardRef, useMemo} from "react";
import {TracerProvider, TracerOptions, Attributes} from "@opentelemetry/api";

import {
  NativeNavigationTracker,
  NativeNavigationTrackerRef,
} from "./navigation";

interface EmbraceNativeNavigationTrackerProps {
  children: ReactNode;
  tracerProvider?: TracerProvider;
  tracerOptions?: TracerOptions;
  screenAttributes?: Attributes;
  debug?: boolean;
}

const EMBRACE_ATTRIBUTES = {
  "emb.type": "ux.view",
};

const EmbraceNativeNavigationTracker = forwardRef<
  NativeNavigationTrackerRef,
  EmbraceNativeNavigationTrackerProps
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
      <NativeNavigationTracker
        ref={ref}
        provider={tracerProvider}
        config={{
          attributes,
          debug,
          tracerOptions,
        }}>
        {children}
      </NativeNavigationTracker>
    );
  },
);

export {EmbraceNativeNavigationTracker};
