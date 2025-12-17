import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

const addUserPersonaFireAndForget = (persona: string): void => {
  handleSDKPromiseRejection(addUserPersona(persona), "addUserPersona");
};

const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

const clearUserPersonaFireAndForget = (persona: string): void => {
  handleSDKPromiseRejection(clearUserPersona(persona), "clearUserPersona");
};

const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

const clearAllUserPersonasFireAndForget = (): void => {
  handleSDKPromiseRejection(clearAllUserPersonas(), "clearAllUserPersonas");
};

const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

const setUserIdentifierFireAndForget = (userIdentifier: string): void => {
  handleSDKPromiseRejection(setUserIdentifier(userIdentifier), "setUserIdentifier");
};

const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

const clearUserIdentifierFireAndForget = (): void => {
  handleSDKPromiseRejection(clearUserIdentifier(), "clearUserIdentifier");
};

const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

const setUsernameFireAndForget = (username: string): void => {
  handleSDKPromiseRejection(setUsername(username), "setUsername");
};

const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

const clearUsernameFireAndForget = (): void => {
  handleSDKPromiseRejection(clearUsername(), "clearUsername");
};
const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

const setUserEmailFireAndForget = (userEmail: string): void => {
  handleSDKPromiseRejection(setUserEmail(userEmail), "setUserEmail");
};

const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

const clearUserEmailFireAndForget = (): void => {
  handleSDKPromiseRejection(clearUserEmail(), "clearUserEmail");
};

export {
  addUserPersona,
  addUserPersonaFireAndForget,
  clearUserPersona,
  clearUserPersonaFireAndForget,
  clearAllUserPersonas,
  clearAllUserPersonasFireAndForget,
  setUserIdentifier,
  setUserIdentifierFireAndForget,
  clearUserIdentifier,
  clearUserIdentifierFireAndForget,
  setUsername,
  setUsernameFireAndForget,
  clearUsername,
  clearUsernameFireAndForget,
  setUserEmail,
  setUserEmailFireAndForget,
  clearUserEmail,
  clearUserEmailFireAndForget,
};
