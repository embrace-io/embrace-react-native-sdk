import {EventsRegistry, Navigation} from "react-native-navigation";
import React, {AppState, Text} from "react-native";
import {useRef} from "react";
import {cleanup, render} from "@testing-library/react-native";

import NativeNavigationTracker from "../NativeNavigationTracker";
import {ATTRIBUTES} from "../../otel/spanCreator";
import useProvider from "../../../testUtils/hooks/useProvider";

const mockDidAppearListener = jest.fn();
const mockDidDisappearListener = jest.fn();

const mockAddEventListener = jest.spyOn(AppState, "addEventListener");

const AppWithProvider = ({shouldPassProvider = true}) => {
  const provider = useProvider();
  const ref = useRef(Navigation.events());

  return (
    <NativeNavigationTracker
      ref={ref}
      provider={shouldPassProvider ? provider : undefined}>
      {/* @ts-expect-error @typescript-eslint/ban-ts-comment */}
      <Text>my app goes here</Text>
    </NativeNavigationTracker>
  );
};

describe("NativeNavigationTracker.tsx", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    mockAddEventListener.mockRestore();
  });

  const mockConsoleDir = jest.spyOn(console, "dir");
  jest.spyOn(Navigation, "events").mockImplementation(
    () =>
      ({
        registerAppLaunchedListener: jest.fn(),
        registerComponentDidAppearListener: mockDidAppearListener,
        registerComponentDidDisappearListener: mockDidDisappearListener,
      }) as unknown as EventsRegistry,
  );

  it("should render a component that implements <NavigationTracker /> without passing a provider", () => {
    const screen = render(<AppWithProvider shouldPassProvider={false} />);

    expect(mockDidAppearListener).toHaveBeenCalledWith(expect.any(Function));

    const mockDidAppearListenerCall = mockDidAppearListener.mock.calls[0][0];

    mockDidAppearListenerCall({componentName: "initial-test-view"});
    expect(mockDidDisappearListener).toHaveBeenCalledWith(expect.any(Function));

    const mockDidDisappearListenerCall =
      mockDidDisappearListener.mock.calls[0][0];

    mockDidDisappearListenerCall({componentName: "initial-test-view"});

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "initial-test-view",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: true,
          [ATTRIBUTES.appState]: "active",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    mockDidAppearListenerCall({componentName: "second-test-view"});
    mockDidDisappearListenerCall({componentName: "second-test-view"});

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "second-test-view",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: false,
          [ATTRIBUTES.appState]: "active",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    expect(screen.getByText("my app goes here")).toBeDefined();
  });

  it("should render a component that implements <NavigationTracker /> passing a custom provider", () => {
    const screen = render(<AppWithProvider shouldPassProvider={true} />);

    expect(mockDidAppearListener).toHaveBeenCalledWith(expect.any(Function));

    const mockDidAppearListenerCall = mockDidAppearListener.mock.calls[0][0];

    mockDidAppearListenerCall({componentName: "initial-test-view"});
    expect(mockDidDisappearListener).toHaveBeenCalledWith(expect.any(Function));

    const mockDidDisappearListenerCall =
      mockDidDisappearListener.mock.calls[0][0];

    mockDidDisappearListenerCall({componentName: "initial-test-view"});

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "initial-test-view",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: true,
          [ATTRIBUTES.appState]: "active",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    mockDidAppearListenerCall({componentName: "second-test-view"});
    mockDidDisappearListenerCall({componentName: "second-test-view"});

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "second-test-view",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: false,
          [ATTRIBUTES.appState]: "active",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    expect(screen.getByText("my app goes here")).toBeDefined();
  });

  it("should start and end spans when the app changes the status between foreground/background", () => {
    // app launches
    const screen = render(<AppWithProvider shouldPassProvider={true} />);
    const mockDidAppearListenerCall = mockDidAppearListener.mock.calls[0][0];
    const mockDidDisappearListenerCall =
      mockDidDisappearListener.mock.calls[0][0];
    const handleAppStateChange = mockAddEventListener.mock.calls[0][1];

    // navigation listener is called
    // - start the first span
    mockDidAppearListenerCall({componentName: "initial-view-after-launch"});

    // app goes to background
    // - end the first span (without changing the navigation)
    handleAppStateChange("background");

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "initial-view-after-launch",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: true,
          [ATTRIBUTES.appState]: "background",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    // app goes back to foreground
    // - start the second span (same view)
    handleAppStateChange("active");

    mockDidDisappearListenerCall({componentName: "initial-view-after-launch"});
    // app navigates to a different view
    // - end the second span
    mockDidAppearListenerCall({componentName: "next-view"});

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "initial-view-after-launch",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: false,
          [ATTRIBUTES.appState]: "active",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    // app goes to background
    // - end the third span
    handleAppStateChange("background");

    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "next-view",
        traceId: expect.any(String),
        attributes: {
          [ATTRIBUTES.initialView]: false,
          [ATTRIBUTES.appState]: "background",
        },
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    handleAppStateChange("active");
    expect(screen.getByText("my app goes here")).toBeDefined();
  });
});
