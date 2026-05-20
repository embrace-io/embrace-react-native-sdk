import React from 'react';
import {EmbraceReactNativeTestHarness} from '@embrace-io/react-native-test-harness';
import sdkConfig from './embrace-sdk-config.json';

function App(): React.JSX.Element {
  return (
    <EmbraceReactNativeTestHarness
      navigationStyle="react-native"
      sdkConfig={sdkConfig}
      allowCustomExport={false}
    />
  );
}

export default App;
