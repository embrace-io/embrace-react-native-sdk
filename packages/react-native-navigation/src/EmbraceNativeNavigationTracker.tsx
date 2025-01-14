import * as React from "react";
import {ReactNode, forwardRef, useMemo} from "react";
// TBD: will export types from otel package so this can be pulled directly from `@opentelemetry/instrumentation-react-native-navigation`
import {NativeNavigationTrackerRef} from "@opentelemetry/instrumentation-react-native-navigation/build/src/components/NativeNavigationTracker";
import {NativeNavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {TracerProvider, TracerOptions, Attributes} from "@opentelemetry/api";

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
