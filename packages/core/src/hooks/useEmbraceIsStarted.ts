import {useEffect, useState} from "react";

import {EmbraceManagerModule} from "../EmbraceManagerModule";

const useEmbraceIsStarted = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    EmbraceManagerModule.isStarted()
      .then((isEmbraceStarted: boolean) => {
        setIsStarted(isEmbraceStarted);
      })
      .catch(() => {})
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  return {
    isChecking,
    isStarted,
  };
};

export {useEmbraceIsStarted};
