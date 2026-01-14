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

const addSessionPropertyFireAndForget = (
  key: string,
  value: string,
  permanent: boolean,
): void => {
  handleSDKPromiseRejection(addSessionProperty(key, value, permanent), "addSessionProperty");
};

const removeSessionProperty = (key: string) => {
  return EmbraceManagerModule.removeSessionProperty(key);
};

const removeSessionPropertyFireAndForget = (key: string): void => {
  handleSDKPromiseRejection(removeSessionProperty(key), "removeSessionProperty");
};

const endSession = () => {
  return EmbraceManagerModule.endSession();
};

const endSessionFireAndForget = (): void => {
  handleSDKPromiseRejection(endSession(), "endSession");
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
  addSessionPropertyFireAndForget,
  removeSessionProperty,
  removeSessionPropertyFireAndForget,
  endSession,
  endSessionFireAndForget,
  getCurrentSessionId,
  getLastRunEndState,
  getDeviceId,
};