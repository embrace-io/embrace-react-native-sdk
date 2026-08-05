import React from 'react';
import {EmbraceExpoTestHarness} from '@embrace-io/react-native-test-harness/lib/EmbraceExpoTestHarness';
import sdkConfig from './embrace-sdk-config.json';

function App(): React.JSX.Element {
  return (
    <EmbraceExpoTestHarness
      sdkConfig={sdkConfig}
      allowCustomExport={false}
    />
  );
}

export default App;
