import { MethodType } from "../interfaces";
import { EmbraceManagerModule } from "../EmbraceManagerModule";
import { handleSDKPromiseRejection } from "../utils/promiseHandler";

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

const recordNetworkRequestAsync = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  bytesSent?: number,
  bytesReceived?: number,
  statusCode?: number,
): void => {
  handleSDKPromiseRejection(recordNetworkRequest(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    bytesSent,
    bytesReceived,
    statusCode,
  ), "logNetworkRequest");
};

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

const logNetworkClientErrorAsync = (
  url: string,
  httpMethod: MethodType,
  startInMillis: number,
  endInMillis: number,
  errorType: string,
  errorMessage: string,
): void => {
  handleSDKPromiseRejection(logNetworkClientError(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    errorType,
    errorMessage,
  ), "logNetworkClientError");
};

export { recordNetworkRequest, recordNetworkRequestAsync, logNetworkClientError, logNetworkClientErrorAsync };