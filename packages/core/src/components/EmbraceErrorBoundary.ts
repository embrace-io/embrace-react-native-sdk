import * as React from "react";
import {ComponentType, ErrorInfo, PropsWithChildren} from "react";

import {safePromise} from "../utils/promiseHandler";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

type EmbraceErrorBoundaryFallbackProps = {
  error: Error;
  componentStack: string;
  resetError: () => void;
};

type EmbraceErrorBoundaryProps = PropsWithChildren<{
  fallback?: ComponentType<EmbraceErrorBoundaryFallbackProps>;
  onError?: (error: Error, componentStack: string) => void;
}>;

type EmbraceErrorBoundaryState = {
  error: Error | null;
  componentStack: string;
};

const INITIAL_STATE: EmbraceErrorBoundaryState = {
  error: null,
  componentStack: "",
};

class EmbraceErrorBoundary extends React.Component<
  EmbraceErrorBoundaryProps,
  EmbraceErrorBoundaryState
> {
  state = INITIAL_STATE;

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentStack = errorInfo.componentStack ?? "";

    safePromise(
      EmbraceManagerModule.logMessageWithSeverityAndProperties(
        error.message,
        "error",
        {},
        componentStack,
        true,
      ),
      "EmbraceErrorBoundary",
      false,
    );

    this.props.onError?.(error, componentStack);
    this.setState({error, componentStack});
  }

  resetError = () => {
    this.setState(INITIAL_STATE);
  };

  render() {
    const {error, componentStack} = this.state;
    const {fallback, children} = this.props;

    if (error === null) {
      return children;
    }

    return fallback
      ? React.createElement(fallback, {
          error,
          componentStack,
          resetError: this.resetError,
        })
      : null;
  }
}

export {
  EmbraceErrorBoundary,
  type EmbraceErrorBoundaryProps,
  type EmbraceErrorBoundaryFallbackProps,
};
