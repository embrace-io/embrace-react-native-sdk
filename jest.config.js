// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  ...tsjPreset,
  clearMocks: true,
  preset: "react-native",
  transform: {
    ...tsjPreset.transform,
    "\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/packages/*/lib/",
    "<rootDir>/examples/",
    "<rootDir>/integration-tests/",
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 74,
    },
  },
  globals: {
    "ts-jest": {
      babelConfig: true,
    },
  },
};
