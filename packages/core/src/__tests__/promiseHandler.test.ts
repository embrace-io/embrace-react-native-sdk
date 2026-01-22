import {
  configurePromiseRejection,
  getPromiseRejectionConfig,
  handleSDKPromiseRejection,
} from '../utils/promiseHandler';

describe('promiseHandler', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Reset to defaults
    configurePromiseRejection({
      enabled: true,
      logToConsole: false,
      customHandler: undefined,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Configuration', () => {
    it('should have correct default config', () => {
      const config = getPromiseRejectionConfig();
      expect(config.enabled).toBe(true);
      expect(config.logToConsole).toBe(false);
      expect(config.customHandler).toBeUndefined();
    });

    it('should allow partial configuration updates', () => {
      configurePromiseRejection({enabled: false});

      const config = getPromiseRejectionConfig();
      expect(config.enabled).toBe(false);
      expect(config.logToConsole).toBe(false); // Should remain unchanged
    });

    it('should merge configuration correctly', () => {
      configurePromiseRejection({
        enabled: false,
        logToConsole: true,
      });

      const config = getPromiseRejectionConfig();
      expect(config.enabled).toBe(false);
      expect(config.logToConsole).toBe(true);
    });

    it('should return immutable config copy', () => {
      const config1 = getPromiseRejectionConfig();
      const config2 = getPromiseRejectionConfig();

      expect(config1).not.toBe(config2); // Different objects
      expect(config1).toEqual(config2); // Same values
    });

    it('should allow multiple reconfigurations', () => {
      configurePromiseRejection({enabled: false});
      expect(getPromiseRejectionConfig().enabled).toBe(false);

      configurePromiseRejection({enabled: true});
      expect(getPromiseRejectionConfig().enabled).toBe(true);

      configurePromiseRejection({logToConsole: true});
      expect(getPromiseRejectionConfig().logToConsole).toBe(true);
      expect(getPromiseRejectionConfig().enabled).toBe(true); // Previous setting preserved
    });
  });

  describe('Error Handling - Enabled State', () => {
    it('should not log when disabled', () => {
      configurePromiseRejection({enabled: false, logToConsole: true});

      handleSDKPromiseRejection('testMethod', new Error('test error'));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle when enabled but logToConsole is false', () => {
      configurePromiseRejection({enabled: true, logToConsole: false});

      handleSDKPromiseRejection('testMethod', new Error('test error'));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log to console when both enabled and logToConsole are true', () => {
      configurePromiseRejection({enabled: true, logToConsole: true});

      handleSDKPromiseRejection('testMethod', new Error('test error'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Embrace RN SDK]'),
        expect.any(Error),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('testMethod'),
        expect.any(Error),
      );
    });

    it('should include error message in log', () => {
      configurePromiseRejection({enabled: true, logToConsole: true});

      handleSDKPromiseRejection('testMethod', new Error('specific error message'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('specific error message'),
        expect.any(Error),
      );
    });
  });

  describe('Error Normalization', () => {
    it('should handle Error objects', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      const testError = new Error('test error');
      handleSDKPromiseRejection('testMethod', testError);

      expect(customHandler).toHaveBeenCalledWith('testMethod', testError);
    });

    it('should convert strings to Error objects', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('testMethod', 'string error');

      expect(customHandler).toHaveBeenCalledWith(
        'testMethod',
        expect.objectContaining({
          message: 'string error',
        }),
      );
      expect(customHandler.mock.calls[0][1]).toBeInstanceOf(Error);
    });

    it('should handle non-Error objects', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      const errorObj = {code: 123, msg: 'error'};
      handleSDKPromiseRejection('testMethod', errorObj);

      expect(customHandler).toHaveBeenCalledWith('testMethod', expect.any(Error));
      expect(customHandler.mock.calls[0][1].message).toBe('[object Object]');
    });

    it('should handle null', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('testMethod', null);

      expect(customHandler).toHaveBeenCalledWith('testMethod', expect.any(Error));
    });

    it('should handle undefined', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('testMethod', undefined);

      expect(customHandler).toHaveBeenCalledWith('testMethod', expect.any(Error));
    });

    it('should handle numbers', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('testMethod', 404);

      expect(customHandler).toHaveBeenCalledWith('testMethod', expect.any(Error));
      expect(customHandler.mock.calls[0][1].message).toBe('404');
    });
  });

  describe('Custom Handler', () => {
    it('should call custom handler when provided', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      const testError = new Error('test error');
      handleSDKPromiseRejection('testMethod', testError);

      expect(customHandler).toHaveBeenCalledWith('testMethod', testError);
      expect(customHandler).toHaveBeenCalledTimes(1);
    });

    it('should not crash if custom handler throws', () => {
      const customHandler = jest.fn(() => {
        throw new Error('handler error');
      });
      configurePromiseRejection({
        enabled: true,
        customHandler,
        logToConsole: true,
      });

      expect(() => {
        handleSDKPromiseRejection('testMethod', new Error('test'));
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in custom'),
        expect.any(Error),
      );
    });

    it('should call both custom handler and console log', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({
        enabled: true,
        customHandler,
        logToConsole: true,
      });

      handleSDKPromiseRejection('testMethod', new Error('test'));

      expect(customHandler).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should pass correct method name to handler', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('addBreadcrumb', new Error('test'));
      handleSDKPromiseRejection('logInfo', new Error('test'));

      expect(customHandler).toHaveBeenNthCalledWith(
        1,
        'addBreadcrumb',
        expect.any(Error),
      );
      expect(customHandler).toHaveBeenNthCalledWith(2, 'logInfo', expect.any(Error));
    });

    it('should continue if custom handler is removed', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler, logToConsole: true});

      handleSDKPromiseRejection('testMethod', new Error('test'));
      expect(customHandler).toHaveBeenCalledTimes(1);

      // Remove handler
      configurePromiseRejection({customHandler: undefined});

      handleSDKPromiseRejection('testMethod2', new Error('test2'));
      expect(customHandler).toHaveBeenCalledTimes(1); // Should not be called again
      expect(consoleErrorSpy).toHaveBeenCalled(); // But console should still work
    });
  });

  describe('Stack Trace Logging', () => {
    it('should log stack trace when available', () => {
      configurePromiseRejection({enabled: true, logToConsole: true});

      const errorWithStack = new Error('test error');
      errorWithStack.stack = 'Error: test\n  at line1\n  at line2';

      handleSDKPromiseRejection('testMethod', errorWithStack);

      const calls = consoleErrorSpy.mock.calls.flat();
      const hasStackTrace = calls.some(
        call => typeof call === 'string' && call.includes('Stack trace:'),
      );
      expect(hasStackTrace).toBe(true);
    });

    it('should handle errors without stack trace', () => {
      configurePromiseRejection({enabled: true, logToConsole: true});

      const errorWithoutStack = new Error('test error');
      delete errorWithoutStack.stack;

      expect(() => {
        handleSDKPromiseRejection('testMethod', errorWithoutStack);
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include stack trace in custom handler even if logging disabled', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler, logToConsole: false});

      const errorWithStack = new Error('test error');
      errorWithStack.stack = 'Error: test\n  at line1';

      handleSDKPromiseRejection('testMethod', errorWithStack);

      expect(customHandler).toHaveBeenCalledWith('testMethod', errorWithStack);
      expect(customHandler.mock.calls[0][1].stack).toBe('Error: test\n  at line1');
    });
  });

  describe('Multiple Error Handling', () => {
    it('should handle multiple errors in sequence', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('method1', new Error('error1'));
      handleSDKPromiseRejection('method2', new Error('error2'));
      handleSDKPromiseRejection('method3', new Error('error3'));

      expect(customHandler).toHaveBeenCalledTimes(3);
      expect(customHandler).toHaveBeenNthCalledWith(
        1,
        'method1',
        expect.objectContaining({message: 'error1'}),
      );
      expect(customHandler).toHaveBeenNthCalledWith(
        2,
        'method2',
        expect.objectContaining({message: 'error2'}),
      );
      expect(customHandler).toHaveBeenNthCalledWith(
        3,
        'method3',
        expect.objectContaining({message: 'error3'}),
      );
    });

    it('should not accumulate errors', () => {
      const customHandler = jest.fn();
      configurePromiseRejection({enabled: true, customHandler});

      handleSDKPromiseRejection('method1', new Error('error1'));
      expect(customHandler).toHaveBeenCalledTimes(1);

      customHandler.mockClear();

      handleSDKPromiseRejection('method2', new Error('error2'));
      expect(customHandler).toHaveBeenCalledTimes(1); // Only new call
    });
  });
});
