jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Test React Native Error Handler', () => {
  test('ErrorBoundary', () => {
    const mockLogHandledError = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: { logHandledError: mockLogHandledError },
      },
    }));
  });
});
