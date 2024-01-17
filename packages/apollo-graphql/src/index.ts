import { zip } from 'gzip-js';
import { NativeModules, Platform } from 'react-native';
export interface IHttpOption {
  uri: string;
  url?: string;
}
interface IContext {
  start: number;
  response: {
    status: number;
    url: string;
    _bodyBlob: {
      _data: {
        size: number;
      };
    };
  };
}
interface IDefinitions {
  operation: string;
}

interface IQuery {
  definitions: IDefinitions[];
  loc: {
    source: {
      body: string;
    };
  };
}
export interface IOperation {
  setContext: ({}) => {};
  getContext: () => IContext;
  query: IQuery;
  operationName: string;
}
interface IOperationData {
  errors: any;
  data: any;
}

interface IError {
  message: string;
  error: string;
  statusCode: number;
  name?: string;
  stack?: string;
}
interface IFowardResponse {
  map: (data: IMap) => { subscribe: ISubscribe };
}
interface IObserver {
  error: (r: IError) => void;
}

type IMap = (data: IOperationData) => IOperationData;
type ISubscribe = (data: IObserver) => IOperationData;
type IFoward = (operation: IOperation) => IFowardResponse;

const logErrorWithResponse = (
  method: string,
  url: string,
  startInMillis: number,
  dataRequest: any,
  dataReceived: any,
  status: number,
  errorMessage: string,
  errorName?: string
) => {
  const endInMillis = new Date().getTime();
  const gzippedRequestData = dataRequest ? zip(dataRequest).length : 0;
  const gzippedResponseData = dataReceived ? zip(dataReceived).length : 0;

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

const createEmbraceHttpLink = (ApolloLink: any, httpLink: any) => {
  const authMiddleware = new ApolloLink(
    (operation: IOperation, forward: IFoward) => {
      const startTime = new Date().getTime();

      const sufix = `${
        operation.operationName !== undefined &&
        operation.operationName !== 'undefined'
          ? operation.operationName
          : ''
      }(${operation.query.definitions[0].operation})`;

      operation.setContext({ start: startTime });
      operation.setContext(() => {
        return {
          headers: {
            'x-emb-path': `/graphql/${sufix}`,
          },
        };
      });

      const sendDataToEmbrace = (
        path: string,
        st: number,
        et: number,
        dataSent: any,
        dataReceived: any,
        status: number,
        error?: IError
      ) => {
        const gzippedDataSentData = dataSent ? zip(dataSent).length : 0;
        const gzippedResponseData = dataReceived ? zip(dataReceived).length : 0;

        if (!error) {
          NativeModules.EmbraceManager.logNetworkRequest(
            path,
            'POST',
            st,
            et,
            gzippedDataSentData,
            gzippedResponseData,
            status,
            undefined
          );
        } else {
          logErrorWithResponse(
            'POST',
            path,
            st,
            gzippedDataSentData,
            gzippedResponseData,
            status,
            error.message,
            error.name
          );
        }
      };

      const observable = forward(operation).map((data) => {
        const {
          start: startTime,
          response: { status, url },
        } = operation.getContext();
        const endTime = new Date().getTime();
        sendDataToEmbrace(
          `${url}/${sufix}`,
          startTime,
          endTime,
          operation.query.loc.source.body,
          data.data,
          status
        );
        return data;
      });

      observable.subscribe({
        error: (error) => {
          const { start: startTime, response } = operation.getContext();
          const { url } = response;
          let responseSize = 0;
          if (response._bodyBlob && response._bodyBlob._data) {
            responseSize = response._bodyBlob._data.size;
          }

          sendDataToEmbrace(
            `${url}/${sufix}`,
            startTime,
            new Date().getTime(),
            operation.query.loc.source.body,
            responseSize,
            error.statusCode,
            error
          );
        },
      });

      return observable;
    }
  );

  return authMiddleware.concat(httpLink);
};

export default class EmbraceApolloLink {
  public static build = (
    ApolloLink: any,
    link: any,
    platformToApply?: 'ios' | 'android'
  ): any => {
    if (!link) {
      console.warn(
        '[Embrace] Apollo Link was not provided. GraphQL tracker was not applied.'
      );
      return () => {};
    }
    if (platformToApply && platformToApply !== Platform.OS) {
      console.warn(
        '[Embrace] This platform was marked to not track. GraphQL tracker was not applied.'
      );
      return link;
    }
    if (!ApolloLink) {
      console.warn(
        '[Embrace] Apollo reference was not provided. GraphQL tracker was not applied.'
      );
      return link;
    }
    if (!NativeModules.EmbraceManager) {
      console.warn(
        '[Embrace] You must have the Embrace SDK to track screens, run `yarn add @embrace-io/react-native`.'
      );
      return link;
    }

    const embraceMiddleware = () => {
      return createEmbraceHttpLink(ApolloLink, link);
    };

    return embraceMiddleware;
  }
}
