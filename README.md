# Embrace React Native SDK

The Embrace React Native SDK gathers the information needed to identify issues and measure performance automatically
upon integration providing teams with much needed additional context (logs and user info) and timing measurements of
key areas of their app (spans).

More documentation and examples can be found in our [React Native Documentation](https://embrace.io/docs/react-native/).

## Getting Started

Install the core package with `npm install @embrace-io/react-native` or `yarn add @embrace-io/react-native` and then
please head to our website to [sign up](https://dash.embrace.io/signup/) and follow our [integration guide](./packages/core/README.md).

## Packages

Individual packages are published from this monorepo, reasoning can be found in [Babel's design doc](https://github.com/babel/babel/blob/main/doc/design/monorepo.md).

| Package                                                                               | Version                                                                                                                                                                 |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`@embrace-io/react-native`](./packages/core)                                         | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native)                                 |
| [`@embrace-io/react-native-redux`](./packages/react-native-redux)   | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-redux.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-redux)   |
| [`@embrace-io/react-native-navigation`](./packages/react-native-navigation)           | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-navigation.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-navigation)           |
| [`@embrace-io/react-native-tracer-provider`](./packages/react-native-tracer-provider) | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-tracer-provider.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-tracer-provider) |
| [`@embrace-io/react-native-otlp`](./packages/react-native-otlp)                       | [![npm](https://img.shields.io/npm/v/@embrace-io/react-native-otlp.svg?maxAge=3600)](https://www.npmjs.com/package/@embrace-io/react-native-otlp)                       |

## Support

If you have a feature suggestion or have spotted something that doesn't look right please open an [issue](https://github.com/embrace-io/embrace-react-native-sdk/issues/new) for the Embrace team to triage or reach out in our [Community Slack](https://community.embrace.io/) for direct, faster assistance.

## Contributions

Please refer to our [contribution guide](./CONTRIBUTING.md) to get started.

## License

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-orange)](./LICENSE.txt)

The Embrace React Native SDK is published under the Apache-2.0 license.


