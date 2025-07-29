import React from "react";
import {EmbraceTestHarness} from "@embrace-io/react-native-test-harness";
import sdkConfig from "./embrace-sdk-config.json";

const App = () => {
  return (
    <EmbraceTestHarness
      navigationStyle="react-native"
      sdkConfig={sdkConfig}
      allowCustomExport={false}
    />
  );
};

export default App;
