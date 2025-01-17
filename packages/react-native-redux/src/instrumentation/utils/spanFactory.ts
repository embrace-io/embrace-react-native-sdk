import {AppState} from "react-native";
import {Context, Span, SpanOptions, Tracer} from "@opentelemetry/api";

const STATIC_NAME = "action";
const ATTRIBUTES = {
  payload: `${STATIC_NAME}.payload`,
  type: `${STATIC_NAME}.type`,
  appState: `${STATIC_NAME}.state`,
  outcome: `${STATIC_NAME}.outcome`,
};

const OUTCOMES = {
  incomplete: "incomplete",
  success: "success",
  fail: "fail",
};

const spanStart = (
  tracer: Tracer,
  name: string,
  options?: SpanOptions,
  context?: Context,
) => {
  return tracer.startSpan(name, options, context);
};

const spanEnd = (span: Span, attributes: SpanOptions["attributes"]) => {
  span.setAttributes({
    [ATTRIBUTES.appState]: AppState.currentState,
    ...attributes,
  });
  span.end();
};

export {spanStart, spanEnd, ATTRIBUTES, STATIC_NAME, OUTCOMES};
