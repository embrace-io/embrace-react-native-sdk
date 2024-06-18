import {MutableRefObject} from "react";

import {TracerRef} from "./hooks/useTrace";
import {SpanRef} from "./hooks/useSpan";

const ATTRIBUTES = {
  initialView: "initial_view",
};

const spanStart = (
  tracer: TracerRef,
  span: SpanRef,
  currentRouteName: string,
  isFirstView: boolean,
) => {
  if (!tracer.current) {
    // do nothing in case for some reason the tracer is not initialized
    return;
  }

  // Starting the span
  span.current = tracer.current.startSpan(currentRouteName);

  if (isFirstView) {
    // it should create the first span knowing there is not a previous view
    span.current.setAttribute(ATTRIBUTES.initialView, true);
  }
};

const spanEnd = (span: SpanRef) => {
  if (span.current) {
    span.current.end();
  }
};

const spanCreator = (
  tracer: TracerRef,
  span: SpanRef,
  view: MutableRefObject<string | null>,
  currentRouteName: string,
) => {
  if (!tracer.current) {
    // do nothing in case for some reason the tracer is not initialized
    return;
  }

  const isFirstView = view.current === null;

  const shouldEndCurrentSpan =
    view.current !== null && view.current !== currentRouteName;

  // it means the view has changed and we are ending the previous span
  if (shouldEndCurrentSpan) {
    spanEnd(span);
  }

  spanStart(tracer, span, currentRouteName, isFirstView);

  // last step before it changes the view
  view.current = currentRouteName;
};

export default spanCreator;
export {spanStart, spanEnd};
