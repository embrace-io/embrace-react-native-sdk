import {EmbraceManagerModule} from "../EmbraceManagerModule";

const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

export {addBreadcrumb};
