import {Span} from '@opentelemetry/api';
import {MutableRefObject, useRef} from 'react';

type SpanRef = MutableRefObject<Span | null>;

const useSpan = (): SpanRef => {
  // otel
  const spanRef = useRef<Span | null>(null);
  return spanRef;
};

export default useSpan;
export {type SpanRef};
