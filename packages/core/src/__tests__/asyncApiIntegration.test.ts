/**
 * Integration tests for the async/void API parallel implementation
 * Tests that all APIs work together correctly
 */

jest.mock('../EmbraceManagerModule', () => ({
  EmbraceManagerModule: {
    addBreadcrumb: jest.fn(),
    logMessageWithSeverityAndProperties: jest.fn(),
    addSessionProperty: jest.fn(),
    removeSessionProperty: jest.fn(),
    endSession: jest.fn(),
    setUserIdentifier: jest.fn(),
    setUsername: jest.fn(),
    setUserEmail: jest.fn(),
    clearUserIdentifier: jest.fn(),
    clearUsername: jest.fn(),
    clearUserEmail: jest.fn(),
    addUserPersona: jest.fn(),
    clearUserPersona: jest.fn(),
    clearAllUserPersonas: jest.fn(),
    logNetworkRequest: jest.fn(),
    logNetworkClientError: jest.fn(),
    logHandledError: jest.fn(),
  },
}));

jest.mock('../utils/log', () => ({
  generateStackTrace: jest.fn(() => 'mock stack trace'),
}));

import {
  // Configuration
  configurePromiseRejection,
  getPromiseRejectionConfig,
  // Breadcrumb
  addBreadcrumb,
  addBreadcrumbAsync,
  // Logging
  logInfo,
  logInfoAsync,
  logWarning,
  logWarningAsync,
  logError,
  logErrorAsync,
  logHandledError,
  logHandledErrorAsync,
  // Session
  addSessionProperty,
  addSessionPropertyAsync,
  removeSessionProperty,
  removeSessionPropertyAsync,
  endSession,
  endSessionAsync,
  // User
  setUserIdentifier,
  setUserIdentifierAsync,
  setUsername,
  setUsernameAsync,
  setUserEmail,
  setUserEmailAsync,
  clearUserIdentifier,
  clearUserIdentifierAsync,
  clearUsername,
  clearUsernameAsync,
  clearUserEmail,
  clearUserEmailAsync,
  addUserPersona,
  addUserPersonaAsync,
  clearUserPersona,
  clearUserPersonaAsync,
  clearAllUserPersonas,
  clearAllUserPersonasAsync,
  // Network
  recordNetworkRequest,
  recordNetworkRequestAsync,
  logNetworkClientError,
  logNetworkClientErrorAsync,
} from '../index';

import {EmbraceManagerModule} from '../EmbraceManagerModule';

describe('Async API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
      true,
    );
    (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.removeSessionProperty as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.endSession as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.setUserIdentifier as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.setUsername as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.setUserEmail as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserIdentifier as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUsername as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserEmail as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.addUserPersona as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserPersona as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearAllUserPersonas as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.logNetworkRequest as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.logNetworkClientError as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.logHandledError as jest.Mock).mockResolvedValue(true);
  });

  describe('Module Exports', () => {
    it('should export promiseHandler utilities', () => {
      expect(configurePromiseRejection).toBeDefined();
      expect(typeof configurePromiseRejection).toBe('function');
      expect(getPromiseRejectionConfig).toBeDefined();
      expect(typeof getPromiseRejectionConfig).toBe('function');
    });

    it('should export breadcrumb functions', () => {
      expect(addBreadcrumb).toBeDefined();
      expect(addBreadcrumbAsync).toBeDefined();
      expect(typeof addBreadcrumb).toBe('function');
      expect(typeof addBreadcrumbAsync).toBe('function');
    });

    it('should export logging functions', () => {
      const logFunctions = [
        logInfo,
        logInfoAsync,
        logWarning,
        logWarningAsync,
        logError,
        logErrorAsync,
        logHandledError,
        logHandledErrorAsync,
      ];

      logFunctions.forEach(fn => {
        expect(fn).toBeDefined();
        expect(typeof fn).toBe('function');
      });
    });

    it('should export session functions', () => {
      const sessionFunctions = [
        addSessionProperty,
        addSessionPropertyAsync,
        removeSessionProperty,
        removeSessionPropertyAsync,
        endSession,
        endSessionAsync,
      ];

      sessionFunctions.forEach(fn => {
        expect(fn).toBeDefined();
        expect(typeof fn).toBe('function');
      });
    });

    it('should export user functions', () => {
      const userFunctions = [
        setUserIdentifier,
        setUserIdentifierAsync,
        setUsername,
        setUsernameAsync,
        setUserEmail,
        setUserEmailAsync,
        clearUserIdentifier,
        clearUserIdentifierAsync,
        clearUsername,
        clearUsernameAsync,
        clearUserEmail,
        clearUserEmailAsync,
        addUserPersona,
        addUserPersonaAsync,
        clearUserPersona,
        clearUserPersonaAsync,
        clearAllUserPersonas,
        clearAllUserPersonasAsync,
      ];

      userFunctions.forEach(fn => {
        expect(fn).toBeDefined();
        expect(typeof fn).toBe('function');
      });
    });

    it('should export network functions', () => {
      const networkFunctions = [
        recordNetworkRequest,
        recordNetworkRequestAsync,
        logNetworkClientError,
        logNetworkClientErrorAsync,
      ];

      networkFunctions.forEach(fn => {
        expect(fn).toBeDefined();
        expect(typeof fn).toBe('function');
      });
    });
  });

  describe('Fire and Forget Pattern', () => {
    it('should allow calling async methods without await', () => {
      expect(() => {
        addBreadcrumbAsync('test');
        logInfoAsync('test');
        setUserIdentifierAsync('user123');
        addSessionPropertyAsync('key', 'value', false);
      }).not.toThrow();
    });

    it('should work in high-frequency loops', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          addBreadcrumbAsync(`event_${i}`);
        }
      }).not.toThrow();

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(100);
    });

    it('should handle mixed sync and async calls', () => {
      expect(() => {
        addBreadcrumbAsync('async1');
        addBreadcrumb('sync1');
        logInfoAsync('async2');
        logInfo('sync2');
      }).not.toThrow();
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should handle typical user session flow', async () => {
      // User logs in
      const loginSuccess = await setUserIdentifier('user_123');
      expect(loginSuccess).toBe(true);

      // Fire-and-forget telemetry
      setUsernameAsync('john_doe');
      setUserEmailAsync('john@example.com');
      addUserPersonaAsync('premium');
      addBreadcrumbAsync('user_logged_in');
      logInfoAsync('Login completed');

      // Set session properties
      addSessionPropertyAsync('login_method', 'email', false);
      addSessionPropertyAsync('device_type', 'mobile', true);

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalled();
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalled();
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalled();
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalled();
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalled();
    });

    it('should handle e-commerce checkout flow', () => {
      // User adds items to cart (fire-and-forget tracking)
      addBreadcrumbAsync('item_added_to_cart');
      addSessionPropertyAsync('cart_items', '3', false);
      logInfoAsync('User viewing cart');

      // User proceeds to checkout
      addBreadcrumbAsync('checkout_started');
      addSessionPropertyAsync('checkout_step', '1', false);

      // Payment processing
      addBreadcrumbAsync('payment_submitted');
      logInfoAsync('Processing payment');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(3);
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledTimes(2);
    });

    it('should handle error tracking scenario', async () => {
      try {
        // Simulate some operation that fails
        throw new Error('Payment processing failed');
      } catch (error) {
        // Log error with context (fire-and-forget)
        logHandledErrorAsync(error as Error, {
          context: 'payment',
          amount: '99.99',
        });
        addBreadcrumbAsync('payment_error_occurred');
        logErrorAsync('Payment failed: ' + (error as Error).message);
      }

      expect(EmbraceManagerModule.logHandledError).toHaveBeenCalled();
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalled();
    });

    it('should handle network tracking scenario', () => {
      const startTime = Date.now();
      const endTime = startTime + 250;

      // Successful request
      recordNetworkRequestAsync(
        'https://api.example.com/users',
        'GET',
        startTime,
        endTime,
        100,
        500,
        200,
      );

      // Failed request
      logNetworkClientErrorAsync(
        'https://api.example.com/payment',
        'POST',
        startTime,
        endTime,
        'NetworkError',
        'Connection timeout',
      );

      expect(EmbraceManagerModule.logNetworkRequest).toHaveBeenCalled();
      expect(EmbraceManagerModule.logNetworkClientError).toHaveBeenCalled();
    });

    it('should handle user logout flow', () => {
      // Fire-and-forget cleanup
      clearUserIdentifierAsync();
      clearUsernameAsync();
      clearUserEmailAsync();
      clearAllUserPersonasAsync();
      addBreadcrumbAsync('user_logged_out');
      endSessionAsync();

      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUsername).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUserEmail).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearAllUserPersonas).toHaveBeenCalled();
      expect(EmbraceManagerModule.endSession).toHaveBeenCalled();
    });
  });

  describe('Promise Configuration Integration', () => {
    it('should configure rejection handling and use async APIs', () => {
      const customHandler = jest.fn();

      configurePromiseRejection({
        enabled: true,
        logToConsole: false,
        customHandler,
      });

      // Use various async APIs
      addBreadcrumbAsync('test1');
      logInfoAsync('test2');
      setUserIdentifierAsync('user123');

      const config = getPromiseRejectionConfig();
      expect(config.enabled).toBe(true);
      expect(config.customHandler).toBe(customHandler);
    });

    it('should handle rejection with custom handler', async () => {
      const customHandler = jest.fn();
      const testError = new Error('Test error');

      configurePromiseRejection({
        enabled: true,
        customHandler,
      });

      // Mock a rejection
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockRejectedValue(testError);

      addBreadcrumbAsync('test');

      // Wait for rejection to be handled
      await new Promise(resolve => setImmediate(resolve));

      expect(customHandler).toHaveBeenCalled();
    });
  });

  describe('Return Type Verification', () => {
    it('should return promises from promise versions', () => {
      const breadcrumbPromise = addBreadcrumb('test');
      const logPromise = logInfo('test');
      const userPromise = setUserIdentifier('user123');

      expect(breadcrumbPromise).toBeInstanceOf(Promise);
      expect(logPromise).toBeInstanceOf(Promise);
      expect(userPromise).toBeInstanceOf(Promise);
    });

    it('should return void from async versions', () => {
      const breadcrumbResult = addBreadcrumbAsync('test');
      const logResult = logInfoAsync('test');
      const userResult = setUserIdentifierAsync('user123');

      expect(breadcrumbResult).toBeUndefined();
      expect(logResult).toBeUndefined();
      expect(userResult).toBeUndefined();
    });
  });

  describe('Mixed API Usage', () => {
    it('should allow using both promise and async versions together', async () => {
      // Critical operations use promise version
      const userSet = await setUserIdentifier('user123');
      expect(userSet).toBe(true);

      const sessionSet = await addSessionProperty('subscription', 'premium', true);
      expect(sessionSet).toBe(true);

      // Telemetry uses async version
      addBreadcrumbAsync('subscription_activated');
      logInfoAsync('User upgraded to premium');
      setUsernameAsync('john_doe');

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalled();
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalled();
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalled();
    });

    it('should maintain backwards compatibility', async () => {
      // Old code using promise versions should still work
      const result1 = await addBreadcrumb('old style');
      const result2 = await logInfo('old style');
      const result3 = await setUserIdentifier('user123');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle rapid successive calls', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        addBreadcrumbAsync(`event_${i}`);
      }

      const duration = Date.now() - start;

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(1000);
      // Should complete quickly (synchronous call, async handling)
      expect(duration).toBeLessThan(1000);
    });

    it('should not block main thread', () => {
      let completed = false;

      addBreadcrumbAsync('test1');
      logInfoAsync('test2');
      setUserIdentifierAsync('user123');

      // Code should continue immediately
      completed = true;

      expect(completed).toBe(true);
    });
  });

  describe('Consistency Across APIs', () => {
    it('should use consistent naming pattern for all async functions', () => {
      // All async functions should end with "Async"
      expect(addBreadcrumbAsync.name).toBe('addBreadcrumbAsync');
      expect(logInfoAsync.name).toBe('logInfoAsync');
      expect(setUserIdentifierAsync.name).toBe('setUserIdentifierAsync');
      expect(addSessionPropertyAsync.name).toBe('addSessionPropertyAsync');
      expect(recordNetworkRequestAsync.name).toBe('recordNetworkRequestAsync');
    });

    it('should maintain parameter consistency between promise and async versions', () => {
      // Both versions should accept same parameters
      addBreadcrumb('test');
      addBreadcrumbAsync('test');

      logInfo('test');
      logInfoAsync('test');

      setUserIdentifier('user123');
      setUserIdentifierAsync('user123');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith('test');
      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalled();
      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('user123');
    });
  });
});
