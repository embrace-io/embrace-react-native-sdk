import {EmbraceManagerModule} from "../EmbraceManagerModule";

const addUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.addUserPersona(persona);
};

const clearUserPersona = (persona: string): Promise<boolean> => {
  return EmbraceManagerModule.clearUserPersona(persona);
};

const clearAllUserPersonas = (): Promise<boolean> => {
  return EmbraceManagerModule.clearAllUserPersonas();
};

const setUserIdentifier = (userIdentifier: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserIdentifier(userIdentifier);
};

const clearUserIdentifier = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserIdentifier();
};

const setUsername = (username: string): Promise<boolean> => {
  return EmbraceManagerModule.setUsername(username);
};

const clearUsername = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUsername();
};

const setUserEmail = (userEmail: string): Promise<boolean> => {
  return EmbraceManagerModule.setUserEmail(userEmail);
};

const clearUserEmail = (): Promise<boolean> => {
  return EmbraceManagerModule.clearUserEmail();
};

export {
  addUserPersona,
  clearUserPersona,
  clearAllUserPersonas,
  setUserIdentifier,
  clearUserIdentifier,
  setUsername,
  clearUsername,
  setUserEmail,
  clearUserEmail,
};
