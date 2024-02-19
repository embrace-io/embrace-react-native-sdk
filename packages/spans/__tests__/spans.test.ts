jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

describe('Test Spans - Start', () => {
  test('Create Span - With Name', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockNativePromise,
        },
      },
    }));

    const { startSpanWithName } = require('../src/index');
    startSpanWithName('Hey');
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });
  test('Create Span - Without Name', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockNativePromise,
        },
      },
    }));
    const { startSpanWithName } = require('../src/index');
    const result = startSpanWithName('');
    const result2 = startSpanWithName(undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });

  test('Create Span - Without Name', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockNativePromise,
        },
      },
    }));
    const { startSpanWithName } = require('../src/index');
    startSpanWithName(undefined);
    jest.runAllTimers();

    expect(mockNativePromise).toBeCalledTimes(0);
  });
});

describe('Test Spans - Stop', () => {
  test('Stop Span - With spanId', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          stopSpanWithId: mockNativePromise,
        },
      },
    }));

    const { stopSpanWithId } = require('../src/index');
    stopSpanWithId('Hey');
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });
  test('Stop Span - Without spanId', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          stopSpanWithId: mockNativePromise,
        },
      },
    }));
    const { stopSpanWithId } = require('../src/index');
    const result = stopSpanWithId('');
    const result2 = stopSpanWithId(undefined);

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });
});

describe('Test Spans - Add Event', () => {
  test('Add Event To Span - With spanId - With Name', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpanId: mockNativePromise,
        },
      },
    }));

    const { addSpanEventToSpanId } = require('../src/index');
    addSpanEventToSpanId('Hey', 'name');
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });
  test('Add Event To Span - With spanId - With Name - With time', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpanId: mockNativePromise,
        },
      },
    }));

    const { addSpanEventToSpanId } = require('../src/index');
    addSpanEventToSpanId('Hey', 'name', 123);
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });
  test('Add Event To Span - With spanId - With Name - With time - With Attribute', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpanId: mockNativePromise,
        },
      },
    }));

    const { addSpanEventToSpanId } = require('../src/index');
    addSpanEventToSpanId('Hey', 'name', 123, { at1: '123' });
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });
  test('Add Event To Span - Without spanId', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpanId: mockNativePromise,
        },
      },
    }));
    const { addSpanEventToSpanId } = require('../src/index');
    const result = addSpanEventToSpanId('', 'name');
    const result2 = addSpanEventToSpanId(undefined, 'name');

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });

  test('Add Event To Span - Without Name', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanEventToSpanId: mockNativePromise,
        },
      },
    }));
    const { addSpanEventToSpanId } = require('../src/index');
    const result = addSpanEventToSpanId('SpanId', '');

    expect(result).resolves.toBe(false);
    expect(mockNativePromise).toBeCalledTimes(0);
  });
});

describe('Test Spans - Add Attribute', () => {
  test('Add Attribute To Span - With spanId - With Key - With Value', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributesToSpanId: mockNativePromise,
        },
      },
    }));

    const { addSpanAttributesToSpanId } = require('../src/index');
    addSpanAttributesToSpanId('Hey', 'key', 'value');
    expect(mockNativePromiseResolved).toBeCalledTimes(1);
  });

  test('Add Attribute To Span - Without spanId', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributesToSpanId: mockNativePromise,
        },
      },
    }));
    const { addSpanAttributesToSpanId } = require('../src/index');
    const result = addSpanAttributesToSpanId('', 'key', 'value');
    const result2 = addSpanAttributesToSpanId(undefined, 'key', 'value');

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });

  test('Add Attribute To Span - Without Key', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributesToSpanId: mockNativePromise,
        },
      },
    }));
    const { addSpanAttributesToSpanId } = require('../src/index');
    const result = addSpanAttributesToSpanId('SpanId', '', 'value');
    const result2 = addSpanAttributesToSpanId('SpanId', undefined, 'value');

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });

  test('Add Attribute To Span - Without Value', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          addSpanAttributesToSpanId: mockNativePromise,
        },
      },
    }));
    const { addSpanAttributesToSpanId } = require('../src/index');
    const result = addSpanAttributesToSpanId('SpanId', 'key', '');
    const result2 = addSpanAttributesToSpanId('SpanId', 'key', undefined);

    expect(result).resolves.toBe(false);
    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });
});

describe('Test Spans - Record Span With Function', () => {
  test('Record Span With Function - Without Name / does not exist', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(undefined);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockedFunction);
    recordSpanWithName(undefined, mockedFunction);
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(2);
    expect(mockStopSpanWithId).toBeCalledTimes(0);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(0);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });
  test('Record Span With Function - With Name', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockCallback = new Promise((res) => {
      mockedFunction();
      res(true);
    });
    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockCallback);
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(0);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });
  test('Record Span With Function - With Name', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockedFunction);
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(0);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });

  test('Record Span With Function - With Name', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();
    const mockCallback = () => {
      mockedFunction();
      throw Error('Should fail');
    };

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    try {
      recordSpanWithName('Hey', mockCallback);
      jest.runAllTicks();
    } catch (e) {}

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(0);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });

  test('Record Span With Function - With Name - Attributes', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockedFunction, {
      val1: 'value',
    });
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(1);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });

  test('Record Span With Function - With Name - Attribute Event', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName(
      'Hey',
      mockedFunction,
      {
        val1: 'value',
      },
      [{ name: 'name', timestampNanos: 123, attributes: { val1: 'val1' } }]
    );
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(1);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(1);
  });

  test('Record Span With Function - With Name - Attributes x 2', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockedFunction, {
      val1: 'value',
      val2: 'value',
    });
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(2);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(0);
  });

  test('Record Span With Function - With Name - Attributes Events x 2', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName(
      'Hey',
      mockedFunction,
      {
        val1: 'value',
        val2: 'value',
      },
      [
        {
          name: 'name',
          timestampNanos: 123,
          attributes: { val1: 'val1', val2: 'val2' },
        },
        {
          name: 'name2',
          timestampNanos: 1234,
          attributes: { val1: 'val1', val2: 'val2' },
        },
      ]
    );
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(2);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(2);
  });

  test('Record Span With Function - With Name - Event', () => {
    const mockAddSpanAttributesToSpanId = jest.fn();
    const mockAddSpanEventToSpanId = jest.fn();
    const mockStopSpanWithId = jest.fn();
    const mockedFunction = jest.fn();

    const mockStartSpanWithName = () =>
      new Promise((res) => {
        res(123);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          startSpanWithName: mockStartSpanWithName,
          addSpanAttributesToSpanId: mockAddSpanAttributesToSpanId,
          addSpanEventToSpanId: mockAddSpanEventToSpanId,
          stopSpanWithId: mockStopSpanWithId,
        },
      },
    }));

    const { recordSpanWithName } = require('../src/index');
    recordSpanWithName('Hey', mockedFunction, undefined, [
      { name: 'name', timestampNanos: 123, attributes: { val1: 'val1' } },
    ]);
    jest.runAllTicks();

    expect(mockedFunction).toBeCalledTimes(1);
    expect(mockStopSpanWithId).toBeCalledTimes(1);

    expect(mockAddSpanAttributesToSpanId).toBeCalledTimes(0);
    expect(mockAddSpanEventToSpanId).toBeCalledTimes(1);
  });
});

describe('Test Spans - Record Completed', () => {
  test('Record Completed Span - With Name', () => {
    const mockNativePromiseResolved = jest.fn();
    const mockNativePromise = () =>
      new Promise((res) => {
        mockNativePromiseResolved();
        res(true);
      });

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));

    const { recordCompletedSpanWithName } = require('../src/index');
    recordCompletedSpanWithName('Hey');
    expect(mockNativePromiseResolved).toBeCalledTimes(0);
  });
  test('Record Completed Span - Without Name', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));
    const { recordCompletedSpanWithName } = require('../src/index');
    const result = recordCompletedSpanWithName('');
    const result2 = recordCompletedSpanWithName(undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });
  test('Record Completed Span - With Name - Without startTimeNanos', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));
    const { recordCompletedSpanWithName } = require('../src/index');
    const result = recordCompletedSpanWithName('name', '');
    const result2 = recordCompletedSpanWithName('name', undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });
  test('Record Completed Span - With Name - With startTimeNanos - Without endTimeNanos', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));
    const { recordCompletedSpanWithName } = require('../src/index');
    const result = recordCompletedSpanWithName('name', 123, '');
    const result2 = recordCompletedSpanWithName('name', 123, undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });
  test('Record Completed Span - Without Name - With startTimeNanos - Without endTimeNanos', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));
    const { recordCompletedSpanWithName } = require('../src/index');
    const result = recordCompletedSpanWithName('', 123, '');
    const result2 = recordCompletedSpanWithName('name', 123, undefined);

    expect(result).resolves.toBe(false);

    expect(result2).resolves.toBe(false);

    expect(mockNativePromise).toBeCalledTimes(0);
  });

  test('Record Completed Span - With Name - With startTimeNanos - With endTimeNanos', () => {
    const mockNativePromise = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          recordCompletedSpanWithName: mockNativePromise,
        },
      },
    }));
    const { recordCompletedSpanWithName } = require('../src/index');
    recordCompletedSpanWithName('name', 123, 123);

    expect(mockNativePromise).toBeCalledTimes(1);
  });
});
