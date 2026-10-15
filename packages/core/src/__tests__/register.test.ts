import {
  context,
  createContextKey,
  ProxyTracerProvider,
  ROOT_CONTEXT,
  Span,
  trace,
  TracerProvider,
} from "@opentelemetry/api";

import type {registerTracerProvider as RegisterTracerProvider} from "../tracerProvider/register";
import {StackContextManager} from "../tracerProvider/StackContextManager";
import type {EmbraceNativeTracerProviderConfig} from "../tracerProvider";

const mockAppStateListener = jest.fn();

jest.mock("react-native", () => ({
  AppState: {
    addEventListener: (type: string, listener: () => void) =>
      mockAppStateListener(type, listener),
  },
  Platform: {
    OS: "ios",
  },
}));

jest.mock("../tracerProvider/TracerProviderModule", () => ({
  TracerProviderModule: {
    setupTracer: jest.fn(),
    startSpan: jest.fn(() =>
      Promise.resolve({traceId: "", spanId: "", traceFlags: 0}),
    ),
  },
}));

const loadRegister = () => {
  jest.resetModules();
  return {
    registerTracerProvider: require("../tracerProvider/register")
      .registerTracerProvider as typeof RegisterTracerProvider,
    api: require("@opentelemetry/api") as typeof import("@opentelemetry/api"),
  };
};

const getStartSpanMock = (): jest.Mock =>
  require("../tracerProvider/TracerProviderModule").TracerProviderModule
    .startSpan;

const getGlobalTracerProvider = () =>
  (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();

const getActiveSpanInside = (provider: TracerProvider) => {
  let started: Span | undefined;
  let active: Span | undefined;

  provider.getTracer("test").startActiveSpan("my-active-span", span => {
    started = span;
    active = trace.getSpan(context.active());
  });

  return {started, active};
};

describe("registerTracerProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    trace.disable();
    context.disable();
  });

  it("should register the provider as the global tracer provider", () => {
    const provider = loadRegister().registerTracerProvider();

    expect(getGlobalTracerProvider()).toBe(provider);
  });

  it("should construct and register only one provider", () => {
    const {registerTracerProvider, api} = loadRegister();
    const setGlobalTracerProvider = jest.spyOn(
      api.trace,
      "setGlobalTracerProvider",
    );
    const setGlobalContextManager = jest.spyOn(
      api.context,
      "setGlobalContextManager",
    );

    const provider = registerTracerProvider();

    expect(registerTracerProvider({spanContextSyncBehaviour: "throw"})).toBe(
      provider,
    );
    expect(mockAppStateListener).toHaveBeenCalledTimes(1);
    expect(setGlobalTracerProvider).toHaveBeenCalledTimes(1);
    expect(setGlobalContextManager).toHaveBeenCalledTimes(1);
  });

  it("should forward the config to the provider", () => {
    const span = loadRegister()
      .registerTracerProvider({spanContextSyncBehaviour: "throw"})
      .getTracer("test")
      .startSpan("my-span");

    expect(() => span.spanContext()).toThrow(Error);
  });

  it.each<EmbraceNativeTracerProviderConfig | undefined>([
    undefined,
    {},
    {registerGlobally: true},
  ])(
    "should register the provider and its context manager globally with config %p",
    config => {
      const provider = loadRegister().registerTracerProvider(config);

      const {started, active} = getActiveSpanInside(provider);

      expect(started).toBeDefined();
      expect(active).toBe(started);
      expect(getGlobalTracerProvider()).toBe(provider);
    },
  );

  it("should leave the OTel globals alone when registerGlobally is false", () => {
    context.setGlobalContextManager(new StackContextManager().enable());

    const provider = loadRegister().registerTracerProvider({
      registerGlobally: false,
    });
    const startSpan = getStartSpanMock();
    const key = createContextKey("test-key");

    expect(
      context.with(ROOT_CONTEXT.setValue(key, 1), () =>
        context.active().getValue(key),
      ),
    ).toBe(1);

    const tracer = provider.getTracer("test");
    let active: Span | undefined;
    tracer.startActiveSpan("my-active-span", () => {
      active = trace.getSpan(context.active());
      tracer.startSpan("my-child-span");
    });

    const parentNativeID = startSpan.mock.calls[0][3];
    expect(parentNativeID).toBeTruthy();
    expect(startSpan.mock.calls[1][9]).toBe(parentNativeID);
    expect(active).toBeUndefined();
    expect(getGlobalTracerProvider()).not.toBe(provider);
  });

  it("should warn when another tracer provider is already registered", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const otherProvider = {getTracer: jest.fn()} as unknown as TracerProvider;
    trace.setGlobalTracerProvider(otherProvider);

    const provider = loadRegister().registerTracerProvider();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Could not register the Embrace tracer provider"),
    );
    expect(provider).toBeInstanceOf(
      require("../tracerProvider/EmbraceNativeTracerProvider")
        .EmbraceNativeTracerProvider,
    );
    expect(getGlobalTracerProvider()).toBe(otherProvider);
  });

  it("should warn when the context manager cannot be registered", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const {registerTracerProvider, api} = loadRegister();
    jest.spyOn(api.context, "setGlobalContextManager").mockReturnValue(false);

    registerTracerProvider();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Could not register the Embrace context manager"),
    );
  });

  it("should not warn on a clean registration", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    loadRegister().registerTracerProvider();

    expect(warn).not.toHaveBeenCalled();
  });

  it("should not throw when a non-Embrace span is active", () => {
    const provider = loadRegister().registerTracerProvider();

    const nonEmbraceSpan = trace.wrapSpanContext({
      traceId: "a".repeat(32),
      spanId: "b".repeat(16),
      traceFlags: 1,
    });

    expect(() =>
      context.with(trace.setSpan(context.active(), nonEmbraceSpan), () =>
        provider.getTracer("t").startSpan("child"),
      ),
    ).not.toThrow();
    expect(getStartSpanMock().mock.lastCall?.[9]).toBe("");
  });
});
