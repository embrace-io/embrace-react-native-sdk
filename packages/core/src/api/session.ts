import {SessionStatus} from "../interfaces";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

const addSessionProperty = (
  key: string,
  value: string,
  permanent: boolean,
): Promise<boolean> => {
  return EmbraceManagerModule.addSessionProperty(key, value, permanent);
};

const removeSessionProperty = (key: string) => {
  return EmbraceManagerModule.removeSessionProperty(key);
};

const endSession = () => {
  return EmbraceManagerModule.endSession();
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
  removeSessionProperty,
  endSession,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
};
