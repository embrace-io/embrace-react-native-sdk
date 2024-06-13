import {renderHook} from '@testing-library/react-native';
import {ForwardedRef} from 'react';

import useNativeNavigationTracker, {
  NativeNavRef,
} from '../useNativeNavigationTracker';

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

const mockSpanSetAttribute = jest.fn();
const mockSpanEnd = jest.fn();
const mockStartSpan = jest.fn(() => ({
  end: mockSpanEnd,
  setAttribute: mockSpanSetAttribute,
  spanContext: jest.fn(),
  setAttributes: jest.fn(),
  addEvent: jest.fn(),
  setStatus: jest.fn(),
  updateName: jest.fn(),
  isRecording: jest.fn(),
  recordException: jest.fn(),
  addLink: jest.fn(),
  addLinks: jest.fn(),
}));
const mockStartActiveSpan = jest.fn();

const mockTracerRef = {
  current: {
    startSpan: mockStartSpan,
    startActiveSpan: mockStartActiveSpan,
  },
};

describe('useNativeNavigationTracker.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work as expected when the application implements react-native-navigation', () => {
    renderHook(() =>
      useNativeNavigationTracker(mockNativeNavigationRef, mockTracerRef),
    );

    expect(mockRegisterComponentDidAppearListener).toHaveBeenCalledWith(
      expect.any(Function),
    );

    const mockDidAppearListenerCall =
      mockRegisterComponentDidAppearListener.mock.calls[0][0];

    mockDidAppearListenerCall({componentName: 'initial-test-view'});
    expect(mockSpanEnd).not.toHaveBeenCalled();
    expect(mockStartSpan).toHaveBeenNthCalledWith(1, 'initial-test-view');

    expect(mockRegisterComponentDidDisappearListener).toHaveBeenCalledWith(
      expect.any(Function),
    );

    const mockDidDisappearListenerCall =
      mockRegisterComponentDidDisappearListener.mock.calls[0][0];

    mockDidDisappearListenerCall({componentName: 'second-test-view'});
    expect(mockSpanEnd).toHaveBeenCalled();
    expect(mockStartSpan).toHaveBeenNthCalledWith(2, 'second-test-view');
  });
});
