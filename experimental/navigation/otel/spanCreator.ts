import {MutableRefObject} from "react";

import {TracerRef} from "./hooks/useTrace";
import {SpanRef} from "./hooks/useSpan";

const ATTRIBUTES = {
  initialView: "initial_view",
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
  if (shouldEndCurrentSpan && span.current) {
    span.current.end();
  }

  // Starting the span
  span.current = tracer.current.startSpan(currentRouteName);

  if (isFirstView) {
    // it should create the first span knowing there is not a previous view
    span.current.setAttribute(ATTRIBUTES.initialView, true);
  }

  // last step before it changes the view
  view.current = currentRouteName;
};

export default spanCreator;
