/**
 * will track navigation change events
 * react-navigation / expo or react-native-navigation
 */

import {ForwardedRef, useEffect, useMemo, useRef} from 'react';

import useSpan from '../otel/hooks/useSpan';
import {TracerRef} from '../otel/hooks/useTrace';
import spanCreator from '../otel/spanCreator';
import { TNavigationContainer } from '../types/navigation';

type NavRef = TNavigationContainer;

const useNavigationTracker = (ref: ForwardedRef<NavRef>, tracer: TracerRef) => {
  const navigationElRef = useMemo(() => {
    const isMutableRef = ref !== null && typeof ref !== 'function';
    return isMutableRef ? ref.current : undefined;
  }, [ref]);

  // tracking specific (no otel related)
  const navView = useRef<string | null>(null);

  // Initializing a Span
  const span = useSpan();

  useEffect(() => {
    if (navigationElRef) {
      navigationElRef.addListener('state', () => {
        const {name: routeName} = navigationElRef.getCurrentRoute() ?? {};

        if (!routeName) {
          // do nothing in case for some reason there is no route
          return;
        }

        spanCreator(tracer, span, navView, routeName);
      });
    }
  }, [navigationElRef, tracer]);
};

export default useNavigationTracker;
export {type NavRef};
