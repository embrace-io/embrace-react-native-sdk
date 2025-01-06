import {Dimensions, ScaledSize} from "react-native";
import {useCallback, useEffect, useRef} from "react";

import {addBreadcrumb} from "..";

type ScreenOrientation = "portrait" | "landscape";
type Orientation = ScreenOrientation | undefined;

type OrientationHandler = ({
  window,
  screen,
}: {
  window: ScaledSize;
  screen: ScaledSize;
}) => void;

/**
 * Helper
 */
const getOrientation = (screen: ScaledSize): Orientation => {
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
  orientation: Orientation,
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

const useOrientationListener = () => {
  const initRef = useRef(false);
  const orientationRef = useRef<Orientation>();

  const handleOrientationChange: OrientationHandler = useCallback(
    ({screen}) => {
      const newOrientation = getOrientation(screen);

      if (!newOrientation) {
        console.warn(
          "[Embrace] We could not determine the screen measurements. Orientation log skipped.",
        );

        return;
      }

      if (orientationRef.current !== newOrientation) {
        logOrientationChange(orientationRef.current, newOrientation);
        orientationRef.current = newOrientation;
      }
    },
    [],
  );

  /**
   * Initialize the listener
   */
  useEffect(() => {
    if (!initRef.current) {
      const init = () => {
        orientationRef.current = getOrientation(Dimensions.get("screen"));

        if (orientationRef.current) {
          logOrientationChange(orientationRef.current);
        }

        Dimensions.addEventListener("change", handleOrientationChange);
      };

      init();

      // initialized just once
      initRef.current = true;
    }
  }, [handleOrientationChange]);
};

export {useOrientationListener};
