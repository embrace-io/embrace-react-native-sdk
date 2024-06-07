import React, {ReactNode, forwardRef} from 'react';
import {TracerProvider} from '@opentelemetry/api';

import useTrace from '../otel/hooks/useTrace';
import useNavigationTracker, {type NavRef} from '../hooks/useNavigationTracker';

type NavigationTrackerRef = NavRef;
type NavigationTrackerProps = {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider: TracerProvider;
};

const NavigationTracker = forwardRef<
  NavigationTrackerRef,
  NavigationTrackerProps
>(({children, provider}, ref) => {
  // Initializing a Trace instance
  const tracer = useTrace({name: 'navigation', version: '1.0.0'}, provider);

  /**
   * NOTE
   * - should we check if the reference is the one we need even when typescript would complain if it is different?
   * (People can force the type deactivating the typescript checks)
   * - should introduce a log to warn the user if the ref is not the one we are expecting and return?
   */

  useNavigationTracker(ref, tracer);

  return <>{children}</>;
});

NavigationTracker.displayName = 'NavigationTracker';

export default NavigationTracker;
export type {NavigationTrackerRef};
