import {EmbraceManagerModule} from "../EmbraceManagerModule";

const setJavaScriptPatch = (patch: string) => {
  return EmbraceManagerModule.setJavaScriptPatchNumber(patch);
};

const setJavaScriptBundlePath = (path: string) => {
  return EmbraceManagerModule.setJavaScriptBundlePath(path);
};

export {setJavaScriptBundlePath, setJavaScriptPatch};
