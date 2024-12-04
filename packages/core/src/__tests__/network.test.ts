import {MethodType} from "../interfaces/HTTP";
import {applyNetworkInterceptors} from "../index";

const mockLogNetworkRequest = jest.fn();
const mockLogNetworkClientError = jest.fn();

const ReactNativeMock = jest.requireMock("react-native");

jest.mock("../EmbraceManagerModule", () => ({
  EmbraceManagerModule: {
    logNetworkRequest: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      bytesSent: number,
      bytesReceived: number,
      statusCode: number,
      error: string,
    ) =>
      mockLogNetworkRequest(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        bytesSent,
        bytesReceived,
        statusCode,
        error,
      ),
    logNetworkClientError: (
      url: string,
      httpMethod: MethodType,
      startInMillis: number,
      endInMillis: number,
      errorType: string,
      errorMessage: string,
    ) =>
      mockLogNetworkClientError(
        url,
        httpMethod,
        startInMillis,
        endInMillis,
        errorType,
        errorMessage,
      ),
  },
}));

jest.mock("react-native", () => ({
  Platform: {OS: "android"},
}));

const getAxiosMocked = () => {
  return {
    interceptors: {
      request: {
        handlers: [] as Record<string, any>,
        use(
          requestConfig?: (t: any) => any,
          requestOnReject?: (t: any) => any,
        ) {
          this.handlers.push({
            fulfilled: requestConfig,
            rejected: requestOnReject,
          });
        },
      },
      response: {
        handlers: [] as Record<string, any>,
        use(
          responseConfig?: (t: any) => any,
          responseOnReject?: (t: any) => any,
        ) {
          this.handlers.push({
            fulfilled: responseConfig,
            rejected: responseOnReject,
          });
        },
      },
    },
  };
};

describe("Log network call With Axios", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    ReactNativeMock.Platform.OS = "android";
  });

  test("Verify the instance has an Axios structure", () => {
    const axiosMockedOK = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };
    const axiosMockedNOK = {
      otherVariableThatWeDontUse: true,
    };
    const axiosMockedNOKJustInterceptor = {
      interceptors: {},
      otherVariableThatWeDontUse: true,
    };
    const axiosMockedNOKInterceptorWithRequest = {
      interceptors: {
        request: {
          otherVariableThatWeDontUse: true,
        },
        response: {
          otherVariableThatWeDontUse: true,
        },
      },
    };

    expect(applyNetworkInterceptors(axiosMockedOK)).resolves.toEqual(true);
    // @ts-expect-error testing invalid case
    expect(applyNetworkInterceptors()).resolves.toEqual(false);
    // @ts-expect-error testing invalid case
    expect(applyNetworkInterceptors(axiosMockedNOK)).resolves.toEqual(false);
    expect(
      // @ts-expect-error testing invalid case
      applyNetworkInterceptors(axiosMockedNOKJustInterceptor),
    ).resolves.toEqual(false);
    expect(
      // @ts-expect-error testing invalid case
      applyNetworkInterceptors(axiosMockedNOKInterceptorWithRequest),
    ).resolves.toEqual(false);
  });

  test("Axios 'use' methods should be called", () => {
    const axiosMocked = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    applyNetworkInterceptors(axiosMocked);
    expect(axiosMocked.interceptors.request.use).toHaveBeenCalled();
    expect(axiosMocked.interceptors.response.use).toHaveBeenCalled();
  });

  test("Axios 'use' methods should be called with Func", () => {
    Promise.reject = jest.fn();
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    expect(axiosMocked.interceptors.request.handlers.length).toEqual(1);
    expect(axiosMocked.interceptors.response.handlers.length).toEqual(1);

    axiosMocked.interceptors.request.handlers[0].rejected("");
    axiosMocked.interceptors.response.handlers[0].rejected("");

    const requestMock = {embraceMetadata: {startInMillis: 1655838253076}};

    expect(
      Object.keys(axiosMocked.interceptors.request.handlers[0].fulfilled({})),
    ).toEqual(Object.keys(requestMock));

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: {startInMillis: 1655838253076},
        data: {getBytes: () => 123},
      },
      status: 200,
      data: {getBytes: () => 12},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(responsePropMock);

    expect(mockLogNetworkRequest).toHaveBeenCalledTimes(1);

    expect(Promise.reject).toHaveBeenCalledTimes(2);
  });

  test("Axios Request Config param not set", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    expect(axiosMocked.interceptors.request.handlers[0].fulfilled()).toEqual(
      undefined,
    );
  });

  test("Shouldn't track network data", () => {
    Promise.reject = jest.fn();
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responsePropMockWithoutMethod = {
      config: {
        url: "google.com",
        embraceMetadata: {startInMillis: 1655838253076},
        data: {getBytes: () => 123},
      },
      status: 200,
      data: {getBytes: () => 12},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(
      responsePropMockWithoutMethod,
    );

    const responsePropMockWithoutURL = {
      config: {
        method: "get",
        embraceMetadata: {startInMillis: 1655838253076},
        data: {getBytes: () => 123},
      },
      status: 200,
      data: {getBytes: () => 12},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(
      responsePropMockWithoutURL,
    );

    const responsePropMockWithoutMetadata = {
      config: {
        method: "get",
        url: "google.com",
        data: undefined,
      },
      status: 200,
      data: undefined,
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(
      responsePropMockWithoutMetadata,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledTimes(0);
  });

  test("Not tracking bytes", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: {startInMillis: 1655838253076},
        data: {},
      },
      status: 200,
      data: {},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(responsePropMock);
  });

  test("Track rejected error", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "undefined is not an object",
      stack: "evaluating 'd[0].a'",
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledTimes(0);
  });

  test("Track http code != 2xx iOS", () => {
    ReactNativeMock.Platform.OS = "ios";
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: {startInMillis: 1655838253076},
          data: {getBytes: () => 123},
        },
        status: 404,
        data: {getBytes: () => 12},
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledTimes(1);
  });

  test("Track http code != 2xx", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: {startInMillis: 1655838253076},
          data: {getBytes: () => 123},
        },
        status: 404,
        data: {getBytes: () => 12},
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock,
    );

    expect(mockLogNetworkClientError).toHaveBeenCalledTimes(1);
  });

  test("Error on logNetworkRequest", () => {
    mockLogNetworkClientError.mockImplementation(() => {
      throw Error;
    });
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: {startInMillis: 1655838253076},
          data: undefined,
        },
        status: 404,
        data: undefined,
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock,
    );
  });

  test("No Track network because the information was incomplete", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          embraceMetadata: {startInMillis: 1655838253076},
        },
        status: 404,
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock,
    );

    expect(mockLogNetworkRequest).toHaveBeenCalledTimes(0);
  });

  test("logNetworkRequest failed", () => {
    const axiosMocked = getAxiosMocked();
    applyNetworkInterceptors(axiosMocked);

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: {startInMillis: 1655838253076},
        data: {getBytes: () => 123},
      },
      status: 200,
      data: {getBytes: () => 12},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(responsePropMock);
  });

  test("Axios Use methods should not be called", () => {
    const axiosMocked = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    // @ts-expect-error testing invalid case
    applyNetworkInterceptors();

    expect(axiosMocked.interceptors.request.use).toHaveBeenCalledTimes(0);
    expect(axiosMocked.interceptors.response.use).toHaveBeenCalledTimes(0);
  });
});
