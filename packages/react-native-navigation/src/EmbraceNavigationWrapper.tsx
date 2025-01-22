import * as React from "react";
import {
  ReactNode,
  forwardRef,
  useMemo,
  type PropsWithoutRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import {TracerProvider, TracerOptions, Attributes} from "@opentelemetry/api";

import {TrackerProps} from "./instrumentation/types/navigation";

const EMBRACE_ATTRIBUTES = {
  "emb.type": "ux.view",
};

interface EmbraceNavigationWrapperProps {
  children: ReactNode;
  tracerProvider?: TracerProvider;
  tracerOptions?: TracerOptions;
  screenAttributes?: Attributes;
  debug?: boolean;
}

const EmbraceNavigationWrapper = <TRef,>(
  NavigationComponent: ForwardRefExoticComponent<
    PropsWithoutRef<TrackerProps> & RefAttributes<TRef>
  >,
) =>
  forwardRef<TRef, EmbraceNavigationWrapperProps>((props, ref) => {
    const {
      children,
      tracerProvider,
      screenAttributes,
      debug = true,
      tracerOptions,
    } = props;

    const attributes = useMemo(() => {
      if (screenAttributes) {
        return {
          ...screenAttributes,
          ...EMBRACE_ATTRIBUTES,
        };
      }

      return EMBRACE_ATTRIBUTES;
    }, [screenAttributes]);

    return (
      <NavigationComponent
        ref={ref}
        provider={tracerProvider}
        config={{
          attributes,
          debug,
          tracerOptions,
        }}>
        {children}
      </NavigationComponent>
    );
  });

EmbraceNavigationWrapper.displayName = "EmbraceNavigationWrapper";

export {EmbraceNavigationWrapper, EmbraceNavigationWrapperProps};
