import {Text} from "react-native";
import * as React from "react";
import {useState} from "react";
import {fireEvent, render, screen} from "@testing-library/react-native";

import {
  EmbraceErrorBoundary,
  EmbraceErrorBoundaryFallbackProps,
} from "../components/EmbraceErrorBoundary";

const mockLogMessageWithSeverityAndProperties = jest.fn();

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logMessageWithSeverityAndProperties: (...args: unknown[]) =>
      mockLogMessageWithSeverityAndProperties(...args),
  },
}));

const BrokenComponent = () => {
  throw new Error("render failed");
};

describe("EmbraceErrorBoundary", () => {
  beforeEach(() => {
    mockLogMessageWithSeverityAndProperties.mockResolvedValue(true);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders its children when nothing throws", () => {
    render(
      <EmbraceErrorBoundary fallback={() => <Text>fallback</Text>}>
        <Text>children</Text>
      </EmbraceErrorBoundary>,
    );

    expect(screen.getByText("children")).toBeTruthy();
    expect(screen.queryByText("fallback")).toBeNull();
    expect(mockLogMessageWithSeverityAndProperties).not.toHaveBeenCalled();
  });

  it("logs the error with its component stack and passes both to the fallback", () => {
    const Fallback = jest.fn<
      React.ReactNode,
      [EmbraceErrorBoundaryFallbackProps]
    >(() => <Text>fallback</Text>);

    render(
      <EmbraceErrorBoundary fallback={Fallback}>
        <BrokenComponent />
      </EmbraceErrorBoundary>,
    );

    expect(screen.getByText("fallback")).toBeTruthy();
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledTimes(1);
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledWith(
      "render failed",
      "error",
      {},
      expect.stringContaining("BrokenComponent"),
      true,
    );

    const loggedComponentStack =
      mockLogMessageWithSeverityAndProperties.mock.calls[0][3];
    expect(Fallback.mock.calls[0][0]).toEqual({
      error: expect.objectContaining({message: "render failed"}),
      componentStack: loggedComponentStack,
      resetError: expect.any(Function),
    });
  });

  it("logs the error even when the fallback throws", () => {
    const BrokenFallback = () => {
      throw new Error("fallback failed");
    };

    expect(() =>
      render(
        <EmbraceErrorBoundary fallback={BrokenFallback}>
          <BrokenComponent />
        </EmbraceErrorBoundary>,
      ),
    ).toThrow("fallback failed");
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when no fallback is given", () => {
    render(
      <EmbraceErrorBoundary>
        <BrokenComponent />
      </EmbraceErrorBoundary>,
    );

    expect(screen.toJSON()).toBeNull();
    expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalledTimes(1);
  });

  it("calls onError with the error and its component stack", () => {
    const onError = jest.fn();

    render(
      <EmbraceErrorBoundary onError={onError}>
        <BrokenComponent />
      </EmbraceErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({message: "render failed"}),
      expect.stringContaining("BrokenComponent"),
    );
  });

  it("renders a fallback that uses hooks", () => {
    const Fallback = () => {
      const [label] = useState("fallback with state");
      return <Text>{label}</Text>;
    };

    render(
      <EmbraceErrorBoundary fallback={Fallback}>
        <BrokenComponent />
      </EmbraceErrorBoundary>,
    );

    expect(screen.getByText("fallback with state")).toBeTruthy();
  });

  it("renders its children again after resetError", () => {
    let shouldThrow = true;
    const SometimesBroken = () => {
      if (shouldThrow) {
        throw new Error("render failed");
      }
      return <Text>children</Text>;
    };
    const Fallback = ({resetError}: EmbraceErrorBoundaryFallbackProps) => (
      <Text onPress={resetError}>try again</Text>
    );

    render(
      <EmbraceErrorBoundary fallback={Fallback}>
        <SometimesBroken />
      </EmbraceErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.press(screen.getByText("try again"));

    expect(screen.getByText("children")).toBeTruthy();
  });
});
