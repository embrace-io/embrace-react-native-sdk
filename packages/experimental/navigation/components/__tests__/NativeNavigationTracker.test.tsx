import {Text} from "react-native";
import {ForwardedRef} from "react";
import {render} from "@testing-library/react-native";

import NativeNavigationTracker from "../NativeNavigationTracker";
import useNativeNavigationTracker, {
  NativeNavRef,
} from "../../hooks/useNativeNavigationTracker";

const mockGetTracer = jest.fn();
const mockStartSpan = jest.fn();

const mockProvider = {
  getTracer: mockGetTracer,
  startSpan: mockStartSpan,
};

jest.mock("../../hooks/useNativeNavigationTracker", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockRegisterComponentDidAppearListener = jest.fn();
const mockRegisterComponentDidDisappearListener = jest.fn();
const mockRegisterCommandListener = jest.fn();
const mockNativeNavigationRef = {
  current: {
    // keep mocking functions when needed
    registerComponentDidAppearListener: mockRegisterComponentDidAppearListener,
    registerComponentDidDisappearListener:
      mockRegisterComponentDidDisappearListener,
    registerCommandListener: mockRegisterCommandListener,
  },
} as unknown as ForwardedRef<NativeNavRef>;

describe("NativeNavigationTracker.tsx", () => {
  it("should render component and call the hook", () => {
    const screen = render(
      <NativeNavigationTracker
        ref={mockNativeNavigationRef}
        provider={mockProvider}>
        {/* @ts-expect-error @typescript-eslint/ban-ts-comment */}
        <Text>my app goes here</Text>
      </NativeNavigationTracker>,
    );

    expect(useNativeNavigationTracker).toHaveBeenCalledWith(
      mockNativeNavigationRef,
      expect.objectContaining({
        current: expect.objectContaining({
          _provider: expect.objectContaining({
            _delegate: expect.objectContaining(mockProvider),
          }),
          name: "native-navigation",
          version: "0.1.0",
          options: undefined,
        }),
      }),
    );

    expect(screen.getByText("my app goes here")).toBeDefined();
  });
});
