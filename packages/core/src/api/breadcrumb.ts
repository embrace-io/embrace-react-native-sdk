import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

const addBreadcrumb = (message: string): Promise<boolean> => {
  return EmbraceManagerModule.addBreadcrumb(message);
};

const addBreadcrumbAsync = (message: string): void => {
  void EmbraceManagerModule.addBreadcrumb(message).catch((error: unknown) => {
    handleSDKPromiseRejection("addBreadcrumb", error);
  });
};

export { addBreadcrumb, addBreadcrumbAsync };