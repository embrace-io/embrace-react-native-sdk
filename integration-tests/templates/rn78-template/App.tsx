import React from 'react';
import {EmbraceTestHarness} from '@embrace-io/react-native-test-harness';
import sdkConfig from './embrace-sdk-config.json';

function App(): React.JSX.Element {
  return (
    <EmbraceTestHarness
      navigationStyle="react-native"
      sdkConfig={sdkConfig}
      allowCustomExport={false}
    />
  );
}

export default App;
