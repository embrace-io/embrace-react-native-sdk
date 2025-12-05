jest.mock('../EmbraceManagerModule', () => ({
  EmbraceManagerModule: {
    setUserIdentifier: jest.fn(),
    clearUserIdentifier: jest.fn(),
    setUsername: jest.fn(),
    clearUsername: jest.fn(),
    setUserEmail: jest.fn(),
    clearUserEmail: jest.fn(),
    addUserPersona: jest.fn(),
    clearUserPersona: jest.fn(),
    clearAllUserPersonas: jest.fn(),
  },
}));

jest.mock('../utils/promiseHandler', () => ({
  handleSDKPromiseRejection: jest.fn(),
}));

import {
  setUserIdentifier,
  setUserIdentifierAsync,
  clearUserIdentifier,
  clearUserIdentifierAsync,
  setUsername,
  setUsernameAsync,
  clearUsername,
  clearUsernameAsync,
  setUserEmail,
  setUserEmailAsync,
  clearUserEmail,
  clearUserEmailAsync,
  addUserPersona,
  addUserPersonaAsync,
  clearUserPersona,
  clearUserPersonaAsync,
  clearAllUserPersonas,
  clearAllUserPersonasAsync,
} from '../api/user';
import {EmbraceManagerModule} from '../EmbraceManagerModule';
import {handleSDKPromiseRejection} from '../utils/promiseHandler';

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (EmbraceManagerModule.setUserIdentifier as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserIdentifier as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.setUsername as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUsername as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.setUserEmail as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserEmail as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.addUserPersona as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearUserPersona as jest.Mock).mockResolvedValue(true);
    (EmbraceManagerModule.clearAllUserPersonas as jest.Mock).mockResolvedValue(true);
  });

  describe('User Identifier', () => {
    it('should set user identifier with promise', async () => {
      const result = await setUserIdentifier('user123');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('user123');
    });

    it('should set user identifier without waiting', () => {
      const result = setUserIdentifierAsync('user456');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('user456');
    });

    it('should clear user identifier with promise', async () => {
      const result = await clearUserIdentifier();

      expect(result).toBe(true);
      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
    });

    it('should clear user identifier without waiting', () => {
      const result = clearUserIdentifierAsync();

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
    });

    it('async versions should handle rejections', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.setUserIdentifier as jest.Mock).mockRejectedValue(error);

      setUserIdentifierAsync('user123');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith(
        'setUserIdentifier',
        error,
      );
    });
  });

  describe('Username', () => {
    it('should set username with promise', async () => {
      const result = await setUsername('john_doe');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('john_doe');
    });

    it('should set username without waiting', () => {
      const result = setUsernameAsync('jane_doe');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('jane_doe');
    });

    it('should clear username with promise', async () => {
      const result = await clearUsername();

      expect(result).toBe(true);
      expect(EmbraceManagerModule.clearUsername).toHaveBeenCalled();
    });

    it('should clear username without waiting', () => {
      const result = clearUsernameAsync();

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.clearUsername).toHaveBeenCalled();
    });
  });

  describe('User Email', () => {
    it('should set user email with promise', async () => {
      const result = await setUserEmail('user@example.com');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
    });

    it('should set user email without waiting', () => {
      const result = setUserEmailAsync('test@example.com');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should clear user email with promise', async () => {
      const result = await clearUserEmail();

      expect(result).toBe(true);
      expect(EmbraceManagerModule.clearUserEmail).toHaveBeenCalled();
    });

    it('should clear user email without waiting', () => {
      const result = clearUserEmailAsync();

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.clearUserEmail).toHaveBeenCalled();
    });
  });

  describe('User Personas', () => {
    it('should add user persona with promise', async () => {
      const result = await addUserPersona('premium');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('premium');
    });

    it('should add user persona without waiting', () => {
      const result = addUserPersonaAsync('vip');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('vip');
    });

    it('should clear specific user persona with promise', async () => {
      const result = await clearUserPersona('premium');

      expect(result).toBe(true);
      expect(EmbraceManagerModule.clearUserPersona).toHaveBeenCalledWith('premium');
    });

    it('should clear specific user persona without waiting', () => {
      const result = clearUserPersonaAsync('vip');

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.clearUserPersona).toHaveBeenCalledWith('vip');
    });

    it('should clear all user personas with promise', async () => {
      const result = await clearAllUserPersonas();

      expect(result).toBe(true);
      expect(EmbraceManagerModule.clearAllUserPersonas).toHaveBeenCalled();
    });

    it('should clear all user personas without waiting', () => {
      const result = clearAllUserPersonasAsync();

      expect(result).toBeUndefined();
      expect(EmbraceManagerModule.clearAllUserPersonas).toHaveBeenCalled();
    });

    it('should handle multiple personas', () => {
      addUserPersonaAsync('premium');
      addUserPersonaAsync('early_adopter');
      addUserPersonaAsync('beta_tester');

      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledTimes(3);
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenNthCalledWith(1, 'premium');
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenNthCalledWith(
        2,
        'early_adopter',
      );
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenNthCalledWith(
        3,
        'beta_tester',
      );
    });
  });

  describe('Real-World User Flows', () => {
    it('should handle user login flow', async () => {
      // Critical: Set user ID (need to verify success)
      const success = await setUserIdentifier('user_12345');
      expect(success).toBe(true);

      // Fire-and-forget: Set additional user info
      setUsernameAsync('john_doe');
      setUserEmailAsync('john@example.com');
      addUserPersonaAsync('premium');
      addUserPersonaAsync('verified');

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('user_12345');
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('john_doe');
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith('john@example.com');
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledTimes(2);
    });

    it('should handle user logout flow', () => {
      // Fire-and-forget: Clear all user data
      clearUserIdentifierAsync();
      clearUsernameAsync();
      clearUserEmailAsync();
      clearAllUserPersonasAsync();

      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUsername).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUserEmail).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearAllUserPersonas).toHaveBeenCalled();
    });

    it('should handle user profile update', async () => {
      // Update username (need verification)
      const usernameSet = await setUsername('new_username');
      expect(usernameSet).toBe(true);

      // Update email (fire-and-forget)
      setUserEmailAsync('newemail@example.com');

      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('new_username');
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith(
        'newemail@example.com',
      );
    });

    it('should handle subscription upgrade', () => {
      // User upgrades subscription
      clearUserPersonaAsync('free');
      addUserPersonaAsync('premium');
      addUserPersonaAsync('annual_subscriber');

      expect(EmbraceManagerModule.clearUserPersona).toHaveBeenCalledWith('free');
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('premium');
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith(
        'annual_subscriber',
      );
    });

    it('should handle user data deletion', () => {
      // GDPR: User requests data deletion
      clearUserIdentifierAsync();
      clearUsernameAsync();
      clearUserEmailAsync();
      clearAllUserPersonasAsync();

      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUsername).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearUserEmail).toHaveBeenCalled();
      expect(EmbraceManagerModule.clearAllUserPersonas).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle setUserIdentifier rejection', async () => {
      const error = new Error('Network error');
      (EmbraceManagerModule.setUserIdentifier as jest.Mock).mockRejectedValue(error);

      setUserIdentifierAsync('user123');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith(
        'setUserIdentifier',
        error,
      );
    });

    it('should handle clearUserEmail rejection', async () => {
      const error = new Error('Native error');
      (EmbraceManagerModule.clearUserEmail as jest.Mock).mockRejectedValue(error);

      clearUserEmailAsync();

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith('clearUserEmail', error);
    });

    it('should handle addUserPersona rejection', async () => {
      const error = new Error('Invalid persona');
      (EmbraceManagerModule.addUserPersona as jest.Mock).mockRejectedValue(error);

      addUserPersonaAsync('invalid');

      await new Promise(resolve => setImmediate(resolve));

      expect(handleSDKPromiseRejection).toHaveBeenCalledWith('addUserPersona', error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      setUserIdentifierAsync('');
      setUsernameAsync('');
      setUserEmailAsync('');
      addUserPersonaAsync('');

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('');
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('');
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith('');
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('');
    });

    it('should handle special characters', () => {
      setUserIdentifierAsync('user@123.com');
      setUsernameAsync('user_name-123');
      setUserEmailAsync('test+tag@example.com');
      addUserPersonaAsync('premium-plus');

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith(
        'user@123.com',
      );
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('user_name-123');
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith(
        'test+tag@example.com',
      );
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('premium-plus');
    });

    it('should handle unicode characters', () => {
      setUsernameAsync('用户名');
      setUserEmailAsync('пользователь@example.com');
      addUserPersonaAsync('プレミアム');

      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith('用户名');
      expect(EmbraceManagerModule.setUserEmail).toHaveBeenCalledWith(
        'пользователь@example.com',
      );
      expect(EmbraceManagerModule.addUserPersona).toHaveBeenCalledWith('プレミアム');
    });

    it('should handle rapid updates', () => {
      for (let i = 0; i < 50; i++) {
        setUserIdentifierAsync(`user_${i}`);
      }

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledTimes(50);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);

      setUserIdentifierAsync(longString);
      setUsernameAsync(longString);
      setUserEmailAsync(`${longString}@example.com`);

      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith(longString);
      expect(EmbraceManagerModule.setUsername).toHaveBeenCalledWith(longString);
    });
  });

  describe('API Consistency', () => {
    it('should have consistent parameter signatures', () => {
      // Single parameter functions
      setUserIdentifier('test');
      setUserIdentifierAsync('test');

      setUsername('test');
      setUsernameAsync('test');

      setUserEmail('test');
      setUserEmailAsync('test');

      addUserPersona('test');
      addUserPersonaAsync('test');

      clearUserPersona('test');
      clearUserPersonaAsync('test');

      // No parameter functions
      clearUserIdentifier();
      clearUserIdentifierAsync();

      clearUsername();
      clearUsernameAsync();

      clearUserEmail();
      clearUserEmailAsync();

      clearAllUserPersonas();
      clearAllUserPersonasAsync();

      // All should be called correctly
      expect(EmbraceManagerModule.setUserIdentifier).toHaveBeenCalledWith('test');
      expect(EmbraceManagerModule.clearUserIdentifier).toHaveBeenCalled();
    });

    it('should have consistent return types', () => {
      // Promise versions return Promise
      const p1 = setUserIdentifier('test');
      const p2 = setUsername('test');
      const p3 = addUserPersona('test');

      expect(p1).toBeInstanceOf(Promise);
      expect(p2).toBeInstanceOf(Promise);
      expect(p3).toBeInstanceOf(Promise);

      // Async versions return void
      const a1 = setUserIdentifierAsync('test');
      const a2 = setUsernameAsync('test');
      const a3 = addUserPersonaAsync('test');

      expect(a1).toBeUndefined();
      expect(a2).toBeUndefined();
      expect(a3).toBeUndefined();
    });
  });
});
