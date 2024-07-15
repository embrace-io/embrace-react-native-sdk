import {NativeModules} from "react-native";
import {useEffect, useState} from "react";
import {
  context,
  ContextManager,
  Tracer,
  TracerProvider,
} from "@opentelemetry/api";

import {logWarning} from "./util";
import {
  EmbraceNativeTracerProviderConfig,
  SpanContextSyncBehaviour,
  UseEmbraceNativeTracerProviderResult,
} from "./types";
import {TracerProviderModule} from "./TracerProviderModule";
import {StackContextManager} from "./StackContextManager";
import {EmbraceNativeTracer} from "./EmbraceNativeTracer";

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
          if (started) {
            setTracerProvider(new EmbraceNativeTracerProvider(config));
          } else {
            setError(
              "The Embrace SDK must be started to use the TracerProvider, please invoke `initialize` from `@embrace-io/react-native`.",
            );
            setIsError(true);
          }
        })
        .catch(() => {
          setError("Failed to setup EmbraceNativeTracerProvider");
          setIsError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isLoading, config]);

  return {
    isLoading,
    isError,
    error,
    tracerProvider,
  };
};

/**
 * EmbraceNativeTracerProvider implements a TracerProvider over the native Embrace Android and iOS SDKs.
 * Thin wrapped objects representing Tracers and Spans are maintained at the JS level and use Native Modules to
 * call down to the SDKs to perform the actual operations on them.
 *
 * The JS side of this implementation is modelled after [opentelemetry-sdk-trace-base](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-trace-base)
 */
class EmbraceNativeTracerProvider implements TracerProvider {
  private readonly contextManager: ContextManager;
  private readonly spanContextSyncBehaviour: SpanContextSyncBehaviour;

  constructor(
    config: EmbraceNativeTracerProviderConfig = {
      setGlobalContextManager: true,
    },
  ) {
    this.contextManager = new StackContextManager();
    this.contextManager.enable();

    if (config.setGlobalContextManager) {
      context.setGlobalContextManager(this.contextManager);
    }

    this.spanContextSyncBehaviour =
      config.spanContextSyncBehaviour || "return_empty";
  }

  public getTracer(
    name: string,
    version?: string,
    options?: {schemaUrl?: string},
  ): Tracer {
    const schemaUrl = options?.schemaUrl || "";
    const tracerVersion = version || "";
    TracerProviderModule.setupTracer(name, tracerVersion, schemaUrl);
    return new EmbraceNativeTracer(
      this.contextManager,
      this.spanContextSyncBehaviour,
      name,
      tracerVersion,
      schemaUrl,
    );
  }
}
