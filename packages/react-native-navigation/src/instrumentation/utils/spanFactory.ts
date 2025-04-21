import {AppStateStatus} from "react-native";
import {MutableRefObject} from "react";
import {Attributes} from "@opentelemetry/api";

import {TracerRef} from "./hooks/useTracerRef";
import {SpanRef} from "./hooks/useSpanRef";
import {ConsoleStub} from "./hooks/useConsole";

const ATTRIBUTES = {
  initialView: "view.launch",
  finalView: "view.unmount",
  viewName: "view.name",
  appState: "view.state.end",
};

const spanStart = (
  tracer: TracerRef,
  span: SpanRef,
  currentRouteName: string,
  customAttributes?: Attributes,
  isLaunch?: boolean,
) => {
  if (!tracer.current || span.current !== null) {
    // do nothing in case for some reason the tracer is not initialized or there is already an active span
    return;
  }

  const attributes = {
    // it should create the first span knowing there is not a previous view
    [ATTRIBUTES.initialView]: !!isLaunch,
    // it should set the view name in case it's useful to have this as an attr
    [ATTRIBUTES.viewName]: currentRouteName,
    ...customAttributes,
  };

  // Starting the span
  span.current = tracer.current.startSpan(currentRouteName, {attributes});
};

const spanEnd = (
  span: SpanRef,
  appState?: AppStateStatus,
  isUnmount?: boolean,
) => {
  if (span.current) {
    span.current.setAttribute(ATTRIBUTES.appState, appState ?? "active");

    if (isUnmount) {
      span.current.setAttribute(ATTRIBUTES.finalView, true);
    }

    span.current.end();

    // make sure we destroy any existing span
    span.current = null;
  }
};

const spanCreator =
  (
    tracer: TracerRef,
    span: SpanRef,
    view: MutableRefObject<string | null>,
    console: Console | ConsoleStub,
    customAttributes?: Attributes,
  ) =>
  (currentRouteName: string) => {
    if (!tracer.current) {
      // do nothing in case for some reason the tracer is not initialized
      console.log("[Embrace] no tracer available, not creating a span");
      return;
    }

    const isInitialView = view.current === null;

    const shouldEndCurrentSpan =
      view.current !== null && view.current !== currentRouteName;

    // it means the view has changed and we are ending the previous span
    if (shouldEndCurrentSpan) {
      console.log("[Embrace] ending the current view span");
      spanEnd(span);
    }

    console.log(`[Embrace] starting a span for ${currentRouteName}`);
    spanStart(tracer, span, currentRouteName, customAttributes, isInitialView);

    // last step before it changes the view
    view.current = currentRouteName;
  };

const spanCreatorAppState =
  (tracer: TracerRef, span: SpanRef, customAttributes?: Attributes) =>
  (currentRouteName: string, currentState: AppStateStatus) => {
    if (currentState === null || currentState === undefined) {
      return;
    }

    if (currentState === "active") {
      console.log(
        `[Embrace] moving into the foreground and starting span for ${currentRouteName}`,
      );
      spanStart(tracer, span, currentRouteName, customAttributes);
    } else {
      console.log("[Embrace] moving into the background");
      spanEnd(span, currentState);
    }
  };

export {spanCreator, spanCreatorAppState, spanStart, spanEnd, ATTRIBUTES};
