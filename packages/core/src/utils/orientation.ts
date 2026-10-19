import {Dimensions, ScaledSize} from "react-native";

import {addBreadcrumb} from "../api/breadcrumb";

type ScreenOrientation = "portrait" | "landscape";

const getOrientation = ({width, height}: ScaledSize): ScreenOrientation =>
  width > height ? "landscape" : "portrait";

const enableOrientationTracking = () => {
  let current = getOrientation(Dimensions.get("screen"));
  addBreadcrumb(`The App started in ${current} mode`);

  Dimensions.addEventListener("change", ({screen}) => {
    const next = getOrientation(screen);

    if (next === current) {
      return;
    }

    addBreadcrumb(`Screen Orientation changed from: ${current} -> ${next}`);
    current = next;
  });
};

export {enableOrientationTracking};
