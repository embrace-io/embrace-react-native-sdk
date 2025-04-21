import {
  NativeNavigationTracker,
  NavigationTracker,
  NativeNavigationTrackerRef,
  NavigationTrackerRef,
} from "./instrumentation";
import {EmbraceNavigationWrapper} from "./EmbraceNavigationWrapper";

const EmbraceNavigationTracker =
  EmbraceNavigationWrapper<NavigationTrackerRef>(NavigationTracker);

const EmbraceNativeNavigationTracker =
  EmbraceNavigationWrapper<NativeNavigationTrackerRef>(NativeNavigationTracker);

export {EmbraceNavigationTracker, EmbraceNativeNavigationTracker};
