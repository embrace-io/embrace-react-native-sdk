import {NativeModules} from "react-native";
import {useEffect, useState} from "react";
import {TracerProvider} from "@opentelemetry/api";

import {logWarning} from "./util";
import {
  EmbraceNativeTracerProviderConfig,
  UseEmbraceNativeTracerProviderResult,
} from "./types";
import {EmbraceNativeTracerProvider} from "./EmbraceNativeTracerProvider";

/**
 * useEmbraceNativeTracerProvider makes sure that the Embrace SDK has been installed and started and
 * then sets up a EmbraceNativeTracerProvider
 *
 * The EmbraceNativeTracerProvider implements a TracerProvider over the native Embrace Android and iOS SDKs.
 * Thin wrapped objects representing Tracers and Spans are maintained at the JS level and use Native Modules to
 * call down to the SDKs to perform the actual operations on them.
 *
 * The JS side of its implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
export const useEmbraceNativeTracerProvider = (
  config?: EmbraceNativeTracerProviderConfig,
  enabled = true,
): UseEmbraceNativeTracerProviderResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [tracerProvider, setTracerProvider] = useState<TracerProvider | null>(
    null,
  );

  useEffect(() => {
    if (error) {
      logWarning(error);
    }
  }, [error]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!NativeModules.EmbraceManager) {
      setError(
        "You must have the Embrace SDK available to use the TracerProvider, please install `@embrace-io/react-native`.",
      );
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (isLoading) {
      NativeModules.EmbraceManager.isStarted()
        .then((started: boolean) => {
          if (!started) {
            setError(
              "The Embrace SDK must be started to use the TracerProvider, please invoke `initialize` from `@embrace-io/react-native`.",
            );
            setIsError(true);
          } else if (!tracerProvider) {
            setTracerProvider(new EmbraceNativeTracerProvider(config));
          }
        })
        .catch(() => {
          setError("Failed to setup EmbraceNativeTracerProvider");
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isLoading, config, enabled]);

  return {
    isLoading,
    isError,
    error,
    tracerProvider,
  };
};
