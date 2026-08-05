import React from "react";
import "react-native-reanimated";
import {EmbraceExpoTestHarness} from "@embrace-io/react-native-test-harness/lib/EmbraceExpoTestHarness";
import sdkConfig from "./embrace-sdk-config.json";

export default function RootLayout() {
  return (
    <EmbraceExpoTestHarness sdkConfig={sdkConfig} allowCustomExport={false} />
  );
}
