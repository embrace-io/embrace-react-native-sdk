import {MutableRefObject, useRef} from "react";
import {Span} from "@opentelemetry/api";

type SpanRef = MutableRefObject<Span | null>;

const useSpan = (): SpanRef => {
  // otel
  const spanRef = useRef<Span | null>(null);
  return spanRef;
};

export default useSpan;
export {type SpanRef};
