import {handleGlobalError} from "../utils/ErrorUtil";

const testView = "View";
const testPersona = "Persona";
const testUserId = "Lucia";
const testEmail = "lucia@nimble.la";
const testKey = "Key";
const testValue = "Value";
const testPermanent = false;
const testProps = {testKey: testValue};
const testMessage = "message";
const testError = new Error();
const clearUserInfo = true;
const {INFO, ERROR, WARNING} = require("../index");

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

test("endAppStartup", async () => {
  const mock = jest.fn();
  jest.mock("react-native", () => ({
    NativeModules: {
      EmbraceManager: {
        endAppStartup: mock,
      },
    },
  }));
  const {endAppStartup} = require("../index");
  await endAppStartup();
  expect(mock).toHaveBeenCalled();
});

test("endAppStartupWithProperties", async () => {
  const mock = jest.fn();
  jest.mock(
    "react-native",
    () => ({
      NativeModules: {
        EmbraceManager: {
          endAppStartupWithProperties: mock,
        },
      },
    }),
    {virtual: true},
  );
  const {endAppStartup} = require("../index");
  await endAppStartup(testProps);
  expect(mock).toHaveBeenCalledWith(testProps);
});

describe("User Identifier Tests", () => {
  test("setUserIdentifier", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserIdentifier: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {setUserIdentifier} = require("../index");
    await setUserIdentifier(testUserId);
    expect(mock).toHaveBeenCalledWith(testUserId);
  });

  test("clearUserIdentifier", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserIdentifier: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {clearUserIdentifier} = require("../index");
    await clearUserIdentifier();
    expect(mock).toHaveBeenCalled();
  });
});

describe("User Data Tests", () => {
  test("setUsername", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUsername: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {setUsername} = require("../index");
    await setUsername(testUserId);
    expect(mock).toHaveBeenCalledWith(testUserId);
  });

  test("clearUsername", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUsername: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {clearUsername} = require("../index");
    await clearUsername();
    expect(mock).toHaveBeenCalled();
  });

  test("setUserEmail", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserEmail: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {setUserEmail} = require("../index");
    await setUserEmail(testEmail);
    expect(mock).toHaveBeenCalledWith(testEmail);
  });

  test("clearUserEmail", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserEmail: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {clearUserEmail} = require("../index");
    await clearUserEmail();
    expect(mock).toHaveBeenCalled();
  });
});

describe("Logs Test", () => {
  test("addBreadcrumb", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            addBreadcrumb: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {addBreadcrumb} = require("../index");
    await addBreadcrumb(testView);
    expect(mock).toHaveBeenCalledWith(testView);
  });

  test("logScreen", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            addBreadcrumb: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {logScreen} = require("../index");
    await logScreen(testView);
    expect(mock).toHaveBeenCalledWith(`Opening screen [${testView}]`);
  });

  describe("logMessage", () => {
    const mockSt = "this is a fake stack trace";
    test.each`
      message        | severity   | properties   | allowScreenshot | stackTrace
      ${testMessage} | ${INFO}    | ${testProps} | ${false}        | ${""}
      ${testMessage} | ${INFO}    | ${testProps} | ${true}         | ${""}
      ${testMessage} | ${WARNING} | ${testProps} | ${false}        | ${mockSt}
      ${testMessage} | ${WARNING} | ${testProps} | ${true}         | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${false}        | ${mockSt}
      ${testMessage} | ${ERROR}   | ${testProps} | ${true}         | ${mockSt}
    `(
      "should run $severity log",
      async ({message, severity, properties, allowScreenshot, stackTrace}) => {
        const mock = jest.fn();
        jest.mock(
          "react-native",
          () => ({
            NativeModules: {
              EmbraceManager: {
                logMessageWithSeverityAndProperties: mock,
              },
            },
          }),
          {virtual: true},
        );
        const embrace = require("../index");
        embrace.generateStackTrace = () => (severity === INFO ? "" : mockSt);
        await embrace.logMessage(message, severity, properties);
        expect(mock).toHaveBeenCalledWith(
          message,
          severity,
          properties,
          stackTrace,
        );
      },
    );
  });

  test("logInfo", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {logInfo} = require("../index");
    await logInfo("test message");
    expect(mock).toHaveBeenCalledWith(`test message`, INFO, undefined, "");
  });

  test("logWarning", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {logWarning} = require("../index");
    await logWarning("test message");
    expect(mock).toHaveBeenCalledWith(
      `test message`,
      WARNING,
      undefined,
      expect.any(String),
    );
  });

  test("logError", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logMessageWithSeverityAndProperties: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {logError} = require("../index");
    await logError("test message");
    expect(mock).toHaveBeenCalledWith(
      `test message`,
      ERROR,
      undefined,
      expect.any(String),
    );
  });
});

describe("Log handled Error Tests", () => {
  test.each`
    message           | properties   | out
    ${"not an error"} | ${undefined} | ${{}}
    ${testError}      | ${undefined} | ${{message: testError.message, stack: testError.stack}}
    ${testError}      | ${testProps} | ${{message: testError.message, stack: testError.stack, properties: testProps}}
  `("logHandledError", ({message, out, properties}) => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logHandledError: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {logHandledError} = require("../index");
    logHandledError(message, properties);

    jest.advanceTimersByTime(250);
    if (message instanceof Error) {
      expect(mock).toHaveBeenCalledWith(out.message, out.stack, out.properties);
    } else {
      expect(mock).not.toHaveBeenCalled();
    }
  });
});

describe("Personas Tests", () => {
  test("addUserPersona", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            addUserPersona: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {addUserPersona} = require("../index");
    await addUserPersona(testPersona);
    expect(mock).toHaveBeenCalledWith(testPersona);
  });

  test("clearUserPersona", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserPersona: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {clearUserPersona} = require("../index");
    await clearUserPersona(testPersona);
    expect(mock).toHaveBeenCalledWith(testPersona);
  });

  test("clearAllUserPersonas", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearAllUserPersonas: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {clearAllUserPersonas} = require("../index");
    await clearAllUserPersonas();
    expect(mock).toHaveBeenCalled();
  });
});

describe("Custom Views Tests", () => {
  test("startView", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            startView: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {startView} = require("../index");
    await startView(testView);
    expect(mock).toHaveBeenCalledWith(testView);
  });

  test("endView", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endView: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {endView} = require("../index");
    await endView(testView);
    expect(mock).toHaveBeenCalledWith(testView);
  });
});

describe("Session Properties Tests", () => {
  test("getSessionProperties", async () => {
    const mock = jest.fn(() => Promise.resolve({key: "value"}));
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            getSessionProperties: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {getSessionProperties} = require("../index");
    getSessionProperties().then((prop: any) =>
      expect(prop).toBe({key: "value"}),
    );
  });

  test("should call addSessionProperty with values", async () => {
    const mock = jest.fn(() => Promise.resolve(true));
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            addSessionProperty: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {addSessionProperty} = require("../index");
    await addSessionProperty(testKey, testValue, testPermanent);
    expect(mock).toHaveBeenCalledWith(testKey, testValue, testPermanent);
  });

  test("addSessionProperty should return success", async () => {
    const mock = jest.fn(() => Promise.resolve(true));
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            addSessionProperty: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {addSessionProperty} = require("../index");
    await addSessionProperty(testKey, testValue, testPermanent).then(
      (success: boolean) => expect(success).toBeTruthy(),
    );
  });

  test("removeSessionProperty", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            removeSessionProperty: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {removeSessionProperty} = require("../index");
    await removeSessionProperty(testKey);
    expect(mock).toHaveBeenCalledWith(testKey);
  });
});

describe("endSession", () => {
  test("endSession default", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endSession: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {endSession} = require("../index");
    await endSession();
    expect(mock).toHaveBeenCalledWith(false);
  });

  test("endSession with clearUserInfo", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endSession: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {endSession} = require("../index");
    await endSession(clearUserInfo);
    expect(mock).toHaveBeenCalledWith(clearUserInfo);
  });
});

describe("Start Moment", () => {
  describe("Test Start Moment", () => {
    test("start moment", async () => {
      const mockWithIdentifierAndProperties = jest.fn();
      const mockWithIdentifierWithoutProperties = jest.fn();
      const mockWithoutIdentifierAndProperties = jest.fn();
      jest.mock("react-native", () => ({
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
      const {startMoment} = require("../index");

      await startMoment(testValue, "identifier", {});
      await startMoment(testValue, "identifier");
      await startMoment(testValue, undefined, {});
      await startMoment(testValue);
      expect(mockWithIdentifierAndProperties).toHaveBeenCalledTimes(2);
      expect(mockWithIdentifierWithoutProperties).toHaveBeenCalled();
      expect(mockWithoutIdentifierAndProperties).toHaveBeenCalled();
    });

    test("start moment without name", () => {
      const mockWithIdentifierAndProperties = jest.fn();
      const mockWithIdentifierWithoutProperties = jest.fn();
      const mockWithoutIdentifierAndProperties = jest.fn();
      jest.mock("react-native", () => ({
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
      const {startMoment} = require("../index");

      startMoment(undefined, "identifier", {});
      startMoment(undefined, "identifier");
      startMoment(undefined, undefined, {});
      startMoment(undefined);

      jest.advanceTimersByTime(250);
      expect(mockWithIdentifierAndProperties).toHaveBeenCalledTimes(0);
      expect(mockWithIdentifierWithoutProperties).toHaveBeenCalledTimes(0);
      expect(mockWithoutIdentifierAndProperties).toHaveBeenCalledTimes(0);
    });
  });
});

describe("endMoment", () => {
  test.each`
    name         | identifier    | properties
    ${testValue} | ${null}       | ${null}
    ${testValue} | ${testUserId} | ${null}
    ${testValue} | ${null}       | ${testProps}
    ${testValue} | ${testUserId} | ${testProps}
  `("endMomentWithName", async ({name, identifier, properties}) => {
    const mock = jest.fn();

    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            endMomentWithName: mock,
            endMomentWithNameAndIdentifier: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {endMoment} = require("../index");
    await endMoment(name, identifier, properties);
    if (identifier) {
      expect(mock).toHaveBeenCalledWith(name, identifier, properties);
    } else {
      expect(mock).toHaveBeenCalledWith(name, properties);
    }
  });
});

describe("Payers Test", () => {
  test("setUserAsPayer", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            setUserAsPayer: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {setUserAsPayer} = require("../index");
    await setUserAsPayer();
    expect(mock).toHaveBeenCalled();
  });
  test("clearUserAsPayer", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            clearUserAsPayer: mock,
          },
        },
      }),
      {virtual: true},
    );
    const {clearUserAsPayer} = require("../index");
    await clearUserAsPayer();
    expect(mock).toHaveBeenCalled();
  });
});

describe("JavaScript bundle", () => {
  test("setJavaScriptBundlePath", async () => {
    const mock = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          setJavaScriptBundlePath: mock,
        },
      },
    }));
    const {setJavaScriptBundlePath} = require("../index");
    const path = "path/to/bundle.bundle";

    await setJavaScriptBundlePath(path);
    expect(mock).toHaveBeenCalledWith(path);
  });
});

describe("Log network call", () => {
  test("recordNetworkRequest", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {recordNetworkRequest} = require("../index");
    const url = "https://httpbin.org/get";
    const method = "get";
    const nowdate = new Date();
    const st = nowdate.getTime();
    const et = nowdate.setUTCSeconds(30);
    const bytesIn = Number(111);
    const bytesOut = Number(222);
    const networkStatus = Number(200);
    const error = null;

    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      error,
    );

    expect(mock).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      error,
    );
  });
});

describe("Record network call", () => {
  const url = "https://httpbin.org/get";
  const method = "get";
  const nowdate = new Date();
  const st = nowdate.getTime();
  const et = nowdate.setUTCSeconds(30);
  const bytesIn = Number(111);
  const bytesOut = Number(222);
  const networkStatus = Number(200);
  const error = "error";

  test("record completed network request", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      {virtual: false},
    );

    const {recordNetworkRequest} = require("../index");
    await recordNetworkRequest(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
    );

    expect(mock).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      bytesIn,
      bytesOut,
      networkStatus,
      undefined,
    );
  });

  test("record incomplete network request", async () => {
    const mock = jest.fn();
    jest.mock(
      "react-native",
      () => ({
        NativeModules: {
          EmbraceManager: {
            logNetworkRequest: mock,
          },
        },
      }),
      {virtual: true},
    );

    const {recordNetworkRequest} = require("../index");
    await recordNetworkRequest(url, method, st, et, error);

    expect(mock).toHaveBeenCalledWith(
      url,
      method,
      st,
      et,
      error,
      -1,
      -1,
      undefined,
    );
  });
});

describe("Test Device Stuffs", () => {
  test("device Id", async () => {
    const mock = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          getDeviceId: mock,
        },
      },
    }));
    const {getDeviceId} = require("../index");
    await getDeviceId();
    expect(mock).toHaveBeenCalled();
  });
  test("session Id", async () => {
    const mock = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          getCurrentSessionId: mock,
        },
      },
    }));
    const {getCurrentSessionId} = require("../index");
    await getCurrentSessionId();
    expect(mock).toHaveBeenCalled();
  });
});

describe("Last Session Info", () => {
  test("last run status - CRASH", async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve("CRASH"));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const {getLastRunEndState} = require("../index");
    expect(await getLastRunEndState()).toBe("CRASH");
  });
  test("last run status - CLEAN_EXIT", async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve("CLEAN_EXIT"));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const {getLastRunEndState} = require("../index");
    expect(await getLastRunEndState()).toBe("CLEAN_EXIT");
  });
  test("last run status - INVALID", async () => {
    const mockGetLastRunEndState = jest.fn(() => Promise.resolve("INVALID"));
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          getLastRunEndState: mockGetLastRunEndState,
        },
      },
    }));
    const {getLastRunEndState} = require("../index");
    expect(await getLastRunEndState()).toBe("INVALID");
  });
});

describe("Test OTA Stuffs", () => {
  test("set javascript patch number", async () => {
    const mock = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          setJavaScriptPatchNumber: mock,
        },
      },
    }));
    const {setJavaScriptPatch} = require("../index");
    await setJavaScriptPatch();
    expect(mock).toHaveBeenCalled();
  });
});

describe("Test testing purpose functions", () => {
  test("get stack trace", () => {
    const {generateStackTrace} = require("../index");
    expect(generateStackTrace()).toContain("Error:");
  });
});

describe("Test initialize", () => {
  test("initialize", () => {
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    const mockSetReactNativeSDKVersion = jest.fn();
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: mockSetReactNativeVersion,
          setJavaScriptPatchNumber: mockSetJavaScriptPatchNumber,
          setReactNativeSDKVersion: mockSetReactNativeSDKVersion,
          isStarted: () => true,
        },
      },
    }));

    const {initialize} = require("../index");

    const result = initialize({patch: testValue});

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mockSetReactNativeVersion).toHaveBeenCalled();
      expect(mockSetJavaScriptPatchNumber).toHaveBeenCalled();
      expect(mockSetReactNativeSDKVersion).toHaveBeenCalled();
    });
  });

  test("initialize - native not initialized", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          isStarted: () => false,
          startNativeEmbraceSDK: () => false,
        },
      },
    }));

    const {initialize} = require("../index");

    const result = initialize({patch: testValue});
    jest.runAllTicks();

    expect(result).resolves.toBe(true);
  });

  test("initialize - native initialized", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          isStarted: () => false,
          startNativeEmbraceSDK: () => true,
        },
      },
    }));

    const {initialize} = require("../index");

    const result = initialize({patch: testValue});
    jest.runAllTicks();

    expect(result).resolves.toBe(true);
  });

  test("applying previousHandler", () => {
    const previousHandler = jest.fn();
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    const mockSetReactNativeSDKVersion = jest.fn();
    jest.mock("react-native", () => ({
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
    const {initialize} = require("../index");
    const result = initialize({patch: testValue});

    const handleError = () => {};
    const generatedGlobalErrorFunc = handleGlobalError(
      previousHandler,
      handleError,
    );
    generatedGlobalErrorFunc(Error("Test"));

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(previousHandler).toHaveBeenCalled();
      expect(mockSetReactNativeVersion).toHaveBeenCalled();
      expect(mockSetJavaScriptPatchNumber).toHaveBeenCalled();
      expect(mockSetReactNativeSDKVersion).toHaveBeenCalled();
    });
  });

  test("store embrace sdk version", () => {
    const mocksetReactNativeSDKVersion = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          setReactNativeVersion: jest.fn(),
          setReactNativeSDKVersion: mocksetReactNativeSDKVersion,
          isStarted: () => true,
        },
      },
    }));
    const {initialize} = require("../index");

    const result = initialize();

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mocksetReactNativeSDKVersion).toHaveBeenCalled();
    });
  });

  test("applying Tracking", () => {
    interface ITracking {
      onUnhandled: (_: any, error: Error) => {};
    }

    jest.mock("promise/setimmediate/rejection-tracking", () => ({
      enable: (c: ITracking) => {
        const {onUnhandled} = c;
        onUnhandled("e", new Error());
      },
    }));

    const mockLogMessageWithSeverityAndProperties = jest.fn();
    const mockSetReactNativeVersion = jest.fn();
    const mockSetJavaScriptPatchNumber = jest.fn();
    jest.mock("react-native", () => ({
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

    const {initialize} = require("../index");

    const result = initialize({patch: testValue});

    expect(result).resolves.toBe(true);

    result.then(() => {
      expect(mockLogMessageWithSeverityAndProperties).toHaveBeenCalled();
    });
  });
});
