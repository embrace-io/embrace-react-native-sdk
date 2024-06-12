import React from "react";
import ActionList from "../components/ActionList";
import { IAction } from "../components/ActionButton";

const JSCrashes = () => {
  const actions: IAction[] = [
    {
      id: "throw-js-crash",
      name: "JS Crash",
      onPress: () => {
        throw new Error("This is a JS crash");
      },
      backgroundColor: "red",
    },
  ];
  return <ActionList actions={actions} />;
};

export default JSCrashes;
