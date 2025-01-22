import {Navigation} from "react-native-navigation";
import {AppState} from "react-native";
import * as React from "react";
import {FC, useRef} from "react";
import {render} from "@testing-library/react-native";
import api from "@opentelemetry/api";

import {EmbraceNativeNavigationTracker} from "../";

import {
  shutdownInstanceProvider,
  createInstanceProvider,
} from "./helpers/provider";
import {TestSpanExporter} from "./helpers/exporter";

const AppWithProvider: FC<{
  exporter: TestSpanExporter;
}> = ({exporter}) => {
  const provider = createInstanceProvider(exporter);
  const ref = useRef(Navigation.events());

  return (
    <EmbraceNativeNavigationTracker
      ref={ref}
      tracerProvider={provider}
      screenAttributes={{test: 1234}}
      debug={true}>
      the app goes here
    </EmbraceNativeNavigationTracker>
  );
};

describe("EmbraceNativeNavigationTracker.tsx", () => {
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

  const mockDidAppearListener = jest.fn();
  const mockDidDisappearListener = jest.fn();
  jest
    .spyOn(Navigation, "events")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .mockReturnValue({
      registerComponentDidAppearListener: mockDidAppearListener,
      registerComponentDidDisappearListener: mockDidDisappearListener,
    });

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
      <EmbraceNativeNavigationTracker ref={{current: null}}>
        the app goes here
      </EmbraceNativeNavigationTracker>,
    );

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Navigation ref is not available. Make sure this is properly configured.",
    );

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "No TracerProvider found. Using global tracer instead.",
    );

    expect(mockGlobalTracer).toHaveBeenCalledWith(
      "@embrace-io/react-native-navigation",
      "",
    );
  });

  it("should render the proper warn messages if the `componentName` is not found", function () {
    render(<AppWithProvider exporter={exporter} />);

    const didAppearCall = mockDidDisappearListener.mock.calls[0][0];
    didAppearCall({componentName: null});

    expect(mockStartSpan).not.toHaveBeenCalled();

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Navigation component name is not available. Make sure this is properly configured.",
    );

    const didDisappearCall = mockDidDisappearListener.mock.calls[0][0];
    didDisappearCall({componentName: null});

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Navigation component name is not available. Make sure this is properly configured.",
    );
  });

  it("should render a component that implements <EmbraceNativeNavigationTracker /> passing a provider", function () {
    render(<AppWithProvider exporter={exporter} />);

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "TracerProvider. Using custom tracer.",
    );
    expect(mockConsoleInfo).toHaveBeenCalledWith(
      "Updated TracerProvider. Switching to the new instance.",
    );

    expect(mockDidAppearListener).toHaveBeenCalled();
    const didAppearCall = mockDidAppearListener.mock.calls[0][0];
    didAppearCall({componentName: "homeView"});

    expect(mockDidDisappearListener).toHaveBeenCalled();
    const didDisappearCall = mockDidDisappearListener.mock.calls[0][0];
    didDisappearCall({componentName: "homeView"});

    // creates a new span
    didAppearCall({componentName: "detailsView"});
    didDisappearCall({componentName: "detailsView"});

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
    render(<AppWithProvider exporter={exporter} />);

    expect(mockDidAppearListener).toHaveBeenCalled();
    const didAppearCall = mockDidAppearListener.mock.calls[0][0];

    expect(mockDidDisappearListener).toHaveBeenCalled();
    const didDisappearCall = mockDidDisappearListener.mock.calls[0][0];

    const handleAppStateChange = mockAddEventListener.mock.calls[0][1];

    // app launches
    didAppearCall({componentName: "homeView"});
    // app goes to background
    handleAppStateChange("background");

    // creates a new span: at this point it should grab the first span adding 'background' as app state

    // back to foreground
    handleAppStateChange("active");
    // user navigates to another view so the previous one disappears. it should end the previous span
    didDisappearCall({componentName: "homeView"});

    // user gets the next view after navigate
    didAppearCall({componentName: "detailsView"});

    // at this point a new span should be created with the same name but saying it's in 'active' state (foreground)

    // app goes to background
    handleAppStateChange("background");

    // and for that reason it should create a new span with the same name but in 'background' state
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

    // handleAppStateChange("active");
  });
});
