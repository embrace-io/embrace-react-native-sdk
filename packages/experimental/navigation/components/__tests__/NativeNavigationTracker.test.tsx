import {Text} from 'react-native';
import {ForwardedRef} from 'react';
import {render} from '@testing-library/react-native';

import useNativeNavigationTracker, {
  NativeNavRef,
} from '../../hooks/useNativeNavigationTracker';
import NativeNavigationTracker from '../NativeNavigationTracker';


const mockGetTracer = jest.fn();
const mockStartSpan = jest.fn();

const mockProvider = {
  getTracer: mockGetTracer,
  startSpan: mockStartSpan,
};

jest.mock('../../hooks/useNativeNavigationTracker', () => jest.fn());

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

describe('NativeNavigationTracker.tsx', () => {
  it('should render component and call the hook', () => {
    const screen = render(
      <NativeNavigationTracker
        ref={mockNativeNavigationRef}
        provider={mockProvider}>
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
          name: 'navigation',
          version: '1.0.0',
          options: undefined,
        }),
      }),
    );

    expect(screen.getByText('my app goes here')).toBeDefined();
  });
});
