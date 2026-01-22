import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

const addBreadcrumbFireAndForget = (message: string): void => {
  handleSDKPromiseRejection(addBreadcrumb(message), "addBreadcrumb");
};

export { addBreadcrumb, addBreadcrumbFireAndForget };