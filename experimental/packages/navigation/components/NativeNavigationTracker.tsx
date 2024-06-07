import React, {ReactNode, forwardRef} from 'react';
import {TracerProvider} from '@opentelemetry/api';

import useTrace from '../otel/hooks/useTrace';
import useNativeNavigationTracker, {
  type NativeNavRef,
} from '../hooks/useNativeNavigationTracker';

type NativeNavigationTrackerRef = NativeNavRef;
type NativeNavigationTrackerProps = {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider: TracerProvider;
};

const NativeNavigationTracker = forwardRef<
  NativeNavigationTrackerRef,
  NativeNavigationTrackerProps
>(({children, provider}, ref) => {
  // Initializing a Trace instance
  const tracer = useTrace({name: 'navigation', version: '1.0.0'}, provider);

  /**
   * NOTE
   * - should we check if the reference is the one we need even when typescript would complain if it is different?
   * (People can force the type deactivating the typescript checks)
   * - should introduce a log to warn the user if the ref is not the one we are expecting and return?
   */

  useNativeNavigationTracker(ref, tracer);

  return <>{children}</>;
});

NativeNavigationTracker.displayName = 'NativeNavigationTracker';
export default NativeNavigationTracker;
export type {NativeNavigationTrackerRef};
