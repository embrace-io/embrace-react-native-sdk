"use strict";
import {NativeModules, Platform} from "react-native";

import {createTruePromise} from "./utils";

interface CustomExporterConfig {
  endpoint: string;
  header: {key: string; token: string};
}

const WARN_MESSAGES = {
  config: "[Embrace] Invalid configuration for Custom Exporter",
  endpoint: "[Embrace] Invalid endpoint for Custom Exporter",
  header: "[Embrace] Invalid header for Custom Exporter",
  error: "[Embrace] Failed to configure Custom Exporter",
};

const configureCustomExporter = async (config: CustomExporterConfig) => {
  if (!config || typeof config !== "object") {
    console.warn(WARN_MESSAGES.config);
    return;
  }

  const {endpoint, header} = config;

  if (!endpoint || typeof endpoint !== "string") {
    console.warn(WARN_MESSAGES.endpoint);
    return;
  }

  if (!header || typeof header !== "object" || !header.key || !header.token) {
    console.warn(WARN_MESSAGES.header);
    return;
  }

  try {
    const {key, token} = header;

    // Configure Custom Exporter
    await NativeModules.RNEmbraceOTLP.setCustomExporter(endpoint, key, token);

    console.log(
      `NativeModules.RNEmbraceOTLP.setCustomExporter working in basic-test-app for ${Platform.OS}`,
    );
  } catch (error) {
    console.warn(WARN_MESSAGES.error, error);
  }

  return createTruePromise();
};

export {configureCustomExporter};
