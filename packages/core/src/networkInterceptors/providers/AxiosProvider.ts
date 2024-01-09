import { zip } from 'gzip-js';
import { NativeModules, Platform } from 'react-native';
import {
  AxiosInterceptorManager,
  IAxios,
  IAxiosErrorResponse,
  IAxiosRequestConfig,
  IAxiosResponse,
  IEmbraceAxiosTrackerMetadata,
} from '../../interfaces/IAxios';

const UNKNONW_ERROR_MESSAGE =
  '[Embrace] Embrace was unable to capture the errored request due to limitations in the Axios API. Please raise a bug on the Axios repo if this affects you.';

const logErrorWithoutResponse = (error: IAxiosErrorResponse) => {
  console.warn(UNKNONW_ERROR_MESSAGE, error.message, error.stack);
};

const logErrorWithResponse = (
  method: string,
  url: string,
  embraceMetadata: IEmbraceAxiosTrackerMetadata,
  dataRequest: any,
  dataReceived: any,
  status: number,
  errorMessage: string,
  errorName?: string
) => {
  const endInMillis = new Date().getTime();
  const gzippedRequestData = dataRequest ? zip(dataRequest).length : 0;
  const gzippedResponseData = dataReceived ? zip(dataReceived).length : 0;

  const { startInMillis } = embraceMetadata;

  const logIOS = () =>
    NativeModules.EmbraceManager.logNetworkRequest(
      url,
      method,
      startInMillis,
      endInMillis,
      gzippedRequestData,
      gzippedResponseData,
      status,
      errorMessage
    );

  const logAndroid = () =>
    NativeModules.EmbraceManager.logNetworkClientError(
      url,
      method,
      startInMillis,
      endInMillis,
      errorName,
      errorMessage
    );

  return Platform.OS === 'ios' ? logIOS() : logAndroid();
};

const applyRequestInterceptors = (
  request: AxiosInterceptorManager<IAxiosRequestConfig>
) => {
  const requestConfig = (config: IAxiosRequestConfig) => {
    if (config) {
      config.embraceMetadata = { startInMillis: new Date().getTime() };
    }
    return config;
  };
  const requestOnReject = (error: any) => {
    logErrorWithoutResponse(error);
    return Promise.reject(error);
  };

  request.use(requestConfig, requestOnReject);
};

const applyResponseInterceptors = (
  response: AxiosInterceptorManager<IAxiosResponse>
) => {
  const responseConfig = (response: IAxiosResponse) => {
    const {
      config: { method, url, embraceMetadata, data: dataRequest },
      status,
      data: dataReceived,
    } = response;
    const endInMillis = new Date().getTime();

    const gzippedRequestData = dataRequest ? zip(dataRequest).length : 0;
    const gzippedResponseData = dataReceived ? zip(dataReceived).length : 0;

    if (!url || !method || !embraceMetadata) {
      console.warn(UNKNONW_ERROR_MESSAGE);
      return response;
    }

    const { startInMillis } = embraceMetadata;

    try {
      NativeModules.EmbraceManager.logNetworkRequest(
        url,
        method,
        startInMillis,
        endInMillis,
        gzippedRequestData,
        gzippedResponseData,
        status,
        null
      );
    } catch (e) {
      console.warn(
        `[Embrace] Could not send the network request to Embrace's server.`,
        e
      );
    }

    return response;
  };

  const responseOnRejected = (error: IAxiosErrorResponse) => {
    if (!error.response) {
      logErrorWithoutResponse(error);
      return Promise.reject(error);
    }

    const {
      config: { method, url, embraceMetadata, data: dataRequest },
      status,
      data: dataReceived,
    } = error.response;

    if (url && method && embraceMetadata) {
      try {
        logErrorWithResponse(
          method,
          url,
          embraceMetadata,
          dataRequest,
          dataReceived,
          status,
          error.message,
          error.name
        );
      } catch (e) {
        console.warn(
          `[Embrace] Could not send the network error to Embrace's server.`,
          e
        );
      }
    } else {
      logErrorWithoutResponse(error);
    }

    return Promise.reject(error);
  };
  response.use(responseConfig, responseOnRejected);
};

/**
 * This method injects the Axios interceptors to the instance passed through params
 * We use those interceptors to track the request and response of your API calls.
 * The tracked data will be displayed on the dashboard
 * @param networkSDKInstance
 */
export const applyAxiosNetworkInterceptor = (networkSDKInstance: IAxios) => {
  const {
    interceptors: { request, response },
  } = networkSDKInstance;

  applyRequestInterceptors(request);
  applyResponseInterceptors(response);
};
