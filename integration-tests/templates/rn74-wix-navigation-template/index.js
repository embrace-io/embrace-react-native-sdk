import React from 'react';
import {Navigation} from 'react-native-navigation';
import {
  NSFTestingScreen,
  MiscTestingScreen,
  OTLPTestingScreen,
  SpanTestingScreen,
  PropertyTestingScreen,
  TracerProviderTestingScreen,
  LogTestingScreen,
} from '@embrace-io/react-native-test-harness';
import App from './App';

Navigation.registerComponent(
  'Home',
  () => () => (
    <App>
      <LogTestingScreen />
    </App>
  ),
  () => LogTestingScreen,
);
Navigation.registerComponent('Span', () => SpanTestingScreen);
Navigation.registerComponent('Property', () => PropertyTestingScreen);
Navigation.registerComponent(
  'TracerProvider',
  () => TracerProviderTestingScreen,
);
Navigation.registerComponent('Otlp', () => OTLPTestingScreen);
Navigation.registerComponent('Misc', () => MiscTestingScreen);
Navigation.registerComponent('Nsf', () => NSFTestingScreen);

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
                    name: 'Home',
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
                    name: 'Span',
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
                    name: 'Property',
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
                    name: 'TracerProvider',
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
                    name: 'Otlp',
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
                    name: 'Nsf',
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

LogTestingScreen.options = {
  topBar: {
    title: {
      text: 'Home',
    },
  },
  bottomTab: {
    text: 'Home',
  },
};

NSFTestingScreen.options = {
  topBar: {
    title: {
      text: 'Nsf',
    },
  },
  bottomTab: {
    text: 'Nsf',
  },
};

OTLPTestingScreen.options = {
  topBar: {
    title: {
      text: 'Otlp',
    },
  },
  bottomTab: {
    text: 'Otlp',
  },
};

SpanTestingScreen.options = {
  topBar: {
    title: {
      text: 'Span',
    },
  },
  bottomTab: {
    text: 'Span',
  },
};

PropertyTestingScreen.options = {
  topBar: {
    title: {
      text: 'Property',
    },
  },
  bottomTab: {
    text: 'Property',
  },
};

TracerProviderTestingScreen.options = {
  topBar: {
    title: {
      text: 'Tracer provider',
    },
  },
  bottomTab: {
    text: 'Tracer provider',
  },
};

MiscTestingScreen.options = {
  topBar: {
    title: {
      text: 'Misc',
    },
  },
  bottomTab: {
    text: 'Misc',
  },
};

Navigation.setDefaultOptions({
  statusBar: {
    backgroundColor: '#4d089a',
  },
  topBar: {
    title: {
      color: 'white',
    },
    backButton: {
      color: 'white',
    },
    background: {
      color: '#4d089a',
    },
  },
  bottomTab: {
    fontSize: 14,
    selectedFontSize: 14,
  },
});
