import {TracerProvider} from '@opentelemetry/api';
import {forwardRef, ReactNode} from 'react';

import useNativeNavigationTracker, {
  type NativeNavRef,
} from '../hooks/useNativeNavigationTracker';
import useTrace from '../otel/hooks/useTrace';

type NativeNavigationTrackerRef = NativeNavRef;
interface NativeNavigationTrackerProps {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider: TracerProvider;
}

const NativeNavigationTracker = forwardRef<
  NativeNavigationTrackerRef,
  NativeNavigationTrackerProps
>(({children, provider}, ref) => {
  // Initializing a Trace instance
  const tracer = useTrace({name: 'native-navigation', version: '0.1.0'}, provider);

  useNativeNavigationTracker(ref, tracer);

  return <>{children}</>;
});

NativeNavigationTracker.displayName = 'NativeNavigationTracker';
export default NativeNavigationTracker;
export type {NativeNavigationTrackerRef};
