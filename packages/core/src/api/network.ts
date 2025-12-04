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
  void EmbraceManagerModule.logNetworkRequest(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    bytesSent || -1,
    bytesReceived || -1,
    statusCode || -1,
  ).catch((error: unknown) => {
    handleSDKPromiseRejection("logNetworkRequest", error);
  });
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
  void EmbraceManagerModule.logNetworkClientError(
    url,
    httpMethod,
    startInMillis,
    endInMillis,
    errorType,
    errorMessage,
  ).catch((error: unknown) => {
    handleSDKPromiseRejection("logNetworkClientError", error);
  });
};

export { recordNetworkRequest, recordNetworkRequestAsync, logNetworkClientError, logNetworkClientErrorAsync };