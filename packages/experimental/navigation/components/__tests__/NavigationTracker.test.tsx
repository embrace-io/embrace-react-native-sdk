import {Text} from "react-native";
import {Ref} from "react";
import {render} from "@testing-library/react-native";

import NavigationTracker from "../NavigationTracker";
import useNavigationTracker, {NavRef} from "../../hooks/useNavigationTracker";

jest.mock("../../hooks/useNavigationTracker", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGetTracer = jest.fn();
const mockStartSpan = jest.fn();

const mockProvider = {
  getTracer: mockGetTracer,
  startSpan: mockStartSpan,
};

const mockNavigationRef = {
  current: {
    // keep mocking functions when needed
    addListener: jest.fn(),
    getCurrentRoute: jest.fn(),
  },
} as unknown as Ref<NavRef>;

describe("NavigationTracker.tsx", () => {
  it("should render component and call the hook", () => {
    const screen = render(
      <NavigationTracker ref={mockNavigationRef} provider={mockProvider}>
        {/* @ts-expect-error @typescript-eslint/ban-ts-comment */}{" "}
        <Text>my app goes here</Text>
      </NavigationTracker>,
    );

    expect(useNavigationTracker).toHaveBeenCalledWith(
      mockNavigationRef,
      expect.objectContaining({
        current: expect.objectContaining({
          _provider: expect.objectContaining({
            _delegate: expect.objectContaining(mockProvider),
          }),
          name: "navigation",
          version: "0.1.0",
          options: undefined,
        }),
      }),
    );

    expect(screen.getByText("my app goes here")).toBeDefined();
  });
});
