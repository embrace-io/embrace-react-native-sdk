import React, {Text} from "react-native";
import {ForwardedRef} from "react";
import {render} from "@testing-library/react-native";
import {useNavigationContainerRef} from "@react-navigation/native";

import NavigationTracker from "../NavigationTracker";
import {NavRef} from "../../hooks/useNavigationTracker";
import useProvider from "../../../testUtils/hooks/useProvider";

const mockAddListener = jest.fn();
const mockGetCurrentRoute = jest.fn();

jest.mock("@react-navigation/native", () => ({
  __esModule: true,
  useNavigationContainerRef: jest.fn(),
}));

const App = () => {
  const provider = useProvider();

  const ref = useNavigationContainerRef();

  return (
    <NavigationTracker
      ref={ref as unknown as ForwardedRef<NavRef>}
      provider={provider}>
      {/* @ts-expect-error @typescript-eslint/ban-ts-comment */}
      <Text>my app goes here</Text>
    </NavigationTracker>
  );
};

describe("NavigationTracker.tsx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("should render component and call the hook", () => {
    const screen = render(<App />);

    expect(mockAddListener).toHaveBeenCalledWith("state", expect.any(Function));

    const mockStateListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: "first-view-test"});
    mockStateListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockStateListenerCall();

    // after render a view and then navigate to a different one the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "first-view-test",
        traceId: expect.any(String),
        attributes: {initial_view: true},
        timestamp: expect.any(Number),
        duration: expect.any(Number),
      }),
      expect.objectContaining({depth: expect.any(Number)}),
    );

    mockGetCurrentRoute.mockReturnValue({name: "second-view-test"});
    mockStateListenerCall();

    mockGetCurrentRoute.mockReturnValue({name: "third-view-test"});
    mockStateListenerCall();

    // again after render a view and then navigate to a different one (the third) the spanEnd should be called and it should register a complete span
    expect(mockConsoleDir).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "second-view-test",
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
