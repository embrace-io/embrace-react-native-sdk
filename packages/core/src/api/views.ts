import {EmbraceManagerModule} from "../EmbraceManagerModule";

const startView = (view: string): Promise<string | boolean> => {
  return EmbraceManagerModule.startView(view);
};

const endView = (spanId: string): Promise<boolean> => {
  return EmbraceManagerModule.endView(spanId);
};

export {startView, endView};
