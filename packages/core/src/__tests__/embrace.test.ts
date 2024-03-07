import { handleGlobalError } from '../utils/ErrorUtil';

const testView = 'View';
const testPersona = 'Persona';
const testUserId = 'Lucia';
const testEmail = 'lucia@nimble.la';
const testKey = 'Key';
const testValue = 'Value';
const testPermanent = false;
const testProps = { testKey: testValue };
const testMessage = 'message';
const testError = new Error();
const clearUserInfo = true;
const { INFO, ERROR, WARNING } = require('../index');

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

test('endAppStartup', () => {
  const mock = jest.fn();
  jest.mock('react-native', () => ({
    NativeModules: {
      EmbraceManager: {
        endAppStartup: mock,
      },
    },
  }));
  const { endAppStartup } = require('../index');
  endAppStartup();
  expect(mock).toBeCalled();
});

test('endAppStartupWithProperties', () => {
  const mock = jest.fn();
  jest.mock(
    'react-native',
    () => ({
      NativeModules: {
        EmbraceManager: {
          endAppStartupWithProperties: mock,
        },
      },
    }),
    { virtual: true }
  );
  const { endAppStartup } = require('../index');
  endAppStartup(testProps);
  expect(mock).toBeCalledWith(testProps);
});

describe('User Identifier Tests', () => {
  test('setUserIdentifier', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserIdentifier: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { setUserIdentifier } = require('../index');
    setUserIdentifier(testUserId);
    expect(mock).toBeCalledWith(testUserId);
  });

  test('clearUserIdentifier', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserIdentifier: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { clearUserIdentifier } = require('../index');
    clearUserIdentifier();
    expect(mock).toBeCalled();
  });
});

describe('User Data Tests', () => {
  test('setUsername', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUsername: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { setUsername } = require('../index');
    setUsername(testUserId);
    expect(mock).toBeCalledWith(testUserId);
  });

  test('clearUsername', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUsername: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { clearUsername } = require('../index');
    clearUsername();
    expect(mock).toBeCalled();
  });

  test('setUserEmail', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserEmail: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { setUserEmail } = require('../index');
    setUserEmail(testEmail);
    expect(mock).toBeCalledWith(testEmail);
  });

  test('clearUserEmail', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserEmail: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { clearUserEmail } = require('../index');
    clearUserEmail();
    expect(mock).toBeCalled();
  });
});

describe('Logs Test', () => {
  test('addBreadcrumb', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            addBreadcrumb: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { addBreadcrumb } = require('../index');
    addBreadcrumb(testView);
    expect(mock).toBeCalledWith(testView);
  });

  test('logScreen', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            addBreadcrumb: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { logScreen } = require('../index');
    logScreen(testView);
    expect(mock).toBeCalledWith(`Opening screen [${testView}]`);
  });

  describe('logMessage', () => {
    const mockSt = 'this is a fake stack trace';
    test.each`
      message        | severity   | properties   | allowScreenshot | stackTrace
      ${testMessage} | ${INFO}    | ${testProps} | ${false}        | ${''}
      ${testMessage} | ${INFO}    | ${testProps} | ${true}         | ${''}
      ${testMessage} | ${WARNING} | ${testProps} | ${false}        | ${mockSt}
      ${testMessage} | ${WARNING} | ${testProps} | ${true}         | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${false}        | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${true}         | ${mockSt}
    `(
      'should run $severity log',
      ({ message, severity, properties, allowScreenshot, stackTrace }) => {
        const mock = jest.fn();
        jest.mock(
          'react-native',
          () => ({
            NativeModules: {
              EmbraceManager: {
                logMessageWithSeverityAndProperties: mock,
              },
            },
          }),
          { virtual: true }
        );
        const embrace = require('../index');
        embrace.generateStackTrace = () => (severity === INFO ? '' : mockSt);
        embrace.logMessage(message, severity, properties);
        expect(mock).toBeCalledWith(message, severity, properties, stackTrace);
      }
    );
  });

  test('logInfo', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { logInfo } = require('../index');
    logInfo('test message');
    expect(mock).toBeCalledWith(`test message`, INFO, undefined, '');
  });

  test('logWarning', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { logWarning } = require('../index');
    logWarning('test message');
    expect(mock).toBeCalledWith(
      `test message`,
      WARNING,
      undefined,
      expect.any(String)
    );
  });

  test('logError', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { logError } = require('../index');
    logError('test message');
    expect(mock).toBeCalledWith(
      `test message`,
      ERROR,
      undefined,
      expect.any(String)
    );
  });
});

describe('Log handled Error Tests', () => {
  test.each`
    message           | properties   | out
    ${'not an error'} | ${undefined} | ${{}}
    ${testError}      | ${undefined} | ${{ message: testError.message, stack: testError.stack }}
    ${testError}      | ${testProps} | ${{ message: testError.message, stack: testError.stack, properties: testProps }}
  `('logHandledError', ({ message, out, properties }) => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logHandledError: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { logHandledError } = require('../index');
    logHandledError(message, properties);
    if (message instanceof Error) {
      expect(mock).toBeCalledWith(out.message, out.stack, out.properties);
    } else {
      expect(mock).not.toBeCalled();
    }
  });
});

describe('Personas Tests', () => {
  test('addUserPersona', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            addUserPersona: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { addUserPersona } = require('../index');
    addUserPersona(testPersona);
    expect(mock).toBeCalledWith(testPersona);
  });

  test('clearUserPersona', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserPersona: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { clearUserPersona } = require('../index');
    clearUserPersona(testPersona);
    expect(mock).toBeCalledWith(testPersona);
  });

  test('clearAllUserPersonas', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearAllUserPersonas: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { clearAllUserPersonas } = require('../index');
    clearAllUserPersonas();
    expect(mock).toBeCalled();
  });
});

describe('Custom Views Tests', () => {
  test('startView', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { startView } = require('../index');
    startView(testView);
    expect(mock).toBeCalledWith(testView);
  });

  test('endView', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            endView: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { endView } = require('../index');
    endView(testView);
    expect(mock).toBeCalledWith(testView);
  });
});

describe('Session Properties Tests', () => {
  test('getSessionProperties', () => {
    const mock = jest.fn(() => Promise.resolve({ key: 'value' }));
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            getSessionProperties: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { getSessionProperties } = require('../index');
    getSessionProperties().then((prop: any) =>
      expect(prop).toBe({ key: 'value' })
    );
  });

  test('should call addSessionProperty with values ', () => {
    const mock = jest.fn(() => Promise.resolve(true));
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            addSessionProperty: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { addSessionProperty } = require('../index');
    addSessionProperty(testKey, testValue, testPermanent);
    expect(mock).toBeCalledWith(testKey, testValue, testPermanent);
  });

  test('addSessionProperty should return success', () => {
    const mock = jest.fn(() => Promise.resolve(true));
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            addSessionProperty: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { addSessionProperty } = require('../index');
    addSessionProperty(testKey, testValue, testPermanent).then(
      (success: boolean) => expect(success).toBeTruthy()
    );
  });

  test('removeSessionProperty', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            removeSessionProperty: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { removeSessionProperty } = require('../index');
    removeSessionProperty(testKey);
    expect(mock).toBeCalledWith(testKey);
  });
});

describe('endSession', () => {
  test('endSession default', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            endSession: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { endSession } = require('../index');
    endSession();
    expect(mock).toBeCalledWith(false);
  });

  test('endSession with clearUserInfo', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            endSession: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { endSession } = require('../index');
    endSession(clearUserInfo);
    expect(mock).toBeCalledWith(clearUserInfo);
  });
});

describe('Start Moment', () => {
  describe('Test Start Moment', () => {
    test('start moment', () => {
      const mockWithIdentifierAndProperties = jest.fn();
      const mockWithIdentifierWithoutProperties = jest.fn();
      const mockWithoutIdentifierAndProperties = jest.fn();
      jest.mock('react-native', () => ({
        NativeModules: {
          EmbraceManager: {
            startMomentWithNameAndIdentifierAndProperties:
              mockWithIdentifierAndProperties,
            startMomentWithNameAndIdentifier:
              mockWithIdentifierWithoutProperties,
            startMomentWithName: mockWithoutIdentifierAndProperties,
          },
        },
      }));
      const { startMoment } = require('../index');

      startMoment(testValue, 'identifier', {});
      startMoment(testValue, 'identifier');
      startMoment(testValue, undefined, {});
      startMoment(testValue);
      expect(mockWithIdentifierAndProperties).toBeCalledTimes(2);
      expect(mockWithIdentifierWithoutProperties).toBeCalled();
      expect(mockWithoutIdentifierAndProperties).toBeCalled();
    });

    test('start moment without name', () => {
      const mockWithIdentifierAndProperties = jest.fn();
      const mockWithIdentifierWithoutProperties = jest.fn();
      const mockWithoutIdentifierAndProperties = jest.fn();
      jest.mock('react-native', () => ({
        NativeModules: {
          EmbraceManager: {
            startMomentWithNameAndIdentifierAndProperties:
              mockWithIdentifierAndProperties,
            startMomentWithNameAndIdentifier:
              mockWithIdentifierWithoutProperties,
            startMomentWithName: mockWithoutIdentifierAndProperties,
          },
        },
      }));
      const { startMoment } = require('../index');

      startMoment(undefined, 'identifier', {});
      startMoment(undefined, 'identifier');
      startMoment(undefined, undefined, {});
      startMoment(undefined);

      expect(mockWithIdentifierAndProperties).toBeCalledTimes(0);
      expect(mockWithIdentifierWithoutProperties).toBeCalledTimes(0);
      expect(mockWithoutIdentifierAndProperties).toBeCalledTimes(0);
    });
  });
});

describe('endMoment', () => {
  test.each`
    name         | identifier    | properties
    ${testValue} | ${null}       | ${null}
    ${testValue} | ${testUserId} | ${null}
    ${testValue} | ${null}       | ${testProps}
    ${testValue} | ${testUserId} | ${testProps}
  `('endMomentWithName', ({ name, identifier, properties }) => {
    const mock = jest.fn();

    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            endMomentWithName: mock,
            endMomentWithNameAndIdentifier: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { endMoment } = require('../index');
    endMoment(name, identifier, properties);
    if (identifier) {
      expect(mock).toBeCalledWith(name, identifier, properties);
    } else {
      expect(mock).toBeCalledWith(name, properties);
    }
  });
});

describe('Payers Test', () => {
  test('setUserAsPayer', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserAsPayer: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { setUserAsPayer } = require('../index');
    setUserAsPayer();
    expect(mock).toBeCalled();
  });
  test('clearUserAsPayer', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserAsPayer: mock,
          },
        },
      }),
      { virtual: true }
    );
    const { clearUserAsPayer } = require('../index');
    clearUserAsPayer();
    expect(mock).toBeCalled();
  });
});

describe('JavaScript bundle', () => {
  test('setJavaScriptBundlePath', () => {
    const mock = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setJavaScriptBundlePath: mock,
        },
      },
    }));
    const { setJavaScriptBundlePath } = require('../index');
    const path = 'path/to/bundle.bundle';

    setJavaScriptBundlePath(path);
    expect(mock).toBeCalledWith(path);
  });
});

describe('Log network call', () => {
  test('recordNetworkRequest', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { recordNetworkRequest } = require('../index');
    const url = 'https://httpbin.org/get';
    const method = 'get';
    const nowdate = new Date();
    const st = nowdate.getTime();
    const et = nowdate.setUTCSeconds(30);
    const bytesIn = Number(111);
    const bytesOut = Number(222);
    const networkStatus = Number(200);
    const error = null;

    recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      error
    );

    expect(mock).toBeCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      error
    );
  });
});

describe('Record network call', () => {
  const url = 'https://httpbin.org/get';
  const method = 'get';
  const nowdate = new Date();
  const st = nowdate.getTime();
  const et = nowdate.setUTCSeconds(30);
  const bytesIn = Number(111);
  const bytesOut = Number(222);
  const networkStatus = Number(200);
  const error = 'error';

  test('record completed network request', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      { virtual: false }
    );

    const { recordNetworkRequest } = require('../index');
    recordNetworkRequest(url, method, st, et, bytesIn, bytesOut, networkStatus);

    expect(mock).toBeCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      undefined
    );
  });

  test('record incomplete network request', () => {
    const mock = jest.fn();
    jest.mock(
      'react-native',
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      { virtual: true }
    );

    const { recordNetworkRequest } = require('../index');
    recordNetworkRequest(url, method, st, et, error);

    expect(mock).toBeCalledWith(url, method, st, et, error, -1, -1, undefined);
  });
});

describe('Test Device Stuffs', () => {
  test('test device Id', () => {
    const mock = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          getDeviceId: mock,
        },
      },
    }));
    const { getDeviceId } = require('../index');
    getDeviceId();
    expect(mock).toBeCalled();
  });
  test('test session Id', () => {
    const mock = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          getCurrentSessionId: mock,
        },
      },
    }));
    const { getCurrentSessionId } = require('../index');
    getCurrentSessionId();
    expect(mock).toBeCalled();
  });
});

describe('Last Session Info', () => {
  test('Test last run status - CRASH', async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve('CRASH'));
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const { getLastRunEndState } = require('../index');
    expect(await getLastRunEndState()).toBe('CRASH');
  });
  test('Test last run status - CLEAN_EXIT', async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve('CLEAN_EXIT'));
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const { getLastRunEndState } = require('../index');
    expect(await getLastRunEndState()).toBe('CLEAN_EXIT');
  });
  test('Test last run status - INVALID', async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve('INVALID'));
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const { getLastRunEndState } = require('../index');
    expect(await getLastRunEndState()).toBe('INVALID');
  });
});

describe('Test OTA Stuffs', () => {
  test('test set javascript patch number', () => {
    const mock = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setJavaScriptPatchNumber: mock,
        },
      },
    }));
    const { setJavaScriptPatch } = require('../index');
    setJavaScriptPatch();
    expect(mock).toBeCalled();
  });
});

describe('Test testing purpose functions', () => {
  test('get stack trace', () => {
    const { generateStackTrace } = require('../index');
    expect(generateStackTrace()).toContain('Error:');
  });
});

describe('Test initialize', () => {
  test('initialize', () => {
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    const mockSetReactNativeSDKVersion = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: mockSetReactNativeVersion,
          setJavaScriptPatchNumber: mockSetJavaScriptPatchNumber,
          setReactNativeSDKVersion: mockSetReactNativeSDKVersion,
          isStarted: () => true,
        },
      },
    }));

    const { initialize } = require('../index');

    const result = initialize({ patch: testValue });

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mockSetReactNativeVersion).toBeCalled();
      expect(mockSetJavaScriptPatchNumber).toBeCalled();
      expect(mockSetReactNativeSDKVersion).toBeCalled();
    });
  });

  test('applying previousHandler', () => {
    const previousHandler = jest.fn();
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    const mockSetReactNativeSDKVersion = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: mockSetReactNativeVersion,
          setJavaScriptPatchNumber: mockSetJavaScriptPatchNumber,
          setReactNativeSDKVersion: mockSetReactNativeSDKVersion,
          isStarted: () => true,
        },
      },
    }));
    ErrorUtils.getGlobalHandler = previousHandler;
    const { initialize } = require('../index');
    const result = initialize({ patch: testValue });
    const handleError = () => {};
    const generatedGlobalErrorFunc = handleGlobalError(
      previousHandler,
      handleError
    );
    generatedGlobalErrorFunc(Error('Test'));

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(previousHandler).toBeCalled();
      expect(mockSetReactNativeVersion).toBeCalled();
      expect(mockSetJavaScriptPatchNumber).toBeCalled();
      expect(mockSetReactNativeSDKVersion).toBeCalled();
    });
  });

  test('store embrace sdk version', () => {
    const mocksetReactNativeSDKVersion = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: jest.fn(),
          setReactNativeSDKVersion: mocksetReactNativeSDKVersion,
          isStarted: () => true,
        },
      },
    }));
    const { initialize } = require('../index');

    const result = initialize();

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mocksetReactNativeSDKVersion).toBeCalled();
    });
  });

  test('applying Tracking', () => {
    interface ITracking {
      onUnhandled: (_: any, error: Error) => {};
    }

    jest.mock('promise/setimmediate/rejection-tracking', () => ({
      enable: (c: ITracking) => {
        const { onUnhandled } = c;
        onUnhandled('e', new Error());
      },
    }));

    const mockLogMessageWithSeverityAndProperties = jest.fn();
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: mockSetReactNativeVersion,
          setJavaScriptPatchNumber: mockSetJavaScriptPatchNumber,
          logMessageWithSeverityAndProperties:
            mockLogMessageWithSeverityAndProperties,
          setReactNativeSDKVersion: jest.fn(),
          isStarted: () => true,
        },
      },
    }));

    const { initialize } = require('../index');

    const result = initialize({ patch: testValue });

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mockLogMessageWithSeverityAndProperties).toBeCalled();
    });
  });
});
