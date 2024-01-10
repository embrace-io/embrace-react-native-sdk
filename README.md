# NPM - React Native Embrace

Embrace gathers the information needed to identify issues and measure performance automatically upon integration. The following React Native guide provides simple instruction on how to call the relevant functions so teams can be provided much needed additional context (logs and user info) and measure the timing of key areas of their app explicitly (moments).

For additional info please refer to the [React Native Guide](https://embrace.io/docs/react-native/).

# Requirements

Only an Embrace App ID and an Embrace API Token.

_If you need an App ID and API Token, contact us at support@embrace.io or on Slack._

# Integration

### Step 1: Add Embrace React Native SDK

##### 1.1: Add EmbraceIO's Pod to your Podfile

NPM

```sh
    npm install @embrace-react-native/core
```

YARN

```sh
    yarn add @embrace-react-native/core
```

##### Setup Script

The JavaScript Embrace SDK ships with a setup script to modify the files in your
project to add the native dependencies. The setup scripts can be found in your
`node_modules` folder at `node_modules/@embrace-react-native/core/dist/scripts/setup`

**Run the setup script**

```shell-session
node node_modules/@embrace-react-native/core/dist/scripts/setup/installAndroid.js
```

```shell-session
node node_modules/@embrace-react-native/core/dist/scripts/setup/installIos.js
```

You can use git to see the changes that the script made.

```shell-session
git diff
```

### Step 6: Initialize Embrace SDK

Initialize method applies the necessary listener to your application. This allow Embrace to track javascript errors, check js bundle changes (if you use OTA), track js patch and react native versions.

```javascript
import { initialize } from "@embrace-react-native/core";

type Props = {};
export default class App extends Component<Props> {
  componentDidMount() {
    initialize();
  }
}
```
