import {Middleware} from "redux";
import {useEffect, useState} from "react";
import {zip} from "gzip-js";
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
  payload_size?: number;
};

const attributeTransform = (attrs: Attributes) => {
  const transformed: EmbraceAttributes = {
    name: attrs.type?.toString(),
    "emb.type": "sys.rn_action",
    outcome: attrs["action.outcome"]?.toString(),
  };

  if (attrs["action.payload"]) {
    transformed.payload_size = zip(attrs["action.payload"].toString()).length;
  }

  return transformed;
};

const useActionTracker = <RootState>(
  tracerProvider?: TracerProvider,
): UseActionTrackerReturn<RootState> => {
  // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
  // eslint-disable-next-line @typescript-eslint/ban-types
  const [middleware, setMiddleware] = useState<Middleware<{}, RootState>>();

  useEffect(() => {
    if (tracerProvider && !middleware) {
      // since `middleware` is a function the wrapping anonymous function is needed here to avoid using the overloaded
      // signature of `setMiddleware` that accepts a function as the first argument
      setMiddleware(() =>
        dispatchMiddleware(tracerProvider, {
          attributeTransform,
        }),
      );
    }
  }, [tracerProvider, middleware]);

  return {
    middleware,
  };
};

export {useActionTracker, attributeTransform};
