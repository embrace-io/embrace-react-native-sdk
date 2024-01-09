import { IAxios, validateAxiosInterface } from './IAxios';

export type NETWORK_SDK_INTERCEPTORS = 'axios';

export type NETWORK_INTERCEPTOR_TYPES = IAxios;

/**
 * This methods validates if the instance is supported by Embrace
 * and returns its type
 * @param providerInstance
 * @returns Provider interceptor type
 */
export const getNetworkSDKInterceptorProvider = (
  providerInstance: NETWORK_INTERCEPTOR_TYPES
) => {
  if (validateAxiosInterface(providerInstance)) {
    return 'axios';
  }

  return undefined;
};
