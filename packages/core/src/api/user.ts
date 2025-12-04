import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

const addUserPersonaAsync = (persona: string): void => {
  void EmbraceManagerModule.addUserPersona(persona).catch((error: unknown) => {
    handleSDKPromiseRejection("addUserPersona", error);
  });
};

const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

const clearUserPersonaAsync = (persona: string): void => {
  void EmbraceManagerModule.clearUserPersona(persona).catch((error: unknown) => {
    handleSDKPromiseRejection("clearUserPersona", error);
  });
};

const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

const clearAllUserPersonasAsync = (): void => {
  void EmbraceManagerModule.clearAllUserPersonas().catch((error: unknown) => {
    handleSDKPromiseRejection("clearAllUserPersonas", error);
  });
};

const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

const setUserIdentifierAsync = (userIdentifier: string): void => {
  void EmbraceManagerModule.setUserIdentifier(userIdentifier).catch((error: unknown) => {
    handleSDKPromiseRejection("setUserIdentifier", error);
  });
};

const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

const clearUserIdentifierAsync = (): void => {
  void EmbraceManagerModule.clearUserIdentifier().catch((error: unknown) => {
    handleSDKPromiseRejection("clearUserIdentifier", error);
  });
};

const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

const setUsernameAsync = (username: string): void => {
  void EmbraceManagerModule.setUsername(username).catch((error: unknown) => {
    handleSDKPromiseRejection("setUsername", error);
  });
};

const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

const clearUsernameAsync = (): void => {
  void EmbraceManagerModule.clearUsername().catch((error: unknown) => {
    handleSDKPromiseRejection("clearUsername", error);
  });
};

const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

const setUserEmailAsync = (userEmail: string): void => {
  void EmbraceManagerModule.setUserEmail(userEmail).catch((error: unknown) => {
    handleSDKPromiseRejection("setUserEmail", error);
  });
};

const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

const clearUserEmailAsync = (): void => {
  void EmbraceManagerModule.clearUserEmail().catch((error: unknown) => {
    handleSDKPromiseRejection("clearUserEmail", error);
  });
};

export {
  addUserPersona,
  addUserPersonaAsync,
  clearUserPersona,
  clearUserPersonaAsync,
  clearAllUserPersonas,
  clearAllUserPersonasAsync,
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
};
