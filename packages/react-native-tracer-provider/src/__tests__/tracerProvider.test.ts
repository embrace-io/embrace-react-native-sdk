import {renderHook, waitFor} from "@testing-library/react-native";
import {
  Attributes,
  context,
  SpanContext,
  SpanKind,
  SpanStatusCode,
  Link,
  trace,
  Span,
} from "@opentelemetry/api";

import {
  EmbraceNativeTracerProviderConfig,
  EmbraceNativeSpan,
  useEmbraceNativeTracerProvider,
  startView,
  endAsFailed,
  asParent,
  recordCompletedSpan,
  EmbraceNativeTracerProvider,
} from "../index";

const mockSetupTracer = jest.fn();
const mockStartSpan = jest.fn();
const mockSetAttributes = jest.fn();
const mockAddEvent = jest.fn();
const mockAddLinks = jest.fn();
const mockSetStatus = jest.fn();
const mockUpdateName = jest.fn();
const mockEndSpan = jest.fn();
const mockClearCompletedSpans = jest.fn();

const mockIsStarted = jest.fn();
const mockAppStateListener = jest.fn();

jest.mock("react-native", () => ({
  NativeModules: {
    EmbraceManager: {
      isStarted: () => mockIsStarted(),
    },
  },
  AppState: {
    addEventListener: (type: string, listener: () => void) =>
      mockAppStateListener(type, listener),
  },
  Platform: {
    OS: "ios",
  },
}));

jest.mock("../TracerProviderModule", () => ({
  TracerProviderModule: {
    setupTracer: (name: string, version?: string, schemaUrl?: string) =>
      mockSetupTracer(name, version, schemaUrl),
    startSpan: (
      tracerName: string,
      tracerVersion: string,
      tracerSchemaUrl: string,
      id: string,
      name: string,
      kind: string,
      time: number,
      attributes: Attributes,
      links: Link[],
      parentID: string,
    ) =>
      mockStartSpan(
        tracerName,
        tracerVersion,
        tracerSchemaUrl,
        id,
        name,
        kind,
        time,
        attributes,
        links,
        parentID,
      ),
    setAttributes: (id: string, attributes: Attributes) =>
      mockSetAttributes(id, attributes),
    addEvent: (
      id: string,
      name: string,
      attributes: Attributes,
      time: number,
    ) => mockAddEvent(id, name, attributes, time),
    addLinks: (id: string, links: Link[]) => mockAddLinks(id, links),
    setStatus: (id: string, status: {code: string; message?: string}) =>
      mockSetStatus(id, status),
    updateName: (id: string, name: string) => mockUpdateName(id, name),
    endSpan: (id: string, time: number) => mockEndSpan(id, time),
    clearCompletedSpans: () => mockClearCompletedSpans(),
  },
}));

describe("Embrace Native Tracer Provider", () => {
  beforeEach(async () => {
    jest.resetAllMocks();

    mockIsStarted.mockReturnValue(Promise.resolve(true));
    mockStartSpan.mockReturnValue(
      Promise.resolve({
        traceId: "",
        spanId: "",
        traceFlags: 0,
      }),
    );
  });

  const getEmptySpan = (): Span =>
    new EmbraceNativeSpan("", "", "", "return_empty");

  const getTestTracer = async ({
    name = "test",
    version = "v1",
    tracerOptions,
    config,
  }: {
    name?: string;
    version?: string;
    tracerOptions?: {schemaUrl?: string};
    config?: EmbraceNativeTracerProviderConfig;
  }) => {
    const {result} = renderHook(() => useEmbraceNativeTracerProvider(config));

    await waitFor(() => expect(result.current.tracerProvider).toBeTruthy());

    return result.current.tracerProvider!.getTracer(
      name,
      version,
      tracerOptions,
    );
  };

  it("should allow getting a tracer", async () => {
    await getTestTracer({name: "some-tracer", version: "v17"});
    expect(mockSetupTracer).toHaveBeenCalledWith("some-tracer", "v17", "");
  });

  it("should provide a tracer by default", async () => {
    const {result} = renderHook(() => useEmbraceNativeTracerProvider());

    await waitFor(() => expect(result.current.tracer).toBeTruthy());

    expect(mockSetupTracer).toHaveBeenCalledWith(
      "embrace-default-tracer",
      "",
      "",
    );

    const span = result.current.tracer!.startSpan("my-span");

    expect(mockStartSpan).toHaveBeenCalledWith(
      "embrace-default-tracer",
      "",
      "",
      (span as EmbraceNativeSpan).nativeID(),
      "my-span",
      "",
      0,
      {},
      [],
      "",
    );
  });

  it("should error if getting a tracer provider before the Embrace SDK has started", async () => {
    mockIsStarted.mockReturnValue(Promise.resolve(false));

    const {result} = renderHook(() => useEmbraceNativeTracerProvider());

    await waitFor(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isError: true,
        error:
          "The Embrace SDK must be started to use the TracerProvider, please invoke `initialize` from `@embrace-io/react-native`.",
        tracerProvider: null,
        tracer: null,
      });
    });
  });

  it("should error if there was a problem setting up the tracer provider", async () => {
    mockIsStarted.mockReturnValue(Promise.reject("rejected"));

    const {result} = renderHook(() => useEmbraceNativeTracerProvider());

    await waitFor(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isError: true,
        error: "Failed to setup EmbraceNativeTracerProvider",
        tracerProvider: null,
        tracer: null,
      });
    });
  });

  it("should allow preventing the creation of a tracer provider until a condition is met", async () => {
    const {result} = renderHook(() =>
      useEmbraceNativeTracerProvider({}, false),
    );
    await new Promise(r => setTimeout(r, 1));
    await waitFor(() => expect(result.current.tracerProvider).toBeFalsy());
  });

  it("should allow starting a span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (span as EmbraceNativeSpan).nativeID(),
      "my-span",
      "",
      0,
      {},
      [],
      "",
    );
  });

  it("should allow starting a span with options", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span", {
      kind: SpanKind.CONSUMER,
      startTime: 1718409600000,
      attributes: {
        "my-attr-1": "hello",
        "my-attr-2": true,
        "my-attr-3": ["foo", "bar"],
        "my-attr-4": 55,
      },
      links: [
        {
          context: {
            traceId: "t1",
            spanId: "s1",
            traceFlags: 0,
          },
          attributes: {
            "my-link-attr-1": "hello",
          },
          droppedAttributesCount: 0,
        },
      ],
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (span as EmbraceNativeSpan).nativeID(),
      "my-span",
      "CONSUMER",
      1718409600000,
      {
        "my-attr-1": "hello",
        "my-attr-2": true,
        "my-attr-3": ["foo", "bar"],
        "my-attr-4": 55,
      },
      [
        {
          context: {
            traceId: "t1",
            spanId: "s1",
            traceFlags: 0,
          },
          attributes: {
            "my-link-attr-1": "hello",
          },
          droppedAttributesCount: 0,
        },
      ],
      "",
    );
  });

  it("should allow starting a span with a parent", async () => {
    const tracer = await getTestTracer({});
    const parent = tracer.startSpan("my-parent-span");
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    const child = tracer.startSpan("my-child-span", {}, parentContext);

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      (parent as EmbraceNativeSpan).nativeID(),
    );
  });

  it("should not start a span with a parent when root is set", async () => {
    const tracer = await getTestTracer({});
    const parent = tracer.startSpan("my-parent-span");
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    const child = tracer.startSpan(
      "my-child-span",
      {root: true},
      parentContext,
    );

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      "",
    );
  });

  it("should allow starting an active span", async () => {
    const tracer = await getTestTracer({});
    let child = getEmptySpan();
    let parentNativeID: string = "";
    tracer.startActiveSpan("my-active-span", () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        "test",
        "v1",
        "",
        expect.any(String),
        "my-active-span",
        "",
        0,
        {},
        [],
        "",
      );
      parentNativeID = mockStartSpan.mock.calls[0][3];
      mockStartSpan.mockClear();
      child = tracer.startSpan("my-child-span");
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      parentNativeID,
    );
  });

  it("should allow starting an active span with options", async () => {
    const tracer = await getTestTracer({});
    let child = getEmptySpan();
    let parentNativeID: string = "";
    tracer.startActiveSpan("my-active-span", {kind: SpanKind.CLIENT}, () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        "test",
        "v1",
        "",
        expect.any(String),
        "my-active-span",
        "CLIENT",
        0,
        {},
        [],
        "",
      );
      parentNativeID = mockStartSpan.mock.calls[0][3];
      mockStartSpan.mockClear();
      child = tracer.startSpan("my-child-span");
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      parentNativeID,
    );
  });

  it("should allow starting an active span with children overriding their parent", async () => {
    const tracer = await getTestTracer({});
    const parent = tracer.startSpan("my-parent-span");
    const parentContext = trace.setSpan(context.active(), parent);
    mockStartSpan.mockClear();

    let child = getEmptySpan();
    tracer.startActiveSpan("my-active-span", {kind: SpanKind.CLIENT}, () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        "test",
        "v1",
        "",
        expect.any(String),
        "my-active-span",
        "CLIENT",
        0,
        {},
        [],
        "",
      );

      mockStartSpan.mockClear();
      child = tracer.startSpan("my-child-span", {}, parentContext);
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      (parent as EmbraceNativeSpan).nativeID(),
    );
  });

  it("should allow starting an active span without setting the global context manager", async () => {
    const tracer = await getTestTracer({
      config: {
        setGlobalContextManager: false,
      },
    });
    let child = getEmptySpan();
    let parentNativeID: string = "";
    tracer.startActiveSpan("my-active-span", {kind: SpanKind.CLIENT}, () => {
      expect(mockStartSpan).toHaveBeenCalledWith(
        "test",
        "v1",
        "",
        expect.any(String),
        "my-active-span",
        "CLIENT",
        0,
        {},
        [],
        "",
      );
      parentNativeID = mockStartSpan.mock.calls[0][3];
      mockStartSpan.mockClear();

      expect(trace.getSpan(context.active())).toBeFalsy();

      child = tracer.startSpan("my-child-span");
    });

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      parentNativeID,
    );
  });

  it("should return the span context when it's already available", async () => {
    const tracer = await getTestTracer({});
    const expectedSpanContext = {
      traceId: "t1",
      spanId: "s1",
      traceFlags: 0,
    };
    mockStartSpan.mockReturnValue(Promise.resolve(expectedSpanContext));

    const span = tracer.startSpan("my-span");

    // pause to allow the promise for creating the span to resolve
    await Promise.resolve();

    expect(span.spanContext()).toEqual(expectedSpanContext);
  });

  it("should return an empty span context when it is not yet available", async () => {
    // Returning empty is the default behaviour
    const tracer = await getTestTracer({});
    mockStartSpan.mockReturnValue(new Promise<SpanContext>(() => {}));

    const span = tracer.startSpan("my-span");
    expect(span.spanContext().spanId).toEqual("");
    expect(span.spanContext().traceId).toEqual("");
  });

  it("should optionally throw an error when attempting to get a pending span context", async () => {
    const tracer = await getTestTracer({
      config: {
        spanContextSyncBehaviour: "throw",
      },
    });
    mockStartSpan.mockReturnValue(new Promise<SpanContext>(() => {}));

    const span = tracer.startSpan("my-span");

    expect(() => span.spanContext()).toThrow(Error);
  });

  it("should allow getting the span context asynchronously", async () => {
    const tracer = await getTestTracer({});
    const expectedSpanContext = {
      traceId: "t1",
      spanId: "s1",
      traceFlags: 0,
    };
    mockStartSpan.mockReturnValue(Promise.resolve(expectedSpanContext));

    const span = tracer.startSpan("my-span");

    expect(await (span as EmbraceNativeSpan).spanContextAsync()).toEqual({
      traceId: "t1",
      spanId: "s1",
      traceFlags: 0,
    });
  });

  it("should allow setting attributes on a span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.setAttribute("my-attr", "val1");

    expect(mockSetAttributes).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      {
        "my-attr": "val1",
      },
    );

    mockSetAttributes.mockClear();
    span.setAttributes({
      "my-attr": "val1",
      "my-other-attr": "val2",
    });

    expect(mockSetAttributes).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      {
        "my-attr": "val1",
        "my-other-attr": "val2",
      },
    );
  });

  it("should allow adding an event to a span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event");

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {},
      0,
    );
  });

  it("should allow adding an event to a span with attributes", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event", {"my-attr": "val1"});

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {"my-attr": "val1"},
      0,
    );
  });

  it("should allow adding an event to a span with a timestamp", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event", new Date(Date.UTC(2019, 5, 15, 0, 0, 0, 0)));

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {},
      1560556800000,
    );
  });

  it("should allow adding an event to a span with attributes and a timestamp", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event", {"my-attr": "val1"}, 1590556800000);

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {"my-attr": "val1"},
      1590556800000,
    );
  });

  it("should allow adding an event to a span without attributes and a timestamp as the 3rd argument", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event", undefined, 1590556800033);

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {},
      1590556800033,
    );
  });

  it("should defer to the 3rd argument when both are set as timestamp when adding an event", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.addEvent("my-event", 1590556800022, 1590556800033);

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "my-event",
      {},
      1590556800033,
    );
  });

  it("should allow setting links on a span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    const link1 = {
      context: {
        traceId: "t1",
        spanId: "s1",
        traceFlags: 0,
      },
      attributes: {
        "my-link-attr-1": "hello",
      },
      droppedAttributesCount: 0,
    };

    span.addLink(link1);

    expect(mockAddLinks).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      [link1],
    );

    mockAddLinks.mockClear();
    const link2 = {
      context: {
        traceId: "t2",
        spanId: "s2",
        traceFlags: 0,
      },
      attributes: {
        "my-link-attr-2": "bye",
      },
      droppedAttributesCount: 0,
    };
    span.addLinks([link2]);

    expect(mockAddLinks).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      [link2],
    );
  });

  it("should allow setting a span's status", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.setStatus({code: SpanStatusCode.ERROR});
    expect(mockSetStatus).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      {
        code: "ERROR",
      },
    );
  });

  it("should allow updating a span's name", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.updateName("new-name");
    expect(mockUpdateName).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "new-name",
    );
  });

  it("should allow recording an exception on the span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.recordException({message: "error", name: "error-name"});

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "exception",
      {"exception.message": "error", "exception.type": "error-name"},
      0,
    );
  });

  it("should allow recording an exception on the span with a code and stack trace", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.recordException({
      message: "error",
      name: "error-name",
      code: "error-code",
      stack: "error-stack-trace",
    });

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "exception",
      {
        "exception.message": "error",
        "exception.type": "error-code",
        "exception.stacktrace": "error-stack-trace",
      },
      0,
    );
  });

  it("should allow recording an exception on the span with a time", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.recordException("error", new Date(Date.UTC(2024, 5, 15, 0, 0, 0)));

    expect(mockAddEvent).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      "exception",
      {"exception.message": "error"},
      1718409600000,
    );
  });

  it("should allow ending a span", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");

    expect(span.isRecording()).toBe(true);

    span.end();

    expect(mockEndSpan).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      0,
    );
    expect(span.isRecording()).toBe(false);

    // No update operations should go through after the span is ended
    span.setAttributes({
      "my-attr": "val1",
      "my-other-attr": "val2",
    });
    span.addEvent("my-event");
    span.addLinks([
      {
        context: {
          traceId: "t1",
          spanId: "s1",
          traceFlags: 0,
        },
        attributes: {
          "my-link-attr-1": "hi",
        },
        droppedAttributesCount: 0,
      },
    ]);
    span.setStatus({code: SpanStatusCode.ERROR});
    span.updateName("new-name");
    span.recordException({message: "error"});
    mockEndSpan.mockClear();
    span.end();

    expect(mockSetAttributes).not.toHaveBeenCalled();
    expect(mockAddEvent).not.toHaveBeenCalled();
    expect(mockAddLinks).not.toHaveBeenCalled();
    expect(mockSetStatus).not.toHaveBeenCalled();
    expect(mockUpdateName).not.toHaveBeenCalled();
    expect(mockEndSpan).not.toHaveBeenCalled();
  });

  it("should allow ending a span with a time", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    span.end([1600556800, 200000000]);

    expect(mockEndSpan).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      1600556800200,
    );
  });

  it("should allow getting a tracer with a schemaUrl", async () => {
    const tracer = await getTestTracer({
      name: "test",
      version: "v1",
      tracerOptions: {
        schemaUrl: "s1",
      },
    });
    expect(mockSetupTracer).toHaveBeenCalledWith("test", "v1", "s1");

    const span = tracer.startSpan("my-span");

    // Schema URL should be included to uniquely identify tracer and spans
    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "s1",
      (span as EmbraceNativeSpan).nativeID(),
      "my-span",
      "",
      0,
      {},
      [],
      "",
    );
  });

  it("should allow setting a parent that already ended", async () => {
    const tracer = await getTestTracer({});
    const parent = tracer.startSpan("my-parent-span");
    const parentContext = trace.setSpan(context.active(), parent);
    parent.end();
    mockStartSpan.mockClear();

    const child = tracer.startSpan("my-child-span", {}, parentContext);

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "my-child-span",
      "",
      0,
      {},
      [],
      (parent as EmbraceNativeSpan).nativeID(),
    );
  });

  it("should clear completed spans when the app state changes", async () => {
    await getTestTracer({});
    expect(mockAppStateListener).toHaveBeenCalled();
    expect(mockAppStateListener.mock.calls[0][0]).toBe("change");

    // Should only be called after the app state change handler was triggered
    expect(mockClearCompletedSpans).not.toHaveBeenCalled();
    mockAppStateListener.mock.calls[0][1]();
    expect(mockClearCompletedSpans).toHaveBeenCalled();
  });

  it("should provide a convenience function for starting a span representing a view", async () => {
    const tracer = await getTestTracer({});

    const span = startView(tracer, "my-view");

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (span as EmbraceNativeSpan).nativeID(),
      "emb-screen-view",
      "",
      0,
      {
        "view.name": "my-view",
        "emb.type": "ux.view",
      },
      [],
      "",
    );

    span.end();
    expect(mockEndSpan).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      0,
    );
  });

  it("should provide a convenience function for ending a span as failed", async () => {
    const tracer = await getTestTracer({});
    const span = tracer.startSpan("my-span");
    endAsFailed(span);

    expect(mockSetStatus).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      {
        code: "ERROR",
      },
    );
    expect(mockEndSpan).toHaveBeenCalledWith(
      (span as EmbraceNativeSpan).nativeID(),
      0,
    );
  });

  it("should provide a convenience function for using a span as a parent", async () => {
    const tracer = await getTestTracer({});

    const parentSpan = tracer.startSpan("the-parent");
    mockStartSpan.mockClear();

    const child = tracer.startSpan("the-child", {}, asParent(parentSpan));

    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      (child as EmbraceNativeSpan).nativeID(),
      "the-child",
      "",
      0,
      {},
      [],
      (parentSpan as EmbraceNativeSpan).nativeID(),
    );
  });

  it("should provide a convenience function for recording a completed span", async () => {
    const tracer = await getTestTracer({});
    const parentSpan = tracer.startSpan("the-parent");
    mockStartSpan.mockClear();

    recordCompletedSpan(tracer, "completed-span", {
      kind: SpanKind.CONSUMER,
      startTime: 1718409600000,
      attributes: {
        "my-attr-1": "hello",
      },
      parent: parentSpan,
      endTime: 1718409600099,
      events: [
        {
          name: "completed-span-event-1",
          attributes: {"event-attr": "bar"},
          timeStamp: 1718409600011,
        },
        {
          name: "completed-span-event-2",
        },
      ],
      status: {code: SpanStatusCode.ERROR},
    });
    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      expect.any(String),
      "completed-span",
      "CONSUMER",
      1718409600000,
      {
        "my-attr-1": "hello",
      },
      [],
      (parentSpan as EmbraceNativeSpan).nativeID(),
    );
    const spanNativeID = mockStartSpan.mock.lastCall[3];
    expect(mockAddEvent).toHaveBeenCalledTimes(2);
    expect(mockAddEvent).toHaveBeenCalledWith(
      spanNativeID,
      "completed-span-event-1",
      {"event-attr": "bar"},
      1718409600011,
    );
    expect(mockAddEvent).toHaveBeenCalledWith(
      spanNativeID,
      "completed-span-event-2",
      {},
      0,
    );
    expect(mockSetStatus).toHaveBeenCalledWith(spanNativeID, {
      code: "ERROR",
    });
    expect(mockEndSpan).toHaveBeenCalledWith(spanNativeID, 1718409600099);
  });

  it("should provide a convenience function for recording a completed span without options", async () => {
    const tracer = await getTestTracer({});

    recordCompletedSpan(tracer, "completed-span");
    expect(mockStartSpan).toHaveBeenCalledWith(
      "test",
      "v1",
      "",
      expect.any(String),
      "completed-span",
      "",
      0,
      {},
      [],
      "",
    );
    expect(mockAddEvent).not.toHaveBeenCalled();
    expect(mockSetStatus).not.toHaveBeenCalled();
    expect(mockEndSpan).toHaveBeenCalledWith(expect.any(String), 0);
  });

  it("should not collide on native span IDs when multiple tracer providers and tracers are instantiated", async () => {
    const provider1 = new EmbraceNativeTracerProvider();
    const tracer1 = provider1.getTracer("tracer", "v1");
    const tracer2 = provider1.getTracer("tracer", "v1");
    const provider2 = new EmbraceNativeTracerProvider();
    const tracer3 = provider2.getTracer("tracer", "v1");
    const tracer4 = provider2.getTracer("tracer", "v2");
    const seenIDs = new Set();
    [
      tracer1.startSpan("span1-tracer-1"),
      tracer1.startSpan("span2-tracer-1"),
      tracer2.startSpan("span3-tracer-2"),
      tracer3.startSpan("span4-tracer-3"),
      tracer4.startSpan("span5-tracer-4"),
      tracer4.startSpan("span6-tracer-4"),
    ].forEach(span => {
      const nativeID = (span as EmbraceNativeSpan).nativeID();
      expect(seenIDs.has(nativeID)).toBe(false);
      seenIDs.add(nativeID);
    });
  });
});
