import React from "react";
import "react-native-reanimated";
import {EmbraceTestHarness} from "@embrace-io/react-native-test-harness";
import sdkConfig from "./embrace-sdk-config.json";

export default function RootLayout() {
  return (
    <EmbraceTestHarness
      navigationStyle="expo"
      sdkConfig={sdkConfig}
      allowCustomExport={false}
    />
  );
}
