import React from 'react';
import {Navigation} from 'react-native-navigation';

import {
  registerWixComponents,
  registerWixScreens,
  configureWixScreenOptions,
  configureWixDefaultOptions,
} from '@embrace-io/react-native-test-harness/lib/helpers/wix';
import sdkConfig from './embrace-sdk-config.json';

registerWixComponents(sdkConfig);
registerWixScreens();
configureWixScreenOptions();
configureWixDefaultOptions();
