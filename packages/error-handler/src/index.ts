import React, { Component, createElement, ErrorInfo } from 'react';
import { NativeModules } from 'react-native';

interface IError {
  error: Error | undefined;
  componentStack: string | undefined;
}

export interface IFallbackComponent extends IError {
  resetErrorState: () => void;
}

interface IErrorBoundaryProps {
  FallbackComponent: React.FunctionComponent<IFallbackComponent>;
  children?: React.ReactNode | (() => React.ReactNode);
  unmountChildrenOnError: boolean;
  onErrorHandler?: ((error: Error, componentStack: string) => void) | undefined;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
  componentStack: string | undefined;
  hasLoggedError: boolean;
}

const initialState: IErrorBoundaryState = {
  hasError: false,
  error: undefined,
  componentStack: undefined,
  hasLoggedError: false,
};

class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = initialState;
  }

  public resetErrorBoundary() {
    const { error } = this.state;

    if (error) {
      this.setState(initialState);
    }
  }

  public async componentDidCatch(error: Error, { componentStack }: ErrorInfo) {
    const { message } = error;
    const stackLimit = 200;
    const truncated = componentStack
      .split('\n')
      .slice(0, stackLimit)
      .join('\n');

    console.log(error, componentStack);
    if (NativeModules.EmbraceManager.logHandledError) {
      await NativeModules.EmbraceManager.logHandledError(
        message,
        truncated,
        {}
      );
    }

    if (this.props.onErrorHandler) {
      this.props.onErrorHandler(error, componentStack);
    }

    this.setState({ hasError: true, error, componentStack });
  }

  public renderFallback() {
    const { FallbackComponent } = this.props;
    if (!FallbackComponent) { return null; }
    return createElement(FallbackComponent, {
      error: this.state.error,
      componentStack: this.state.componentStack,
      resetErrorState: this.resetErrorBoundary.bind(this),
    });
  }

  public render() {
    if (this.props.unmountChildrenOnError && this.state.hasError) { return null; }

    const hasFallbackComponent = !!this.props.FallbackComponent;
    if (this.state.hasError) {
      if (hasFallbackComponent) { return this.renderFallback(); }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
