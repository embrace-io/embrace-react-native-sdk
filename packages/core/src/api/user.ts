import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

const addUserPersonaAsync = (persona: string): void => {
  handleSDKPromiseRejection(addUserPersona(persona), "addUserPersona");
};

const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

const clearUserPersonaAsync = (persona: string): void => {
  handleSDKPromiseRejection(clearUserPersona(persona), "clearUserPersona");
};

const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

const clearAllUserPersonasAsync = (): void => {
  handleSDKPromiseRejection(clearAllUserPersonas(), "clearAllUserPersonas");
};

const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

const setUserIdentifierAsync = (userIdentifier: string): void => {
  handleSDKPromiseRejection(setUserIdentifier(userIdentifier), "setUserIdentifier");
};

const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

const clearUserIdentifierAsync = (): void => {
  handleSDKPromiseRejection(clearUserIdentifier(), "clearUserIdentifier");
};

const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

const setUsernameAsync = (username: string): void => {
  handleSDKPromiseRejection(setUsername(username), "setUsername");
};

const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

const clearUsernameAsync = (): void => {
  handleSDKPromiseRejection(clearUsername(), "clearUsername");
};
const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

const setUserEmailAsync = (userEmail: string): void => {
  handleSDKPromiseRejection(setUserEmail(userEmail), "setUserEmail");
};

const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

const clearUserEmailAsync = (): void => {
  handleSDKPromiseRejection(clearUserEmail(), "clearUserEmail");
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
