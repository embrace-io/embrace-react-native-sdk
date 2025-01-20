import * as React from "react";
import {Navigation} from "react-native-navigation";
import {EmbraceWixTestHarness} from "../EmbraceWixTestHarness";
import {LogTestingScreen} from "../screens/LogTestingScreen";
import {initialize, SDKConfig} from "@embrace-io/react-native";
import {SpanTestingScreen} from "../screens/SpanTestingScreen";
import {PropertyTestingScreen} from "../screens/PropertyTestingScreen";
import {TracerProviderTestingScreen} from "../screens/TracerProviderTestingScreen";
import {OTLPTestingScreen} from "../screens/OTLPTestingScreen";
import {MiscTestingScreen} from "../screens/MiscTestingScreen";
import {NSFTestingScreen} from "../screens/NSFTestingScreen";
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
  Navigation.registerComponent("PropertyScreen", () => PropertyTestingScreen);
  Navigation.registerComponent(
    "TracerProviderScreen",
    () => TracerProviderTestingScreen,
  );
  Navigation.registerComponent("OtlpScreen", () => OTLPTestingScreen);
  Navigation.registerComponent("MiscScreen", () => MiscTestingScreen);
  Navigation.registerComponent("NsfScreen", () => NSFTestingScreen);
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
                      name: "PropertyScreen",
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
                      name: "TracerProviderScreen",
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
                      name: "OtlpScreen",
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
                      name: "MiscScreen",
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
                      name: "NsfScreen",
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
  PropertyTestingScreen.options = {
    topBar: {
      title: {
        text: "Property",
      },
    },
    bottomTab: {
      text: "Property",
    },
  };

  // @ts-ignore
  NSFTestingScreen.options = {
    topBar: {
      title: {
        text: "Nsf",
      },
    },
    bottomTab: {
      text: "Nsf",
    },
  };

  // @ts-ignore
  OTLPTestingScreen.options = {
    topBar: {
      title: {
        text: "Otlp",
      },
    },
    bottomTab: {
      text: "Otlp",
    },
  };

  // @ts-ignore
  TracerProviderTestingScreen.options = {
    topBar: {
      title: {
        text: "Tracer provider",
      },
    },
    bottomTab: {
      text: "Tracer provider",
    },
  };
  // @ts-ignore
  MiscTestingScreen.options = {
    topBar: {
      title: {
        text: "Misc",
      },
    },
    bottomTab: {
      text: "Misc",
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
