# Embrace React Native SDK

The Embrace React Native SDK gathers the information needed to identify issues and measure performance automatically
upon integration providing teams with much needed additional context (logs and user info) and timing measurements of
key areas of their app (spans).

More documentation and examples can be found in our [React Native Documentation](https://embrace.io/docs/react-native/).

## Getting Started

Please head to our website to [sign up](https://dash.embrace.io/signup/) and then follow our [integration guide](./packages/core/README.md).

## Packages

Individual packages are published from this monorepo, reasoning can be found in [Babel's design doc](https://github.com/babel/babel/blob/main/doc/design/monorepo.md).

| Package                                                                                | Version                                                                                                                                                                                       |
|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`@embrace-io/react-native`](./packages/core)                                          | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native)                                                       |
| [`@embrace-io/react-native-action-tracker`](./packages/action-tracker)                 | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-action-tracker.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-action-tracker)                         |
| [`@embrace-io/react-native-apollo-graphql`](./packages/apollo-graphql)                 | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-apollo-graphql.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-apollo-graphql)                         |
| [`@embrace-io/react-native-navigation`](./packages/react-native-navigation)            | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-navigation.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-navigation)                                 |
| [`@embrace-io/react-navigation`](./packages/react-navigation)                          | [![npm](https://img.shields.io/npm/v/@embrace-io/react-navigation.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-navigation)                                               |
| [`@embrace-io/react-native-orientation-change-tracker`](./packages/screen-orientation) | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-orientation-change-tracker.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-orientation-change-tracker) |
| [`@embrace-io/react-native-spans`](./packages/spans)                                   | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-spans.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-spans)                                           |
| [`@embrace-io/react-native-webview-tracker`](./packages/webview-tracker)               | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-webview-tracker.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-webview-tracker)                       |

## Support

- Open an [issue](https://github.com/embrace-io/embrace-react-native-sdk/issues/new) for the Embrace team to triage.
- Join our [Community Slack](https://community.embrace.io)

## License

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-orange)](./LICENSE.txt)

The Embrace React Native SDK is published under the Apache-2.0 license.