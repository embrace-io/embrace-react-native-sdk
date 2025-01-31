import {useEffect, useState} from "react";

import {EmbraceManagerModule} from "../EmbraceManagerModule";

const useEmbraceIsStarted = () => {
  // `null` signifies we haven't yet queried the SDK to determine if it is started or not
  const [isStarted, setIsStarted] = useState<boolean | null>(null);

  useEffect(() => {
    EmbraceManagerModule.isStarted()
      .then((isEmbraceStarted: boolean) => {
        setIsStarted(isEmbraceStarted);
      })
      .catch(() => {
        setIsStarted(false);
      });
  }, []);

  return isStarted;
};

export {useEmbraceIsStarted};
