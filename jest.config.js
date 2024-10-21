// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const {defaults: tsjPreset} = require("ts-jest/presets");

module.exports = {
  ...tsjPreset,
  clearMocks: true,
  preset: "react-native",
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/packages/.*/lib/",
    "<rootDir>/examples/",
    "<rootDir>/integration-tests/",
    "<rootDir>/packages/.*/native-src/",
    "<rootDir>/packages/core/test-project/",
    "<rootDir>/packages/.*/node_modules/",
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 74,
    },
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babel: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
};
