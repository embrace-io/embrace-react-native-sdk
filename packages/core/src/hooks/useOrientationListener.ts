import {Dimensions, ScaledSize} from "react-native";
import {useEffect, useRef} from "react";

import EmbraceLogger from "../utils/EmbraceLogger";
import {addBreadcrumb} from "..";

type ScreenOrientation = "portrait" | "landscape";

/**
 * Helper
 */
const getOrientation = (screen: ScaledSize): ScreenOrientation | undefined => {
  const {width, height} = screen;

  if (width < height) {
    return "portrait";
  }

  if (width > height) {
    return "landscape";
  }

  return undefined;
};

/**
 * Helper
 */
const logOrientationChange = (
  orientation: ScreenOrientation,
  newOrientation?: ScreenOrientation,
) => {
  if (newOrientation) {
    addBreadcrumb(
      `Screen Orientation changed from: ${orientation} -> ${newOrientation}`,
    );

    return;
  }

  addBreadcrumb(`The App started in ${orientation} mode`);
};

const logger = new EmbraceLogger(console);

/**
 * useOrientationListener
 *
 * @param enabled
 * boolean flag that indicates whether the listener should run or not
 * depending on the initialization of the `@embrace-io/react-native` (that is an async operation).
 * Default `true`
 */
const useOrientationListener = (enabled: boolean = true) => {
  const orientationRef = useRef<ScreenOrientation | undefined>();

  /**
   * Initialize the listener
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    orientationRef.current = getOrientation(Dimensions.get("screen"));

    if (orientationRef.current) {
      logOrientationChange(orientationRef.current);
    }

    Dimensions.addEventListener("change", ({screen}) => {
      const newOrientation = getOrientation(screen);

      if (!newOrientation) {
        logger.warn(
          "we could not determine the screen measurements. Orientation log skipped.",
        );

        return;
      }

      if (orientationRef.current && orientationRef.current !== newOrientation) {
        logOrientationChange(orientationRef.current, newOrientation);
        orientationRef.current = newOrientation;
      }
    });
  }, [enabled]);
};

export {useOrientationListener};
