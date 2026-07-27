import {driver} from "@wdio/globals";
import {Platform} from "../typings/embrace";

// The platform of the device under test, for selecting the normalization path.
export const currentPlatform = (): Platform => (driver.isAndroid ? "android" : "ios");
