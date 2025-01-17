import {useEffect, useState} from "react";
import {zip} from "gzip-js";
import {Middleware} from "@reduxjs/toolkit";
import {Attributes, TracerProvider} from "@opentelemetry/api";

import {dispatchMiddleware} from "./instrumentation";

interface UseActionTrackerReturn<RootState> {
  // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
  // eslint-disable-next-line @typescript-eslint/ban-types
  middleware?: Middleware<{}, RootState>;
}

type EmbraceAttributes = {
  name?: string;
  "emb.type": string;
  outcome?: string;
  payload_size?: string;
};

const attributeTransform = (attrs: Attributes) => {
  const transformed: EmbraceAttributes = {
    "emb.type": "sys.rn_action",
  };

  if (attrs["action.type"]) {
    transformed.name = attrs["action.type"]?.toString();
  }

  if (attrs["action.payload"]) {
    transformed.payload_size = zip(
      attrs["action.payload"].toString(),
    ).length.toString();
  }

  if (attrs["action.outcome"]) {
    transformed.outcome = attrs["action.outcome"]?.toString();
  }

  return transformed;
};

const createEmbraceMiddleware = <RootState>(
  tracerProvider: TracerProvider,
  // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
  // eslint-disable-next-line @typescript-eslint/ban-types
): Middleware<{}, RootState> =>
  dispatchMiddleware(tracerProvider, {
    attributeTransform,
  });

const useEmbraceMiddleware = <RootState>(
  tracerProvider?: TracerProvider | null,
): UseActionTrackerReturn<RootState> => {
  // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
  // eslint-disable-next-line @typescript-eslint/ban-types
  const [middleware, setMiddleware] = useState<Middleware<{}, RootState>>();

  useEffect(() => {
    if (tracerProvider && !middleware) {
      // since `middleware` is a function the wrapping anonymous function is needed here to avoid using the overloaded
      // signature of `setMiddleware` that accepts a function as the first argument
      setMiddleware(() => createEmbraceMiddleware<RootState>(tracerProvider));
    }
  }, [tracerProvider, middleware]);

  return {
    middleware,
  };
};

export {useEmbraceMiddleware, createEmbraceMiddleware};
