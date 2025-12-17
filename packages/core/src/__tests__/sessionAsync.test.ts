jest.mock('../EmbraceManagerModule', () => ({
  EmbraceManagerModule: {
    addSessionProperty: jest.fn(),
    removeSessionProperty: jest.fn(),
    endSession: jest.fn(),
    getCurrentSessionId: jest.fn(),
    getLastRunEndState: jest.fn(),
    getDeviceId: jest.fn(),
  },
}));

jest.mock('../utils/promiseHandler', () => ({
  handleSDKPromiseRejection: jest.fn(),
}));

import {
  addSessionProperty,
  addSessionPropertyFireAndForget,
  removeSessionProperty,
  removeSessionPropertyFireAndForget,
  endSession,
  endSessionFireAndForget,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
} from '../api/session';
import { EmbraceManagerModule } from '../EmbraceManagerModule';
import { handleSDKPromiseRejection } from '../utils/promiseHandler';

describe('Session API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSessionProperty', () => {
    it('should add session property with promise', async () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      const result = await addSessionProperty('key', 'value', false);

      expect(result).toBe(true);
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledWith(
        'key',
        'value',
        false,
      );
    });

    it('should add session property without waiting', () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      const result = addSessionPropertyFireAndForget('key', 'value', true);

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledWith(
        'key',
        'value',
        true,
      );
    });

    it('should handle permanent flag correctly', async () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      await addSessionProperty('temp', 'val', false);
      await addSessionProperty('perm', 'val', true);

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenNthCalledWith(
        1,
        'temp',
        'val',
        false,
      );
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenNthCalledWith(
        2,
        'perm',
        'val',
        true,
      );
    });

    it('async version should handle rejection', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockRejectedValue(error);

      addSessionPropertyFireAndForget('key', 'value', false);

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith(
        'addSessionProperty',
        error,
      );
    });
  });

  describe('removeSessionProperty', () => {
    it('should remove session property with promise', async () => {
      (EmbraceManagerModule.removeSessionProperty as jest.Mock).mockResolvedValue(true);

      await removeSessionProperty('key');

      expect(EmbraceManagerModule.removeSessionProperty).toHaveBeenCalledWith('key');
    });

    it('should remove session property without waiting', () => {
      (EmbraceManagerModule.removeSessionProperty as jest.Mock).mockResolvedValue(true);

      const result = removeSessionPropertyFireAndForget('key');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.removeSessionProperty).toHaveBeenCalledWith('key');
    });

    it('async version should handle rejection', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.removeSessionProperty as jest.Mock).mockRejectedValue(
        error,
      );

      removeSessionPropertyFireAndForget('key');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith(
        'removeSessionProperty',
        error,
      );
    });
  });

  describe('endSession', () => {
    it('should end session with promise', async () => {
      (EmbraceManagerModule.endSession as jest.Mock).mockResolvedValue(true);

      await endSession();

      expect(EmbraceManagerModule.endSession).toHaveBeenCalled();
    });

    it('should end session without waiting', () => {
      (EmbraceManagerModule.endSession as jest.Mock).mockResolvedValue(true);

      const result = endSessionFireAndForget();

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.endSession).toHaveBeenCalled();
    });

    it('async version should handle rejection', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.endSession as jest.Mock).mockRejectedValue(error);

      endSessionFireAndForget();

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith('endSession', error);
    });
  });

  describe('Getter Methods', () => {
    it('getCurrentSessionId should only have promise version', async () => {
      (EmbraceManagerModule.getCurrentSessionId as jest.Mock).mockResolvedValue(
        'session-123',
      );

      const sessionId = await getCurrentSessionId();

      expect(sessionId).toBe('session-123');
      expect(EmbraceManagerModule.getCurrentSessionId).toHaveBeenCalled();
    });

    it('getLastRunEndState should only have promise version', async () => {
      (EmbraceManagerModule.getLastRunEndState as jest.Mock).mockResolvedValue('CRASH');

      const endState = await getLastRunEndState();

      expect(endState).toBe('CRASH');
      expect(EmbraceManagerModule.getLastRunEndState).toHaveBeenCalled();
    });

    it('getDeviceId should only have promise version', async () => {
      (EmbraceManagerModule.getDeviceId as jest.Mock).mockResolvedValue('device-456');

      const deviceId = await getDeviceId();

      expect(deviceId).toBe('device-456');
      expect(EmbraceManagerModule.getDeviceId).toHaveBeenCalled();
    });
  });

  describe('Real-World Usage', () => {
    it('should handle session lifecycle', async () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);
      (EmbraceManagerModule.getCurrentSessionId as jest.Mock).mockResolvedValue(
        'session-1',
      );
      (EmbraceManagerModule.endSession as jest.Mock).mockResolvedValue(true);

      // Start session with properties (fire-and-forget)
      addSessionPropertyFireAndForget('app_version', '1.0.0', true);
      addSessionPropertyFireAndForget('user_type', 'premium', false);

      // Get session info (need result)
      const sessionId = await getCurrentSessionId();
      expect(sessionId).toBe('session-1');

      // End session (fire-and-forget)
      endSessionFireAndForget();

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledTimes(2);
      expect(EmbraceManagerModule.endSession).toHaveBeenCalled();
    });

    it('should handle session property updates during user actions', () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);
      (EmbraceManagerModule.removeSessionProperty as jest.Mock).mockResolvedValue(true);

      // User navigates through app
      addSessionPropertyFireAndForget('screen', 'home', false);
      addSessionPropertyFireAndForget('screen', 'products', false);
      addSessionPropertyFireAndForget('screen', 'checkout', false);

      // User adds items to cart
      addSessionPropertyFireAndForget('cart_items', '1', false);
      addSessionPropertyFireAndForget('cart_items', '2', false);
      addSessionPropertyFireAndForget('cart_items', '3', false);

      // User removes item
      removeSessionPropertyFireAndForget('promo_code');

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledTimes(6);
      expect(EmbraceManagerModule.removeSessionProperty).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', async () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      await addSessionProperty('key', '', false);
      addSessionPropertyFireAndForget('key2', '', true);

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledWith(
        'key',
        '',
        false,
      );
      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledWith(
        'key2',
        '',
        true,
      );
    });

    it('should handle special characters in keys and values', async () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      const specialKey = 'key-with_special.chars@123';
      const specialValue = 'value!@#$%^&*()';

      await addSessionProperty(specialKey, specialValue, false);
      addSessionPropertyFireAndForget(specialKey, specialValue, true);

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledWith(
        specialKey,
        specialValue,
        expect.any(Boolean),
      );
    });

    it('should handle rapid property updates', () => {
      (EmbraceManagerModule.addSessionProperty as jest.Mock).mockResolvedValue(true);

      for (let i = 0; i < 50; i++) {
        addSessionPropertyFireAndForget(`key_${i}`, `value_${i}`, false);
      }

      expect(EmbraceManagerModule.addSessionProperty).toHaveBeenCalledTimes(50);
    });
  });
});
