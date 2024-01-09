import { IWebViewMessageParams } from '../interfaces/WebViewInterfaces';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks().resetModules();
});

const data = {
  vt: [
    {
      key: 'EMBRACE_METRIC',
    },
  ],
};

const paramsToLog: IWebViewMessageParams = {
  nativeEvent: { data: JSON.stringify(data) },
};
const paramsToNotLog: IWebViewMessageParams = {
  nativeEvent: { data: '' },
};
const paramsToNotLogWrongFormed = {
  nativeEventNot: { data: '' },
};
describe('Test WebView Tracker', () => {
  test('Project without React Native', () => {
    jest.mock('react-native', () => ({
      NativeModules: undefined,
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToLog);
    expect(result).toEqual(false);
  });
  test('Project without Embrace SDK', () => {
    jest.mock('react-native', () => ({
      NativeModules: { EmbraceManager: undefined },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToLog);
    expect(result).toEqual(false);
  });
  test('Project with old Embrace SDK', () => {
    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: undefined,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToLog);
    expect(result).toEqual(false);
  });
  test('Message was not provided', () => {
    const mockLogWebViewData = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: mockLogWebViewData,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView');
    expect(result).toEqual(false);
    expect(mockLogWebViewData).toBeCalledTimes(0);
  });
  test('Should Log - Without tag', () => {
    const mockLogWebViewData = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: mockLogWebViewData,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');
    const result = logEmbraceWebView(undefined, paramsToLog);
    expect(result).toEqual(true);
    expect(mockLogWebViewData).toBeCalledTimes(1);
  });
  test('Should Log', () => {
    const mockLogWebViewData = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: mockLogWebViewData,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToLog);
    expect(result).toEqual(true);
    expect(mockLogWebViewData).toBeCalledTimes(1);
  });
  test('Should not Log - Message not well formed', () => {
    const mockLogWebViewData = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: mockLogWebViewData,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToNotLogWrongFormed);
    expect(result).toEqual(false);
    expect(mockLogWebViewData).toBeCalledTimes(0);
  });
  test('Should not Log - No Embrace Event', () => {
    const mockLogWebViewData = jest.fn();

    jest.mock('react-native', () => ({
      NativeModules: {
        EmbraceManager: {
          trackWebViewPerformance: mockLogWebViewData,
        },
      },
    }));
    const { logEmbraceWebView } = require('../src/index');

    const result = logEmbraceWebView('MyWebView', paramsToNotLog);
    expect(result).toEqual(false);
    expect(mockLogWebViewData).toBeCalledTimes(0);
  });
});
