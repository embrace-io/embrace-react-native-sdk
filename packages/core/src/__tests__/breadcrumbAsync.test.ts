jest.mock('../EmbraceManagerModule', () => ({
  EmbraceManagerModule: {
    addBreadcrumb: jest.fn(),
  },
}));

jest.mock('../utils/promiseHandler', () => ({
  handleSDKPromiseRejection: jest.fn(),
}));

import { addBreadcrumb, addBreadcrumbFireAndForget } from '../api/breadcrumb';
import { EmbraceManagerModule } from '../EmbraceManagerModule';
import { handleSDKPromiseRejection } from '../utils/promiseHandler';

describe('Breadcrumb API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBreadcrumb (Promise Version)', () => {
    it('should return promise that resolves to true on success', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const result = await addBreadcrumb('test message');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith('test message');
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(1);
    });

    it('should return promise that resolves to false on failure', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(false);

      const result = await addBreadcrumb('test message');

      expect(result).toBe(false);
    });

    it('should reject on native module error', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockRejectedValue(error);

      await expect(addBreadcrumb('test')).rejects.toThrow('Native error');
    });

    it('should handle different message types', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      await addBreadcrumb('Simple message');
      await addBreadcrumb('Message with special chars: !@#$%');
      await addBreadcrumb('Message with emoji 🎉');
      await addBreadcrumb('');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(4);
    });

    it('should be awaitable', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const promise = addBreadcrumb('test');
      expect(promise).toBeInstanceOf(Promise);

      const result = await promise;
      expect(result).toBe(true);
    });
  });

  describe('addBreadcrumbFireAndForget (Void Version)', () => {
    it('should return void immediately', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const result = addBreadcrumbFireAndForget('test message');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith('test message');
    });

    it('should handle rejection internally', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockRejectedValue(error);

      addBreadcrumbFireAndForget('test message');

      // Wait for promise to settle
      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith('addBreadcrumb', error);
    });

    it('should not throw even if promise rejects', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockRejectedValue(
        new Error('error'),
      );

      expect(() => {
        addBreadcrumbFireAndForget('test');
      }).not.toThrow();
    });

    it('should work in fire-and-forget style', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      // Should not need await or .catch()
      addBreadcrumbFireAndForget('event1');
      addBreadcrumbFireAndForget('event2');
      addBreadcrumbFireAndForget('event3');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(3);
    });

    it('should work in high-frequency scenarios', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      for (let i = 0; i < 100; i++) {
        addBreadcrumbFireAndForget(`event_${i}`);
      }

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(100);
    });

    it('should handle success without calling error handler', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      addBreadcrumbFireAndForget('test');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).not.toHaveBeenCalled();
    });

    it('should handle different message types', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      addBreadcrumbFireAndForget('Simple message');
      addBreadcrumbFireAndForget('Message with special chars: !@#$%');
      addBreadcrumbFireAndForget('Message with emoji 🎉');
      addBreadcrumbFireAndForget('');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(4);
    });

    it('should not be awaitable', () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const result = addBreadcrumbFireAndForget('test');

      expect(result).toBeUndefined();
      expect(typeof result).toBe('undefined');
    });
  });

  describe('Comparison: Promise vs FireAndForget', () => {
    it('should call same native method for both versions', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      await addBreadcrumb('test1');
      addBreadcrumbFireAndForget('test2');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenNthCalledWith(1, 'test1');
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenNthCalledWith(2, 'test2');
    });

    it('should have different return types', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const promiseResult = addBreadcrumb('test1');
      const asyncResult = addBreadcrumbFireAndForget('test2');

      expect(promiseResult).toBeInstanceOf(Promise);
      expect(asyncResult).toBeUndefined();

      const resolvedValue = await promiseResult;
      expect(resolvedValue).toBe(true);
    });

    it('should handle errors differently', async () => {
      const error = new Error('Test error');
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockRejectedValue(error);

      // Promise version throws
      await expect(addBreadcrumb('test1')).rejects.toThrow('Test error');

      // FireAndForget version handles internally
      expect(() => {
        addBreadcrumbFireAndForget('test2');
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const longMessage = 'a'.repeat(10000);
      await addBreadcrumb(longMessage);
      addBreadcrumbFireAndForget(longMessage);

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledTimes(2);
      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith(longMessage);
    });

    it('should handle empty strings', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      await addBreadcrumb('');
      addBreadcrumbFireAndForget('');

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith('');
    });

    it('should handle unicode characters', async () => {
      (EmbraceManagerModule.addBreadcrumb as jest.Mock).mockResolvedValue(true);

      const unicodeMessage = '你好世界 🌍 مرحبا العالم';
      await addBreadcrumb(unicodeMessage);
      addBreadcrumbFireAndForget(unicodeMessage);

      expect(EmbraceManagerModule.addBreadcrumb).toHaveBeenCalledWith(unicodeMessage);
    });
  });
});
