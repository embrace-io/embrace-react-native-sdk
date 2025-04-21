import {AppState} from "react-native";
import * as React from "react";
import {FC, useRef} from "react";
import {render} from "@testing-library/react-native";
import * as rnn from "@react-navigation/native";
import api from "@opentelemetry/api";

import {EmbraceNavigationTracker} from "../";

import {
  shutdownInstanceProvider,
  createInstanceProvider,
} from "./helpers/provider";
import {TestSpanExporter} from "./helpers/exporter";
// hacky way of letting jest.spyOn work as usual. there is some kind of bug that prevents to spy directly into the `useNavigationContainerRef` hook
const rnn2 = {...rnn};

const AppWithProvider: FC<{
  exporter: TestSpanExporter;
}> = ({exporter}) => {
  const provider = createInstanceProvider(exporter);
  const ref = useRef(rnn2.useNavigationContainerRef());

  return (
    <EmbraceNavigationTracker
      ref={ref}
      tracerProvider={provider}
      screenAttributes={{test: 1234}}
      debug={true}>
      the app goes here
    </EmbraceNavigationTracker>
  );
};

describe("EmbraceNavigationTracker.tsx", () => {
  let exporter: TestSpanExporter;

  const mockAddEventListener = jest.spyOn(AppState, "addEventListener");

  const mockConsoleInfo = jest
    .spyOn(global.console, "info")
    .mockImplementation(m => m);
  const mockConsoleWarn = jest
    .spyOn(global.console, "warn")
    .mockImplementation(m => m);

  const verifySpans = (expected: object[]) => {
    expect(
      exporter.exportedSpans.map(span => ({
        name: span.name,
        attributes: span.attributes,
      })),
    ).toEqual(expected);
  };

  const mockGlobalTracer = jest.spyOn(api.trace, "getTracer");
  const mockEndSpan = jest.fn();
  const mockStartSpan = jest.fn().mockReturnValue({
    end: mockEndSpan,
    setAttributes: jest.fn(),
    setAttribute: jest.fn(),
  });

  jest.spyOn(api.trace, "getTracer").mockReturnValue({
    startSpan: mockStartSpan,
    startActiveSpan: jest.fn(),
  });

  const mockAddListener = jest.fn();
  const mockGetCurrentRoute = jest.fn();
  jest.spyOn(rnn2, "useNavigationContainerRef").mockReturnValue({
    getCurrentRoute: mockGetCurrentRoute,
    addListener: mockAddListener,
  } as unknown as ReturnType<typeof rnn.useNavigationContainerRef>);

  beforeEach(() => {
    exporter = new TestSpanExporter();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await shutdownInstanceProvider();

    if (exporter) {
      await exporter.shutdown();
    }
  });

  it("should not start tracking if the `ref` is not found", function () {
    render(
      <EmbraceNavigationTracker ref={{current: null}}>
        the app goes here
      </EmbraceNavigationTracker>,
    );

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "[Embrace] Navigation ref is not available. Make sure this is properly configured.",
    );

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "[Embrace] No TracerProvider found. Using global tracer instead.",
    );

    expect(mockGlobalTracer).toHaveBeenCalledWith(
      "@embrace-io/react-native-navigation",
      "",
    );
  });

  it("should render the proper warn messages if the `routeName` is not found", function () {
    render(<AppWithProvider exporter={exporter} />);

    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: null});
    mockNavigationListenerCall();

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "[Embrace] Navigation route name is not available. Make sure this is properly configured.",
    );
  });

  it("should render a component that implements <NavigationTracker /> passing a provider", function () {
    render(<AppWithProvider exporter={exporter} />);

    // should not call the global `getTracer` function since it should get the provider from props
    expect(mockGlobalTracer).not.toHaveBeenCalled();

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "[Embrace] TracerProvider. Using custom tracer.",
    );
    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "[Embrace] Updated TracerProvider. Switching to the new instance.",
    );

    expect(mockAddListener).toHaveBeenCalled();
    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: "homeView"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "detailsView"});
    mockNavigationListenerCall();

    // after render a view and then navigate to a different one the spanEnd should be called and it should register a complete span

    mockGetCurrentRoute.mockReturnValue({name: "detailsView"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "extraView"});
    mockNavigationListenerCall();

    // again after render a view and then navigate to a different one (the third) the spanEnd should be called and it should register a complete span

    verifySpans([
      {
        name: "homeView",
        attributes: {
          "emb.type": "ux.view",
          test: 1234,
          "view.launch": true,
          "view.state.end": "active",
          "view.name": "homeView",
        },
      },
      {
        name: "detailsView",
        attributes: {
          "emb.type": "ux.view",
          test: 1234,
          "view.launch": false,
          "view.state.end": "active",
          "view.name": "detailsView",
        },
      },
    ]);
  });

  it("should start and end spans when the app changes the status between foreground/background", function () {
    // app launches
    render(<AppWithProvider exporter={exporter} />);

    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];
    const handleAppStateChange = mockAddEventListener.mock.calls[0][1];

    // app launches, navigation listener is called
    mockGetCurrentRoute.mockReturnValue({name: "homeView"});
    // - start the first span
    mockNavigationListenerCall();

    // app goes to background
    handleAppStateChange("background");

    // - end the first span (without changing the navigation)
    // app goes back to foreground
    handleAppStateChange("active");

    // - start the second span (same view)

    // app navigates to a different view
    mockGetCurrentRoute.mockReturnValue({name: "detailsView"});
    mockNavigationListenerCall();

    // - end the second span
    // app goes to background
    handleAppStateChange("background");

    // - end the third span
    verifySpans([
      {
        name: "homeView",
        attributes: {
          "emb.type": "ux.view",
          test: 1234,
          "view.launch": true,
          "view.state.end": "background",
          "view.name": "homeView",
        },
      },
      {
        name: "homeView",
        attributes: {
          "emb.type": "ux.view",
          test: 1234,
          "view.launch": false,
          "view.state.end": "active",
          "view.name": "homeView",
        },
      },
      {
        name: "detailsView",
        attributes: {
          "emb.type": "ux.view",
          test: 1234,
          "view.launch": false,
          "view.state.end": "background",
          "view.name": "detailsView",
        },
      },
    ]);
  });
});
