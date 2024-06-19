import {EventsRegistry, Navigation} from "react-native-navigation";
import React, {Text} from "react-native";
import {useRef} from "react";
import {cleanup, render} from "@testing-library/react-native";

import NativeNavigationTracker from "../NativeNavigationTracker";
import useProvider from "../../../testUtils/hooks/useProvider";

const mockDidAppearListener = jest.fn();
const mockDidDisappearListener = jest.fn();

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
        attributes: {initial_view: true},
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
        attributes: {},
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
        attributes: {initial_view: true},
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
        attributes: {},
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    expect(screen.getByText("my app goes here")).toBeDefined();
  });
});
