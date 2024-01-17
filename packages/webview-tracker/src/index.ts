import { NativeModules } from 'react-native';
import { IWebViewMessageParams } from '../interfaces/WebViewInterfaces';

const DEFAULT_WEBVIEW_TAG = 'Main';

const validateDependencies = (message: IWebViewMessageParams) => {
  if (!NativeModules) {
    console.warn(
      `[Embrace] This plugin only can be use in React Native Projects.`
    );
    return false;
  } else if (!NativeModules.EmbraceManager) {
    console.warn(
      '[Embrace] You must have the Embrace SDK to Web View events, run `yarn add @embrace-io/react-native`.'
    );
    return false;
  } else if (!NativeModules.EmbraceManager.trackWebViewPerformance) {
    console.warn(
      '[Embrace] The Embrace SDK installed needs to be updated, run `yarn add @embrace-io/react-native`.'
    );
    return false;
  } else if (!message || !message.nativeEvent) {
    console.warn(
      `[Embrace] The message is not supported. WebView tracker was not applied.`
    );
    return false;
  }
  return true;
};

/**
 * This method takes the events that were dispatched to a WebView component from a webpage
 * @param tag indentifies the WebView
 * @param message this message is given by onMessage prop in the WebView
 */
export const logEmbraceWebView = (
  tag: string = DEFAULT_WEBVIEW_TAG,
  message: IWebViewMessageParams
) => {
  if (!validateDependencies(message)) {
    return false;
  }

  try {
    if (message.nativeEvent.data) {
      const dataParsed = JSON.parse(message.nativeEvent.data).vt;
      if (
        typeof dataParsed === 'object' &&
        typeof dataParsed.find === 'function'
      ) {
        const EMBRACE_KEY = 'EMBRACE_METRIC';
        const hasEmbraceKey = dataParsed.find(
          (element: { key: string }) => element.key === EMBRACE_KEY
        );
        if (!!hasEmbraceKey) {
          NativeModules.EmbraceManager.trackWebViewPerformance(
            tag,
            message.nativeEvent.data
          );
          return true;
        }
      }
    }
  } catch (e) {
    // I won't show anything because if this fails for some reason
    // is not our data object
  }
  return false;
};
