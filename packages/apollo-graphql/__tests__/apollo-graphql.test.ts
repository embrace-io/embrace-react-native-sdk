jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

class ApolloLink {
  constructor(func: (o: any, f: any) => {}) {
    const operation = {
      operationName: 'test',
      query: {
        definitions: [{ operation: 'query' }],
        loc: { source: { body: 'asdasdada' } },
      },
      setContext: (data: any) => {
        if (typeof data === 'function') {
          data();
        }
      },
      getContext: () => {
        return {
          start: 123123,
          embUrlToTrack: 'url',
          response: { status: 200 },
        };
      },
    };
    const forward = (o: any) => {
      return {
        map: (func: any) => {
          func({ data: { data: 'asd' } });
          return {
            subscribe: (errorObj: any) => {
              errorObj.error({ statusCode: 200 });
            },
          };
        },
      };
    };
    func(operation, forward);
  }
  public concat(link: any) {
    return link;
  }
}

describe('Test React Native Apollo Tracker', () => {
  test('createHttpLink was not Provided', () => {
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {},
        },
      }),
      { virtual: true }
    );
    const EmbraceApolloLink = require('../src/index');

    expect(JSON.stringify(EmbraceApolloLink.default.build({}))).toEqual(
      JSON.stringify(() => {})
    );
  });
  test('ApolloLink was not Provided', () => {
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {},
        },
      }),
      { virtual: true }
    );
    const EmbraceApolloLink = require('../src/index');

    expect(
      JSON.stringify(EmbraceApolloLink.default.build(undefined, () => {}))
    ).toEqual(JSON.stringify(() => {}));
  });
  test('Embrace SDK not installed', () => {
    const EmbraceApolloLink = require('../src/index');

    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: undefined,
        },
      }),
      { virtual: true }
    );

    expect(
      JSON.stringify(EmbraceApolloLink.default.build({}, () => {}))
    ).toEqual(JSON.stringify(() => {}));
  });
  test('ApolloLink was not Provided', () => {
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {},
        },
        Platform: {
          OS: 'android',
        },
      }),
      { virtual: true }
    );
    const EmbraceApolloLink = require('../src/index');

    expect(
      JSON.stringify(EmbraceApolloLink.default.build({}, () => {}, 'android'))
    ).toEqual(JSON.stringify(() => {}));
  });

  test('LogNetworkRequest should be called - Android', () => {
    const mockLogNetworkRequest = jest.fn();
    const mockLogNetworkError = jest.fn();

    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
            logNetworkClientError: mockLogNetworkError,
          },
        },
        Platform: {
          OS: 'android',
        },
      }),
      { virtual: true }
    );

    const EmbraceApolloLink = require('../src/index');
    const createHttpLinkFunc = EmbraceApolloLink.default.build(
      ApolloLink,
      () => {}
    );
    createHttpLinkFunc({ uri: 'hi' });
    expect(mockLogNetworkRequest).toBeCalledTimes(1);
    expect(mockLogNetworkError).toBeCalledTimes(1);
  });
  test('LogNetworkRequest should be called - iOS', () => {
    const mockLogNetworkRequest = jest.fn();

    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
        Platform: {
          OS: 'ios',
        },
      }),
      { virtual: true }
    );

    jest.mock(
      'gzip-js',
      () => ({
        zip: () => {
          return { length: 0 };
        },
      }),
      { virtual: true }
    );
    const EmbraceApolloLink = require('../src/index');
    const createHttpLinkFunc = EmbraceApolloLink.default.build(
      ApolloLink,
      () => {}
    );
    createHttpLinkFunc({ url: 'hi' });
    expect(mockLogNetworkRequest).toBeCalledTimes(2);
  });
  test('LogNetworkRequest should not be called - Limited by platform', () => {
    const mockLogNetworkRequest = jest.fn();

    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mockLogNetworkRequest,
          },
        },
        Platform: {
          OS: 'ios',
        },
      }),
      { virtual: true }
    );
    const EmbraceApolloLink = require('../src/index');
    const createHttpLinkFunc = EmbraceApolloLink.default.build(
      ApolloLink,
      () => {},
      'android'
    );
    createHttpLinkFunc({ url: 'hi' });
    expect(mockLogNetworkRequest).toBeCalledTimes(0);
  });
});
