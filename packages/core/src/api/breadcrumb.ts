import {EmbraceManagerModule} from "../EmbraceManagerModule";

const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

const logScreen = (screenName: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(`Opening screen [${screenName}]`);
};

export {addBreadcrumb, logScreen};
