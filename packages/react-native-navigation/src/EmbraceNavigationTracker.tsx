import * as React from "react";
import {ReactNode, forwardRef, useMemo} from "react";
// TBD: will export types from otel package so this can be pulled directly from `@opentelemetry/instrumentation-react-native-navigation`
import {NavigationTrackerRef} from "@opentelemetry/instrumentation-react-native-navigation/build/src/components/NavigationTracker";
import {NavigationTracker} from "@opentelemetry/instrumentation-react-native-navigation";
import {TracerProvider, TracerOptions, Attributes} from "@opentelemetry/api";

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
