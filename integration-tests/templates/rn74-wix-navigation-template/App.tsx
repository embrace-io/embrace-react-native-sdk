import React from 'react';
import {EmbraceTestHarness} from '@embrace-io/react-native-test-harness';
import sdkConfig from './embrace-sdk-config.json';

function App({children}): React.JSX.Element {
  return (
    <EmbraceTestHarness
      navigationStyle="wix"
      sdkConfig={sdkConfig}
      allowCustomExport={false}>
      {children}
    </EmbraceTestHarness>
  );
}

export default App;
