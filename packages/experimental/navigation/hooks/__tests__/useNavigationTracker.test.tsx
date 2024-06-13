import {renderHook} from '@testing-library/react-native';
import {ForwardedRef} from 'react';

import useNavigationTracker, {type NavRef} from '../useNavigationTracker';

const mockSpanSetAttribute = jest.fn();
const mockSpanEnd = jest.fn();

const mockAddListener = jest.fn();
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
const mockGetCurrentRoute = jest.fn();

const mockTracerRef = {
  current: {
    startSpan: mockStartSpan,
    startActiveSpan: mockStartActiveSpan,
  },
};

const mockNavigationRef = {
  current: {
    // keep mocking functions when needed
    addListener: mockAddListener,
    getCurrentRoute: mockGetCurrentRoute,
  },
} as unknown as ForwardedRef<NavRef>;

describe('useNavigationTracker.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work as expected when the application implements expo-router', () => {
    renderHook(() => useNavigationTracker(mockNavigationRef, mockTracerRef));
    expect(mockAddListener).toHaveBeenCalledWith('state', expect.any(Function));

    const mockStateListenerCall = mockAddListener.mock.calls[0][1];

    mockGetCurrentRoute.mockReturnValue({name: 'first-view-test'});
    mockStateListenerCall();
    expect(mockSpanEnd).not.toHaveBeenCalled();
    // starts the initial span
    expect(mockStartSpan).toHaveBeenCalledTimes(1);

    mockGetCurrentRoute.mockReturnValue({name: 'second-view-test'});
    mockStateListenerCall();
    // finish the initial span
    expect(mockSpanEnd).toHaveBeenCalledTimes(1);
    // starts the next/second one
    expect(mockStartSpan).toHaveBeenCalledTimes(2);
  });
});
