jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});
describe("Log network call With Axios", () => {
  test("Verify the instance has an Axios structure", async () => {
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

    const { applyNetworkInterceptors } = require("../index");
    expect(await applyNetworkInterceptors(axiosMockedOK)).toEqual(true);
    expect(await applyNetworkInterceptors()).toEqual(false);
    expect(await applyNetworkInterceptors(axiosMockedNOK)).toEqual(false);
    expect(
      await applyNetworkInterceptors(axiosMockedNOKJustInterceptor)
    ).toEqual(false);
    expect(
      await applyNetworkInterceptors(axiosMockedNOKInterceptorWithRequest)
    ).toEqual(false);
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

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    expect(axiosMocked.interceptors.request.use).toBeCalled();
    expect(axiosMocked.interceptors.response.use).toBeCalled();
  });

  test("Axios 'use' methods should be called with Func", () => {
    Promise.reject = jest.fn();
    const mockLogNetworkRequest = jest.fn();

    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          logNetworkRequest: mockLogNetworkRequest,
        },
      },
    }));

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    expect(axiosMocked.interceptors.request.handlers.length).toEqual(1);
    expect(axiosMocked.interceptors.response.handlers.length).toEqual(1);

    axiosMocked.interceptors.request.handlers[0].rejected("");
    axiosMocked.interceptors.response.handlers[0].rejected("");

    const requestMock = { embraceMetadata: { startInMillis: 1655838253076 } };

    expect(
      Object.keys(axiosMocked.interceptors.request.handlers[0].fulfilled({}))
    ).toEqual(Object.keys(requestMock));

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: { startInMillis: 1655838253076 },
        data: { getBytes: () => 123 },
      },
      status: 200,
      data: { getBytes: () => 12 },
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(responsePropMock);

    expect(mockLogNetworkRequest).toBeCalledTimes(1);

    expect(Promise.reject).toBeCalledTimes(2);
  });

  test("Axios Request Config param not set", () => {
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    expect(axiosMocked.interceptors.request.handlers[0].fulfilled()).toEqual(
      undefined
    );
  });

  test("Shouldn't track network data", () => {
    Promise.reject = jest.fn();
    const mockLogNetworkRequest = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responsePropMockWithoutMethod = {
      config: {
        url: "google.com",
        embraceMetadata: { startInMillis: 1655838253076 },
        data: { getBytes: () => 123 },
      },
      status: 200,
      data: { getBytes: () => 12 },
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(
      responsePropMockWithoutMethod
    );

    const responsePropMockWithoutURL = {
      config: {
        method: "get",
        embraceMetadata: { startInMillis: 1655838253076 },
        data: { getBytes: () => 123 },
      },
      status: 200,
      data: { getBytes: () => 12 },
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(
      responsePropMockWithoutURL
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
      responsePropMockWithoutMetadata
    );

    expect(mockLogNetworkRequest).toBeCalledTimes(0);
  });

  test("Not tracking bytes", () => {
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: { startInMillis: 1655838253076 },
        data: {},
      },
      status: 200,
      data: {},
    };

    axiosMocked.interceptors.response.handlers[0].fulfilled(responsePropMock);
  });

  test("Track rejected error", () => {
    const mockLogNetworkRequest = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "undefined is not an object",
      stack: "evaluating 'd[0].a'",
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock
    );

    expect(mockLogNetworkRequest).toBeCalledTimes(0);
  });

  test("Track http code != 2xx iOS", () => {
    const mockLogNetworkRequest = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        Platform: {
          OS: "ios",
        },
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: { startInMillis: 1655838253076 },
          data: { getBytes: () => 123 },
        },
        status: 404,
        data: { getBytes: () => 12 },
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock
    );

    expect(mockLogNetworkRequest).toBeCalledTimes(1);
  });

  test("Track http code != 2xx", () => {
    const mockLogNetworkClientError = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        Platform: {
          OS: "android",
        },
        NativeModules: {
          EmbraceManager: {
            logNetworkClientError: mockLogNetworkClientError,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: { startInMillis: 1655838253076 },
          data: { getBytes: () => 123 },
        },
        status: 404,
        data: { getBytes: () => 12 },
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock
    );

    expect(mockLogNetworkClientError).toBeCalledTimes(1);
  });

  test("Error on logNetworkRequest", () => {
    const mockLogNetworkClientError = () => {
      throw Error;
    };

    jest.mock(
      "react-native",
      () => ({
        Platform: {
          OS: "ios",
        },
        NativeModules: {
          EmbraceManager: {
            logNetworkClientError: mockLogNetworkClientError,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          url: "google.com",
          embraceMetadata: { startInMillis: 1655838253076 },
          data: undefined,
        },
        status: 404,
        data: undefined,
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock
    );
  });

  test("No Track network because the information was incomplete", () => {
    const mockLogNetworkRequest = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responseErrorPropMock = {
      message: "Request failed with status code 404",
      response: {
        config: {
          method: "get",
          embraceMetadata: { startInMillis: 1655838253076 },
        },
        status: 404,
      },
    };

    axiosMocked.interceptors.response.handlers[0].rejected(
      responseErrorPropMock
    );

    expect(mockLogNetworkRequest).toBeCalledTimes(0);
  });

  test("logNetworkRequest failed", () => {
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: undefined,
          },
        },
      }),
      { virtual: true }
    );
    const axiosMocked = {
      interceptors: {
        request: {
          handlers: [] as Record<string, any>,
          use(requestConfig: (t: any) => {}, requestOnReject: (t: any) => {}) {
            this.handlers.push({
              fulfilled: requestConfig,
              rejected: requestOnReject,
            });
          },
        },
        response: {
          handlers: [] as Record<string, any>,
          use(
            responseConfig: (t: any) => {},
            responseOnReject: (t: any) => {}
          ) {
            this.handlers.push({
              fulfilled: responseConfig,
              rejected: responseOnReject,
            });
          },
        },
      },
    };

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors(axiosMocked);

    const responsePropMock = {
      config: {
        method: "get",
        url: "google.com",
        embraceMetadata: { startInMillis: 1655838253076 },
        data: { getBytes: () => 123 },
      },
      status: 200,
      data: { getBytes: () => 12 },
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

    const { applyNetworkInterceptors } = require("../index");

    applyNetworkInterceptors();

    expect(axiosMocked.interceptors.request.use).toBeCalledTimes(0);
    expect(axiosMocked.interceptors.response.use).toBeCalledTimes(0);
  });
});
