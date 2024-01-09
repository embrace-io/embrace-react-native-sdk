import { IAnyAction } from '../interfaces/MiddlewareInterfaces';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Test State Managment', () => {
  test('Applying middleware - With Name', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = { type: 'CREATE_USER' };

    expect(store(dispatch)(action)).toEqual(action);
    expect(mockLogBreadcrumb).toBeCalled();
  });
  test('Applying middleware - Without Name', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = { type: undefined };

    expect(store(dispatch)(action)).toEqual(action);
    expect(mockLogBreadcrumb).toBeCalledTimes(0);
  });
  test('Dispatch not provided', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const action = { type: 'CREATE_USER' };

    expect(store()(action)).toEqual(0);
  });
  test('Dispatch is not a function', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const action = { type: 'CREATE_USER' };

    expect(store({})(action)).toEqual(0);
  });
  test('Action not provided', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});

    const dispatch = (d: IAnyAction) => {
      return d;
    };
    expect(store(dispatch)()).toEqual(undefined);
    expect(mockLogBreadcrumb).toBeCalledTimes(0);
  });
  test('Action provided is not a String', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: mockLogBreadcrumb,
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = { type: 1 };

    expect(store(dispatch)(action)).toEqual(action);
    expect(mockLogBreadcrumb).toBeCalled();
  });

  test('Error occurred', () => {
    const mockLogBreadcrumb = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          logRNAction: (
            n: string,
            st: string,
            et: string,
            p: string,
            pd: number,
            output: string
          ) => {
            if (output === 'FAIL') {
              mockLogBreadcrumb();
              return;
            }
            throw new Error('Just crash it');
          },
        },
      },
    }));
    const { buildEmbraceMiddleware } = require('../src/index');

    const buildedEmbraceMiddleware = buildEmbraceMiddleware();
    const store = buildedEmbraceMiddleware({});
    const dispatch = (d: IAnyAction) => {
      return d;
    };
    const action = { type: 'CREATE_USER' };
    try {
      store(dispatch)(action);
    } catch (e) {
      if (e instanceof Error) { expect(e.message).toBe('Just crash it'); }
      expect(mockLogBreadcrumb).toBeCalled();
    }
  });
});
