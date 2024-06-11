import {Text} from 'react-native';
import {ForwardedRef} from 'react';
import {render} from '@testing-library/react-native';

import useNavigationTracker, {NavRef} from '../../hooks/useNavigationTracker';
import NavigationTracker from '../NavigationTracker';


jest.mock('../../hooks/useNavigationTracker', () => jest.fn());

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
} as unknown as ForwardedRef<NavRef>;

describe('NavigationTracker.tsx', () => {
  it('should render component and call the hook', () => {
    const screen = render(
      <NavigationTracker ref={mockNavigationRef} provider={mockProvider}>
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
          name: 'navigation',
          version: '1.0.0',
          options: undefined,
        }),
      }),
    );

    expect(screen.getByText('my app goes here')).toBeDefined();
  });
});
