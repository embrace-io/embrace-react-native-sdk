/**
 * Network API
 *
 * Provides methods for manually recording network requests and client errors.
 * The native Embrace SDKs automatically instrument standard networking libraries
 * (fetch, XMLHttpRequest), but this API can be used for custom networking
 * implementations that aren't automatically captured.
 *
 * @see {@link https://embrace.io/docs/react-native/faq/#my-network-calls-are-not-being-captured-what-could-be-going-wrong | Network FAQ}
 */

import {MethodType} from "../interfaces";
import {EmbraceManagerModule} from "../EmbraceManagerModule";

/**
 * Manually records a completed network request.
 *
 * Use this when your app makes network calls through a mechanism that isn't
 * automatically instrumented by the Embrace SDK (e.g., custom native bridges,
 * WebSocket-based REST calls).
 *
 * @param url - The full URL of the request
 * @param httpMethod - The HTTP method used (e.g., `"GET"`, `"POST"`, `"PUT"`)
 * @param startInMillis - The request start time as a Unix timestamp in milliseconds
 * @param endInMillis - The request end time as a Unix timestamp in milliseconds
 * @param bytesSent - The number of bytes sent in the request body. Optional.
 * @param bytesReceived - The number of bytes received in the response body. Optional.
 * @param statusCode - The HTTP response status code. Optional.
 * @returns A promise that resolves to `true` if the request was successfully recorded, `false` otherwise
 *
 * @example
 * ```typescript
 * import { recordNetworkRequest } from '@embrace-io/react-native';
 *
 * const start = Date.now();
 * const response = await customFetch('https://api.example.com/data');
 * const end = Date.now();
 *
 * await recordNetworkRequest(
 *   'https://api.example.com/data',
 *   'GET',
 *   start,
 *   end,
 *   0,
 *   response.bodyLength,
 *   response.status,
 * );
 * ```
 */
const recordNetworkRequest = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  bytesSent?: number,
  bytesReceived?: number,
  statusCode?: number,
): Promise<boolean> => {
  return EmbraceManagerModule.logNetworkRequest(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    bytesSent || -1,
    bytesReceived || -1,
    statusCode || -1,
  );
};

/**
 * Manually records a network request that failed due to a client-side error.
 *
 * Use this to log network failures such as timeouts, DNS resolution failures,
 * or connection refused errors for custom networking implementations.
 *
 * @param url - The full URL of the failed request
 * @param httpMethod - The HTTP method used (e.g., `"GET"`, `"POST"`)
 * @param startInMillis - The request start time as a Unix timestamp in milliseconds
 * @param endInMillis - The time the error occurred as a Unix timestamp in milliseconds
 * @param errorType - A short classification of the error (e.g., `"Timeout"`, `"ConnectionRefused"`)
 * @param errorMessage - A descriptive message about what went wrong
 * @returns A promise that resolves to `true` if the error was successfully recorded, `false` otherwise
 *
 * @example
 * ```typescript
 * import { logNetworkClientError } from '@embrace-io/react-native';
 *
 * const start = Date.now();
 * try {
 *   await customFetch('https://api.example.com/data');
 * } catch (err) {
 *   await logNetworkClientError(
 *     'https://api.example.com/data',
 *     'GET',
 *     start,
 *     Date.now(),
 *     'Timeout',
 *     'Request timed out after 30s',
 *   );
 * }
 * ```
 */
const logNetworkClientError = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  errorType: string,
  errorMessage: string,
): Promise<boolean> => {
  return EmbraceManagerModule.logNetworkClientError(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    errorType,
    errorMessage,
  );
};

export {recordNetworkRequest, logNetworkClientError};
