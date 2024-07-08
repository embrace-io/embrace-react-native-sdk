jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe("Test Spans - Start", () => {
  test("Create Span - With Name", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockNativePromise,
        },
      },
    }));

    const {startSpan} = require("../src/index");
    startSpan("Hey");
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });

  test("Create Span - Undefined", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: undefined,
        },
      },
    }));

    const {startSpan} = require("../src/index");
    const result = startSpan("Hey");
    expect(result).resolves.toBe(false);
  });
  test("Create Span - Without Name", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockNativePromise,
        },
      },
    }));
    const {startSpan} = require("../src/index");
    const result = startSpan("");
    const result2 = startSpan(undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });

  test("Create Span - Without Name", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockNativePromise,
        },
      },
    }));
    const {startSpan} = require("../src/index");
    startSpan(undefined);
    jest.runAllTimers();

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
});

describe("Test Spans - Stop", () => {
  test("Stop Span - With spanId", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          stopSpan: mockNativePromise,
        },
      },
    }));

    const {stopSpan} = require("../src/index");
    stopSpan("Hey");
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });
  test("Stop Span - Without spanId", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          stopSpan: mockNativePromise,
        },
      },
    }));
    const {stopSpan} = require("../src/index");
    const result = stopSpan("");
    const result2 = stopSpan(undefined);

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
  test("Stop Span - Undefined", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          stopSpan: undefined,
        },
      },
    }));
    const {stopSpan} = require("../src/index");
    const result = stopSpan("id");
    expect(result).resolves.toBe(false);
  });
});

describe("Test Spans - Add Event", () => {
  test("Add Event To Span - With spanId - With Name - Time", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: mockNativePromise,
        },
      },
    }));

    const {addSpanEventToSpan} = require("../src/index");
    addSpanEventToSpan("Hey", "name", new Date().getTime());
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });
  test("Add Event To Span - Undefined", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: undefined,
        },
      },
    }));

    const {addSpanEventToSpan} = require("../src/index");
    const result = addSpanEventToSpan("Hey", "name");
    expect(result).resolves.toBe(false);
  });
  test("Add Event To Span - With spanId - With Name - With time", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: mockNativePromise,
        },
      },
    }));

    const {addSpanEventToSpan} = require("../src/index");
    addSpanEventToSpan("Hey", "name", 123);
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });
  test("Add Event To Span - With spanId - With Name - With time - With Attribute", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: mockNativePromise,
        },
      },
    }));

    const {addSpanEventToSpan} = require("../src/index");
    addSpanEventToSpan("Hey", "name", 123, {at1: "123"});
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });
  test("Add Event To Span - Without spanId", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: mockNativePromise,
        },
      },
    }));
    const {addSpanEventToSpan} = require("../src/index");
    const result = addSpanEventToSpan("", "name");
    const result2 = addSpanEventToSpan(undefined, "name");

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });

  test("Add Event To Span - Without Name", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpan: mockNativePromise,
        },
      },
    }));
    const {addSpanEventToSpan} = require("../src/index");
    const result = addSpanEventToSpan("SpanId", "");

    expect(result).resolves.toBe(false);
    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
});

describe("Test Spans - Add Attribute", () => {
  test("Add Attribute To Span - With spanId - With Key - With Value", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributeToSpan: mockNativePromise,
        },
      },
    }));

    const {addSpanAttributeToSpan} = require("../src/index");
    addSpanAttributeToSpan("Hey", "key", "value");
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(1);
  });

  test("Add Attribute To Span - Without native SDK", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributeToSpan: undefined,
        },
      },
    }));
    const {addSpanAttributeToSpan} = require("../src/index");
    const result = addSpanAttributeToSpan("Hey", "key", "value");

    expect(result).resolves.toBe(false);
  });

  test("Add Attribute To Span - Without spanId", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributeToSpan: mockNativePromise,
        },
      },
    }));
    const {addSpanAttributeToSpan} = require("../src/index");
    const result = addSpanAttributeToSpan("", "key", "value");
    const result2 = addSpanAttributeToSpan(undefined, "key", "value");

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });

  test("Add Attribute To Span - Without Key", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributeToSpan: mockNativePromise,
        },
      },
    }));
    const {addSpanAttributeToSpan} = require("../src/index");
    const result = addSpanAttributeToSpan("SpanId", "", "value");
    const result2 = addSpanAttributeToSpan("SpanId", undefined, "value");

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });

  test("Add Attribute To Span - Without Value", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributeToSpan: mockNativePromise,
        },
      },
    }));
    const {addSpanAttributeToSpan} = require("../src/index");
    const result = addSpanAttributeToSpan("SpanId", "key", "");
    const result2 = addSpanAttributeToSpan("SpanId", "key", undefined);

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
});

describe("Test Spans - Record Span With Function", () => {
  test("Record Span With Function - Without Name / does not exist", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(undefined);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockedFunction);
    recordSpan(undefined, mockedFunction);
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(2);
    expect(mockstopSpan).toHaveBeenCalledTimes(0);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });

  test("Record Span With Function - With Name", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockCallback = new Promise(res => {
      mockedFunction();
      res(true);
    });
    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockCallback);
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });
  test("Record Span With Function - With Name", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockedFunction);
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });

  test("Record Span With Function - With Name", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();
    const mockCallback = () => {
      mockedFunction();
      throw Error("Should fail");
    };

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    try {
      recordSpan("Hey", mockCallback);
      jest.runAllTicks();
    } catch (e) {}

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });

  test("Record Span With Function - With Name - Attributes", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockedFunction, {
      val1: "value",
    });
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(1);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });
  test("Record Span With Function - undefined", () => {
    const mockedFunction = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: undefined,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    const result = recordSpan("Hey", mockedFunction);

    expect(result).resolves.toBe(false);
  });
  test("Record Span With Function - With Name - Attribute Event", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan(
      "Hey",
      mockedFunction,
      {
        val1: "value",
      },
      [{name: "name", timestampNanos: 123, attributes: {val1: "val1"}}],
    );
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(1);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(1);
  });

  test("Record Span With Function - With Name - Attributes x 2", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockedFunction, {
      val1: "value",
      val2: "value",
    });
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(2);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(0);
  });

  test("Record Span With Function - With Name - Attributes Events x 2", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan(
      "Hey",
      mockedFunction,
      {
        val1: "value",
        val2: "value",
      },
      [
        {
          name: "name",
          timestampNanos: 123,
          attributes: {val1: "val1", val2: "val2"},
        },
        {
          name: "name2",
          timestampNanos: 1234,
          attributes: {val1: "val1", val2: "val2"},
        },
      ],
    );
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(2);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(2);
  });

  test("Record Span With Function - With Name - Event", () => {
    const mockaddSpanAttributeToSpan = jest.fn();
    const mockaddSpanEventToSpan = jest.fn();
    const mockstopSpan = jest.fn();
    const mockedFunction = jest.fn();

    const mockstartSpan = () =>
      new Promise(res => {
        res(123);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          startSpan: mockstartSpan,
          addSpanAttributeToSpan: mockaddSpanAttributeToSpan,
          addSpanEventToSpan: mockaddSpanEventToSpan,
          stopSpan: mockstopSpan,
        },
      },
    }));

    const {recordSpan} = require("../src/index");
    recordSpan("Hey", mockedFunction, undefined, [
      {name: "name", timestampNanos: 123, attributes: {val1: "val1"}},
    ]);
    jest.runAllTicks();

    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockstopSpan).toHaveBeenCalledTimes(1);

    expect(mockaddSpanAttributeToSpan).toHaveBeenCalledTimes(0);
    expect(mockaddSpanEventToSpan).toHaveBeenCalledTimes(1);
  });
});

describe("Test Spans - Record Completed", () => {
  test("Record Completed Span - With Name", () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise(res => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));

    const {recordCompletedSpan} = require("../src/index");
    recordCompletedSpan("Hey");
    expect(mockNativePromiseResolved).toHaveBeenCalledTimes(0);
  });
  test("Record Completed Span - undefined", () => {
    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: undefined,
        },
      },
    }));

    const {recordCompletedSpan} = require("../src/index");
    const result = recordCompletedSpan("Hey", 123, 123);
    expect(result).resolves.toBe(false);
  });
  test("Record Completed Span - Without Name", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");
    const result = recordCompletedSpan("");
    const result2 = recordCompletedSpan(undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
  test("Record Completed Span - With Name - Without startTimeNanos", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");
    const result = recordCompletedSpan("name", "");
    const result2 = recordCompletedSpan("name", undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
  test("Record Completed Span - With Name - With startTimeNanos - Without endTimeNanos", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");
    const result = recordCompletedSpan("name", 123, "");
    const result2 = recordCompletedSpan("name", 123, undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });
  test("Record Completed Span - Without Name - With startTimeNanos - Without endTimeNanos", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");
    const result = recordCompletedSpan("", 123, "");
    const result2 = recordCompletedSpan("name", 123, undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toHaveBeenCalledTimes(0);
  });

  test("Record Completed Span - With Name - With startTimeNanos - With endTimeNanos", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");
    recordCompletedSpan("name", 123, 123);

    expect(mockNativePromise).toHaveBeenCalledTimes(1);
  });

  test("Record Completed Span - With Name - With startTimeNanos - With endTimeNanos", () => {
    const mockNativePromise = jest.fn();

    jest.mock("react-native", () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpan: mockNativePromise,
        },
      },
    }));
    const {recordCompletedSpan} = require("../src/index");

    recordCompletedSpan("name", 123, 123, "None", undefined, undefined, [
      {
        name: "name",
        timestampNanos: 123,
        attributes: {val1: "val1", val2: "val2"},
      },
      {
        name: "name2",
        timestampNanos: 1234,
        attributes: {val1: "val1", val2: "val2"},
      },
    ]);

    expect(mockNativePromise).toHaveBeenCalledTimes(1);
  });
});
