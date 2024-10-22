"use strict";
import {NativeModules} from "react-native";

import {createFalsePromise} from "./utils";

interface CustomExporterConfig {
  endpoint: string;
  headers?: {key: string; token: string}[];
  timeout?: number;
}

interface OTLPExporterConfig {
  logExporter?: CustomExporterConfig;
  traceExporter?: CustomExporterConfig;
}

interface IOSConfig {
  appId: string;
  appGroupId?: string;
  disableCrashReporter?: boolean;
  disableAutomaticViewCapture?: boolean;
  endpointBaseUrl?: string;
}

// NOTE: as per today Android is not configurable through code, this is a placeholder for future implementations
interface AndroidConfig {}

const WARN_MESSAGES = {
  config: "[Embrace] Invalid configuration for Custom Exporter",
  endpoint: "[Embrace] Invalid endpoint for Custom Exporter",
  header: "[Embrace] Invalid header for Custom Exporter",
  error: "[Embrace] Failed to configure Custom Exporter",
};

const initialize = (otlpExporterConfig: OTLPExporterConfig) => {
  if (!otlpExporterConfig || typeof otlpExporterConfig !== "object") {
    console.warn(WARN_MESSAGES.config);
    return;
  }

  if (typeof otlpExporterConfig.logExporter === "object") {
    const {logExporter} = otlpExporterConfig;

    if (!logExporter.endpoint) {
      console.warn(WARN_MESSAGES.endpoint);
      return;
    }

    if (logExporter.headers && !Array.isArray(logExporter.headers)) {
      console.warn(WARN_MESSAGES.header);
      return;
    }
  }

  if (typeof otlpExporterConfig.traceExporter === "object") {
    const {traceExporter} = otlpExporterConfig;

    if (!traceExporter.endpoint) {
      console.warn(WARN_MESSAGES.endpoint);
      return;
    }

    if (traceExporter.headers && !Array.isArray(traceExporter.headers)) {
      console.warn(WARN_MESSAGES.header);
      return;
    }
  }

  return async (sdkConfig: IOSConfig | AndroidConfig) => {
    try {
      return await NativeModules.RNEmbraceOTLP.startNativeEmbraceSDK(
        sdkConfig,
        otlpExporterConfig,
      );
    } catch (error) {
      console.warn(WARN_MESSAGES.error, error);
      return createFalsePromise();
    }
  };
};

export {initialize};
