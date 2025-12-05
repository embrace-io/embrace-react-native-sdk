import { SessionStatus } from "../interfaces";
import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addSessionProperty = (
  key: string,
  value: string,
  permanent: boolean,
): Promise<boolean> => {
  return EmbraceManagerModule.addSessionProperty(key, value, permanent);
};

const addSessionPropertyAsync = (
  key: string,
  value: string,
  permanent: boolean,
): void => {
  void EmbraceManagerModule.addSessionProperty(key, value, permanent).catch((error: unknown) => {
    handleSDKPromiseRejection("addSessionProperty", error);
  });
};

const removeSessionProperty = (key: string) => {
  return EmbraceManagerModule.removeSessionProperty(key);
};

const removeSessionPropertyAsync = (key: string): void => {
  void EmbraceManagerModule.removeSessionProperty(key).catch((error: unknown) => {
    handleSDKPromiseRejection("removeSessionProperty", error);
  });
};

const endSession = () => {
  return EmbraceManagerModule.endSession();
};

const endSessionAsync = (): void => {
  void EmbraceManagerModule.endSession().catch((error: unknown) => {
    handleSDKPromiseRejection("endSession", error);
  });
};

const getCurrentSessionId = (): Promise<string> => {
  return EmbraceManagerModule.getCurrentSessionId();
};


const getLastRunEndState = (): Promise<SessionStatus> => {
  return EmbraceManagerModule.getLastRunEndState();
};

const getDeviceId = (): Promise<string> => {
  return EmbraceManagerModule.getDeviceId();
};

export {
  addSessionProperty,
  addSessionPropertyAsync,
  removeSessionProperty,
  removeSessionPropertyAsync,
  endSession,
  endSessionAsync,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
};