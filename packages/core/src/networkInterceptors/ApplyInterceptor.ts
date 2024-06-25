import {
  NETWORK_INTERCEPTOR_TYPES,
  NETWORK_SDK_INTERCEPTORS,
} from "../interfaces/NetworkMonitoring";

import {applyAxiosNetworkInterceptor} from "./providers/AxiosProvider";

interface IIntercerptorStrategy {
  applyInterceptor: (interceptor: NETWORK_INTERCEPTOR_TYPES) => void;
}

type APPLY_INTERCEPTOR_STRATEGY = Record<
  NETWORK_SDK_INTERCEPTORS,
  IIntercerptorStrategy
>;

export const ApplyInterceptorStrategy: APPLY_INTERCEPTOR_STRATEGY = {
  axios: {
    applyInterceptor: applyAxiosNetworkInterceptor,
  },
};
