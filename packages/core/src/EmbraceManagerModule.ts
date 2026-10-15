import {getNativeModule} from "./utils/nativeModule";
import type {Spec} from "./NativeEmbraceManager";

export const EmbraceManagerModule = getNativeModule<Spec>("EmbraceManager");
