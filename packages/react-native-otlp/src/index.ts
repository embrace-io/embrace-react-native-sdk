"use strict";
import {NativeModules} from "react-native";

import {AndroidConfig, IOSConfig, OTLPExporterConfig} from "./interfaces";

const noOp = async (_: IOSConfig | AndroidConfig) => {};

const WARN_MESSAGES = {
  config: "[Embrace] Invalid configuration for Custom Exporter",
  traces: "[Embrace] Invalid configuration for Trace Custom Exporter",
  logs: "[Embrace] Invalid configuration for Log Custom Exporter",
  endpoint: "[Embrace] Invalid endpoint for Custom Exporter",
  header: "[Embrace] Invalid header for Custom Exporter",
  error: "[Embrace] Failed to configure Custom Exporter",
};

const initialize = (otlpExporterConfig: OTLPExporterConfig) => {
  if (
    !otlpExporterConfig ||
    typeof otlpExporterConfig !== "object" ||
    Array.isArray(otlpExporterConfig)
  ) {
    console.warn(WARN_MESSAGES.config);
    return noOp;
  }

  if (otlpExporterConfig.logExporter) {
    const {logExporter} = otlpExporterConfig;

    if (typeof logExporter !== "object" && !Array.isArray(logExporter)) {
      console.warn(WARN_MESSAGES.logs);
      return noOp;
    }

    const {endpoint: logEndpoint, headers: logHeaders} = logExporter;

    if (!logEndpoint || typeof logEndpoint !== "string") {
      console.warn(WARN_MESSAGES.endpoint);
      return noOp;
    }

    if (logHeaders && !Array.isArray(logHeaders)) {
      console.warn(WARN_MESSAGES.header);
      return noOp;
    }
  }

  if (otlpExporterConfig.traceExporter) {
    const {traceExporter} = otlpExporterConfig;

    if (typeof traceExporter !== "object" && !Array.isArray(traceExporter)) {
      console.warn(WARN_MESSAGES.traces);
      return noOp;
    }

    const {endpoint: traceEndpoint, headers: traceHeaders} = traceExporter;

    if (!traceEndpoint || typeof traceEndpoint !== "string") {
      console.warn(WARN_MESSAGES.endpoint);
      return noOp;
    }

    if (traceHeaders && !Array.isArray(traceHeaders)) {
      console.warn(WARN_MESSAGES.header);
      return noOp;
    }
  }

  return async (sdkConfig: IOSConfig | AndroidConfig) => {
    try {
      // @embrace-io/react-native (core) is still handling the start
      // if an error occurs, the main package will print the proper errors
      return await NativeModules.RNEmbraceOTLP.startNativeEmbraceSDK(
        sdkConfig,
        otlpExporterConfig,
      );
    } catch (_) {
      return Promise.reject(WARN_MESSAGES.error);
    }
  };
};

export {initialize};
export * from "./interfaces";
