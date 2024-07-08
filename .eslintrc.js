module.exports = {
  env: {
    browser: true,
    es2021: true,
    "react-native/react-native": true,
  },
  extends: [
    "plugin:jest/recommended",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "@react-native-community",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-native",
    "@typescript-eslint",
    "prettier",
    "import",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-var-requires": "off",
    "import/prefer-default-export": "off",
    "import/newline-after-import": "error",
    "react/jsx-fragments": [2, "syntax"],
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "desc",
        },
        pathGroups: [
          {
            pattern: "react",
            patternOptions: {
              partial: false,
            },
            group: "external",
            position: "before",
          },
        ],
        "newlines-between": "always",
      },
    ],
    "@typescript-eslint/no-unused-vars": "warn",
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-curly-brace-presence": [
      "error",
      {props: "never", children: "never"},
    ],
    // NOTE: the following rules are off for development since we are not refactoring code.
    // KTLO: we should turn on these rules after discuss with the team about preferences/code refactor
    "no-console": "off",
    quotes: "off",
    "jest/no-identical-title": "off",
    "no-prototype-builtins": "warn",
    "@typescript-eslint/ban-types": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "jest/no-conditional-expect": "warn",
    "jest/valid-expect-in-promise": "warn",
    "no-empty-pattern": "warn",
  },
  overrides: [
    {
      files: ["**/*.test.js", "**/*.test.ts", "**/*.test.jsx", "**/*.test.tsx"], // Adjust patterns to match your Jest test files
      rules: {
        "jest/valid-expect": "off", // Disable the rule that enforces async handling of expectations
      },
    },
  ],
  ignorePatterns: [
    "/coverage/",
    "/dist/",
    "/node_modules/",
    "/examples/",
    "/integration-tests/",
    "/lib/",
  ],
};
