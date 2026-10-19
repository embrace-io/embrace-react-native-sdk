import {gzipSync, strToU8} from "fflate";
import {Middleware} from "@reduxjs/toolkit";
import {Attributes, TracerProvider} from "@opentelemetry/api";

import {dispatchMiddleware} from "./instrumentation";

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
    transformed.payload_size = gzipSync(
      strToU8(attrs["action.payload"].toString()),
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
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): Middleware<{}, RootState> =>
  dispatchMiddleware(tracerProvider, {
    attributeTransform,
  });

export {createEmbraceMiddleware};
