import {MethodType} from "./HTTP";
import {LiteralMap} from "./Common";

/**
 * This interface defines the internal Axios's interceptor structure
 */
export interface AxiosInterceptorManager<V> {
  use<T = V>(
    onFulfilled?: (value: V) => T | Promise<T>,
    onRejected?: (error: any) => any,
  ): void;
}

/**
 * This interface defines the metadata that tracks HTTP request speed/performance
 */
export interface IEmbraceAxiosTrackerMetadata {
  startInMillis: number;
}

/**
 * This interface defines the Axios's request configuration structure
 */
export interface IAxiosRequestConfig<T = any> {
  url?: string;
  method?: MethodType | string;
  baseURL?: string;
  headers?: LiteralMap;
  params?: any;
  embraceMetadata?: IEmbraceAxiosTrackerMetadata;
  data?: T;
}

/**
 * This interface defines the Axios's response error structure used on
 * no 2xx (http code) response
 */
export interface IAxiosErrorResponse {
  response?: IAxiosResponse;
  message: string;
  stack?: string;
  name?: string;
  bundleURL?: string;
  line?: string;
  column?: string;
  config: IAxiosRequestConfig;
}

/**
 * This interface defines the Axios's response configuration structure
 */
export interface IAxiosResponse<T = any, D = any> {
  data: T;
  status: number;
  statusText: string;
  headers: LiteralMap;
  config: IAxiosRequestConfig<D>;
  request?: any;
}

/**
 * This interface defines the Axios's interceptor structure
 */
export interface IAxiosInterceptor {
  request: AxiosInterceptorManager<IAxiosRequestConfig>;
  response: AxiosInterceptorManager<IAxiosResponse>;
}

/**
 * This interface defines the Axios's instance structure
 */
export interface IAxios {
  interceptors: IAxiosInterceptor;
}

/**
 * This method validates if the instance provided has the same structure
 * as Axios
 */

export const validateAxiosInterface = (instance: any): instance is IAxios => {
  if (!("interceptors" in instance)) {
    return false;
  }
  const {interceptors} = instance;
  if (!("request" in interceptors && "response" in interceptors)) {
    return false;
  }
  const {request, response} = interceptors;
  if (!("use" in request && "use" in response)) {
    return false;
  }
  return true;
};
