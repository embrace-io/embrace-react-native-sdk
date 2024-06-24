import React, {Text, AppState} from "react-native";
import {ForwardedRef} from "react";
import {cleanup, render} from "@testing-library/react-native";
import {useNavigationContainerRef} from "@react-navigation/native";

import NavigationTracker from "../NavigationTracker";
import {ATTRIBUTES} from "../../otel/spanCreator";
import {NavRef} from "../../hooks/useNavigationTracker";
import useProvider from "../../../testUtils/hooks/useProvider";

const mockAddListener = jest.fn();
const mockGetCurrentRoute = jest.fn();

jest.mock("@react-navigation/native", () => ({
  __esModule: true,
  useNavigationContainerRef: jest.fn(),
}));

const mockAddEventListener = jest.spyOn(AppState, "addEventListener");

const AppWithProvider = ({shouldPassProvider = true}) => {
  const ref = useNavigationContainerRef();
  const provider = useProvider();

  return (
    <NavigationTracker
      ref={ref as unknown as ForwardedRef<NavRef>}
      provider={shouldPassProvider ? provider : undefined}>
      {/* @ts-expect-error @typescript-eslint/ban-ts-comment */}
      <Text>my app goes here</Text>
    </NavigationTracker>
  );
};

describe("NavigationTracker.tsx", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    mockAddEventListener.mockRestore();
  });

  const mockConsoleDir = jest.spyOn(console, "dir");
  (useNavigationContainerRef as jest.Mock).mockImplementation(() => ({
    current: {
      getCurrentRoute: mockGetCurrentRoute,
      addListener: mockAddListener,
      dispatch: jest.fn(),
      navigate: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      isReady: jest.fn(),
      canGoBack: jest.fn(),
      setParams: jest.fn(),
      isFocused: jest.fn(),
      getId: jest.fn(),
      getParent: jest.fn(),
      getState: jest.fn(),
    },
  }));

  it("should render a component that implements <NavigationTracker /> without passing a provider", () => {
    const screen = render(<AppWithProvider shouldPassProvider={false} />);

    expect(mockAddListener).toHaveBeenCalledWith("state", expect.any(Function));
    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: "first-view-test"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockNavigationListenerCall();

    // after render a view and then navigate to a different one the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "first-view-test",
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

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "third-view-test"});
    mockNavigationListenerCall();

    // again after render a view and then navigate to a different one (the third) the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "second-view-test",
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

    expect(mockAddListener).toHaveBeenCalledWith("state", expect.any(Function));
    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: "first-view-test"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockNavigationListenerCall();

    // after render a view and then navigate to a different one the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "first-view-test",
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

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockNavigationListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "third-view-test"});
    mockNavigationListenerCall();

    // again after render a view and then navigate to a different one (the third) the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "second-view-test",
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
    const mockNavigationListenerCall = mockAddListener.mock.calls[0][1];
    const handleAppStateChange = mockAddEventListener.mock.calls[0][1];

    // app launches, navigation listener is called
    mockGetCurrentRoute.mockReturnValue({name: "initial-view-after-launch"});
    // - start the first span
    mockNavigationListenerCall();

    // app goes to background
    handleAppStateChange("background");

    // - end the first span (without changing the navigation)
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
    handleAppStateChange("active");

    // - start the second span (same view)

    // app navigates to a different view
    mockGetCurrentRoute.mockReturnValue({name: "next-view"});
    mockNavigationListenerCall();

    // - end the second span
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
    handleAppStateChange("background");

    // - end the third span
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
