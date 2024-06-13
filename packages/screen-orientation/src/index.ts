import {Dimensions, NativeModules} from "react-native";
import {useEffect, useRef} from "react";

const BREADCRUMB_PREFIX = "Screen Orientation changed from:";
const BREADCRUMB_PREFIX_DEFAULT = "The App started in ${orientation} mode";

const SCREEN_ORIENTATION_MAP = {
  portrait: "portrait",
  landscape: "landscape",
};

export const useEmbraceOrientationLogger = () => {
  const lastOrientation = useRef<string>();

  const getOrientation = () => {
    const {width, height} = Dimensions.get("screen");

    if (width < height) {
      return SCREEN_ORIENTATION_MAP.portrait;
    }
    if (width > height) {
      return SCREEN_ORIENTATION_MAP.landscape;
    }
    return undefined;
  };

  const logFirstOrientation = () => {
    if (lastOrientation.current) {
      NativeModules.EmbraceManager.logBreadcrumb(
        `${BREADCRUMB_PREFIX_DEFAULT.replace(
          "${orientation}",
          lastOrientation.current,
        )}`,
      );
    }
  };

  const logOrientationChange = (
    prevOrientation: string | undefined,
    newOrientation: string,
  ) => {
    NativeModules.EmbraceManager.logBreadcrumb(
      `${BREADCRUMB_PREFIX} ${prevOrientation} -> ${newOrientation}`,
    );
  };

  const onOrientationChange = () => {
    const newOrientation = getOrientation();
    if (!newOrientation) {
      console.warn(
        "[Embrace] We could not determine the screen measurements. Orientation log skipped.",
      );
      return;
    }
    if (lastOrientation.current !== newOrientation) {
      logOrientationChange(lastOrientation.current, newOrientation);
      lastOrientation.current = newOrientation;
    }
  };

  const init = () => {
    if (!NativeModules.EmbraceManager) {
      console.warn(
        "[Embrace] You must have the Embrace SDK to Web View events, run `yarn add @embrace-io/react-native`.",
      );
    } else {
      lastOrientation.current = getOrientation();
      if (lastOrientation.current) {
        logFirstOrientation();
      }
      Dimensions.addEventListener("change", onOrientationChange);
    }
  };

  useEffect(() => {
    init();
  }, []);
};
