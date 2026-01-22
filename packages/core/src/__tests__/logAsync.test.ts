jest.mock('../EmbraceManagerModule', () => ({
  EmbraceManagerModule: {
    logMessageWithSeverityAndProperties: jest.fn(),
    logHandledError: jest.fn(),
  },
}));

jest.mock('../utils/promiseHandler', () => ({
  handleSDKPromiseRejection: jest.fn(),
}));

jest.mock('../utils/log', () => ({
  generateStackTrace: jest.fn(() => 'mock stack trace'),
}));

import {
  logInfo,
  logInfoFireAndForget,
  logWarning,
  logWarningFireAndForget,
  logError,
  logErrorFireAndForget,
  logHandledError,
  logHandledErrorFireAndForget,
  logMessage,
  logMessageFireAndForget,
} from '../api/log';
import { EmbraceManagerModule } from '../EmbraceManagerModule';
import { handleSDKPromiseRejection } from '../utils/promiseHandler';
import { generateStackTrace } from '../utils/log';

describe('Log API', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('logInfo - Promise Version', () => {
    it('should call native module with correct params', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logInfo('info message');

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'info message',
        'info',
        {},
        '', // No stack trace for info
        false,
      );
    });

    it('should not include stack trace for info logs', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logInfo('test');

      const callArgs =
        (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mock
          .calls[0];
      expect(callArgs[3]).toBe(''); // stackTrace parameter
      expect(callArgs[4]).toBe(false); // includeStacktrace parameter
    });
  });

  describe('logInfoFireAndForget - Void Version', () => {
    it('should return void', () => {
      const result = logInfoFireAndForget('test');
      expect(result).toBeUndefined();
    });

    it('should not include stack trace', () => {
      logInfoFireAndForget('test');

      // generateStackTrace should not be called for info logs
      expect(generateStackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logWarning - Promise Version', () => {
    it('should include stack trace by default', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logWarning('warning message');

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'warning message',
        'warning',
        {},
        'mock stack trace',
        true,
      );
    });

    it('should allow disabling stack trace', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logWarning('warning message', false);

      const callArgs =
        (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mock
          .calls[0];
      expect(callArgs[3]).toBe(''); // No stack trace
      expect(callArgs[4]).toBe(false);
    });
  });

  describe('logWarningFireAndForget - Void Version', () => {
    it('should return void', () => {
      const result = logWarningFireAndForget('test');
      expect(result).toBeUndefined();
    });

    it('should include stack trace by default', () => {
      logWarningFireAndForget('test');
      expect(generateStackTrace).toHaveBeenCalled();
    });

    it('should respect includeStacktrace parameter', () => {
      (generateStackTrace as jest.Mock).mockClear();

      logWarningFireAndForget('test', false);

      expect(generateStackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logError - Promise Version', () => {
    it('should include stack trace by default', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logError('error message');

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'error message',
        'error',
        {},
        'mock stack trace',
        true,
      );
    });

    it('should allow disabling stack trace', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logError('error message', false);

      const callArgs =
        (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mock
          .calls[0];
      expect(callArgs[3]).toBe('');
      expect(callArgs[4]).toBe(false);
    });
  });

  describe('logErrorFireAndForget - Void Version', () => {
    it('should return void', () => {
      const result = logErrorFireAndForget('test');
      expect(result).toBeUndefined();
    });

    it('should handle rejections internally', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockRejectedValue(
        error,
      );

      logErrorFireAndForget('test');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith('logMessage', error);
    });
  });

  describe('logMessage - Promise Version', () => {
    it('should accept custom severity', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logMessage('test', 'warning', {}, true);

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'test',
        'warning',
        {},
        'mock stack trace',
        true,
      );
    });

    it('should accept properties', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      const props = { key: 'value', count: '123' };
      await logMessage('test', 'error', props);

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'test',
        'error',
        props,
        'mock stack trace',
        true,
      );
    });

    it('should warn when properties is null', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logMessage('test', 'error', null as any);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('properties'),
      );
    });

    it('should use default severity if not provided', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logMessage('test');

      const callArgs =
        (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mock
          .calls[0];
      expect(callArgs[1]).toBe('error'); // default severity
    });
  });

  describe('logMessageFireAndForget - Void Version', () => {
    it('should return void', () => {
      const result = logMessageFireAndForget('test');
      expect(result).toBeUndefined();
    });

    it('should call native module with same params as promise version', () => {
      const props = { key: 'value' };
      logMessageFireAndForget('test message', 'warning', props, true);

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        'test message',
        'warning',
        props,
        'mock stack trace',
        true,
      );
    });

    it('should generate stack trace correctly', () => {
      (generateStackTrace as jest.Mock).mockClear();

      logMessageFireAndForget('test', 'error', {}, true);

      expect(generateStackTrace).toHaveBeenCalled();
    });

    it('should not generate stack trace for info', () => {
      (generateStackTrace as jest.Mock).mockClear();

      logMessageFireAndForget('test', 'info', {}, true);

      expect(generateStackTrace).not.toHaveBeenCalled();
    });
  });

  describe('logHandledError - Promise Version', () => {
    it('should handle Error objects', async () => {
      (EmbraceManagerModule.logHandledError as jest.Mock).mockResolvedValue(true);

      const error = new Error('test error');
      error.stack = 'stack trace';

      await logHandledError(error);

      expect(EmbraceManagerModule.logHandledError).toHaveBeenCalledWith(
        'test error',
        'stack trace',
        {},
      );
    });

    it('should return false for non-Error', async () => {
      const result = await logHandledError('not an error' as any);

      expect(result).toBe(false);
      expect(EmbraceManagerModule.logHandledError).not.toHaveBeenCalled();
    });

    it('should accept properties', async () => {
      (EmbraceManagerModule.logHandledError as jest.Mock).mockResolvedValue(true);

      const error = new Error('test');
      error.stack = 'stack';
      const props = { userId: '123', action: 'checkout' };

      await logHandledError(error, props);

      expect(EmbraceManagerModule.logHandledError).toHaveBeenCalledWith(
        'test',
        'stack',
        props,
      );
    });

    it('should handle error without stack', async () => {
      (EmbraceManagerModule.logHandledError as jest.Mock).mockResolvedValue(true);

      const error = new Error('test');
      delete error.stack;

      await logHandledError(error);

      expect(EmbraceManagerModule.logHandledError).toHaveBeenCalledWith(
        'test',
        undefined,
        {},
      );
    });
  });

  describe('logHandledErrorFireAndForget - Void Version', () => {
    it('should return void', () => {
      const error = new Error('test');
      const result = logHandledErrorFireAndForget(error);

      expect(result).toBeUndefined();
    });

    it('should handle rejections internally', async () => {
      const error = new Error('test');
      const nativeError = new Error('native error');
      (EmbraceManagerModule.logHandledError as jest.Mock).mockRejectedValue(nativeError);

      logHandledErrorFireAndForget(error);

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith(
        'logHandledError',
        nativeError,
      );
    });

    it('should work with properties', () => {
      (EmbraceManagerModule.logHandledError as jest.Mock).mockResolvedValue(true);

      const error = new Error('test');
      error.stack = 'stack';
      const props = { key: 'value' };

      logHandledErrorFireAndForget(error, props);

      expect(EmbraceManagerModule.logHandledError).toHaveBeenCalledWith(
        'test',
        'stack',
        props,
      );
    });
  });

  describe('Fire and Forget Usage', () => {
    it('should allow rapid-fire logging without await', () => {
      logInfoFireAndForget('event 1');
      logWarningFireAndForget('event 2');
      logErrorFireAndForget('event 3');

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledTimes(
        3,
      );
    });

    it('should handle high-frequency logging', () => {
      for (let i = 0; i < 50; i++) {
        logInfoFireAndForget(`event ${i}`);
      }

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledTimes(
        50,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      await logInfo('');
      logInfoFireAndForget('');

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should handle very long messages', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      const longMessage = 'a'.repeat(10000);
      await logError(longMessage);
      logErrorFireAndForget(longMessage);

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        longMessage,
        expect.any(String),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should handle unicode and special characters', async () => {
      (EmbraceManagerModule.logMessageWithSeverityAndProperties as jest.Mock).mockResolvedValue(
        true,
      );

      const specialMessage = '你好 🌍 \n\t\r special';
      await logWarning(specialMessage);
      logWarningFireAndForget(specialMessage);

      expect(EmbraceManagerModule.logMessageWithSeverityAndProperties).toHaveBeenCalledWith(
        specialMessage,
        expect.any(String),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
