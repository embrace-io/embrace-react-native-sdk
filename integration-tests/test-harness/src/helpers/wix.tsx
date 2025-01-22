import * as React from "react";
import {Navigation} from "react-native-navigation";
import {EmbraceWixTestHarness} from "../EmbraceWixTestHarness";
import {LogTestingScreen} from "../screens/LogTestingScreen";
import {initialize, SDKConfig} from "@embrace-io/react-native";
import {SpanTestingScreen} from "../screens/SpanTestingScreen";
import {ReduxTestingScreen} from "../screens/ReduxTestingScreen";
import {NetworkTestingScreen} from "../screens/NetworkTestingScreen";
import {UserTestingScreen} from "../screens/UserTestingScreen";

import {EmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";
import {TracerProvider} from "@opentelemetry/api";

const wixAppInit = async (sdkConfig: SDKConfig) => {
  await initialize({
    sdkConfig,
    patch: "wix",
    logLevel: "info",
  });

  let provider;
  try {
    provider = new EmbraceNativeTracerProvider();
  } catch (e) {
    console.log(
      "Error creating `EmbraceNativeTracerProvider`. Will use global tracer provider instead",
      e,
    );
  }

  registerWixComponents(provider);
  registerWixScreens();
  configureWixScreenOptions();
  configureWixDefaultOptions();
};

const registerWixComponents = async (tracerProvider?: TracerProvider) => {
  Navigation.registerComponent(
    "HomeScreen",
    () => () => (
      // entry point of app
      <EmbraceWixTestHarness provider={tracerProvider}>
        <LogTestingScreen />
      </EmbraceWixTestHarness>
    ),
    () => LogTestingScreen, // Fallback into the LogTestingScreen (acting as 'home')
  );

  // rest of navigation
  Navigation.registerComponent("SpanScreen", () => SpanTestingScreen);
  Navigation.registerComponent("ReduxScreen", () => ReduxTestingScreen);
  Navigation.registerComponent("NetworkScreen", () => NetworkTestingScreen);
  Navigation.registerComponent("UserScreen", () => UserTestingScreen);
};

const registerWixScreens = () => {
  Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
      root: {
        bottomTabs: {
          children: [
            {
              stack: {
                children: [
                  {
                    component: {
                      name: "HomeScreen",
                    },
                  },
                ],
              },
            },
            {
              stack: {
                children: [
                  {
                    component: {
                      name: "SpanScreen",
                    },
                  },
                ],
              },
            },
            {
              stack: {
                children: [
                  {
                    component: {
                      name: "ReduxScreen",
                    },
                  },
                ],
              },
            },
            {
              stack: {
                children: [
                  {
                    component: {
                      name: "NetworkScreen",
                    },
                  },
                ],
              },
            },
            {
              stack: {
                children: [
                  {
                    component: {
                      name: "UserScreen",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  });
};

const configureWixScreenOptions = () => {
  // @ts-ignore
  LogTestingScreen.options = {
    topBar: {
      title: {
        text: "Home",
      },
    },
    bottomTab: {
      text: "Home",
    },
  };

  // @ts-ignore
  SpanTestingScreen.options = {
    topBar: {
      title: {
        text: "Span",
      },
    },
    bottomTab: {
      text: "Span",
    },
  };

  // @ts-ignore
  ReduxTestingScreen.options = {
    topBar: {
      title: {
        text: "Redux",
      },
    },
    bottomTab: {
      text: "Redux",
    },
  };

  // @ts-ignore
  NetworkTestingScreen.options = {
    topBar: {
      title: {
        text: "Network",
      },
    },
    bottomTab: {
      text: "Network",
    },
  };

  // @ts-ignore
  UserTestingScreen.options = {
    topBar: {
      title: {
        text: "User",
      },
    },
    bottomTab: {
      text: "User",
    },
  };
};

const configureWixDefaultOptions = () => {
  Navigation.setDefaultOptions({
    statusBar: {
      backgroundColor: "#4d089a",
    },
    topBar: {
      title: {
        color: "white",
      },
      backButton: {
        color: "white",
      },
      background: {
        color: "#4d089a",
      },
    },
    bottomTab: {
      fontSize: 14,
      selectedFontSize: 14,
    },
  });
};

export {wixAppInit};
