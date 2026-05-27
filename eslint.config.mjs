import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import jest from "eslint-plugin-jest";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
  // Replaces ignorePatterns. The entire integration-tests/ tree stays ignored.
  {
    ignores: [
      "coverage/",
      "dist/",
      "**/lib/",
      "node_modules/",
      "examples/",
      "integration-tests/",
    ],
  },

  // Base presets
  js.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,

  // Main config — all source files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // RN globals (__DEV__, etc.) — was env: {"react-native/react-native": true}
        ...reactNative.environments["react-native"].globals,
      },
    },
    settings: {
      // eslint-plugin-react@7.37.5 calls context.getFilename() (removed in ESLint 10)
      // when version is "detect". Hardcode the installed version to avoid the crash.
      react: {version: "19.1.0"},
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-native": reactNative,
      import: importPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/prefer-default-export": "off",
      "import/newline-after-import": "error",
      "react/jsx-fragments": ["error", "syntax"],
      "import/order": [
        "error",
        {
          alphabetize: {order: "desc"},
          pathGroups: [
            {
              pattern: "react",
              patternOptions: {partial: false},
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
      // Previously provided by @react-native-community/eslint-config:
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // eslint-plugin-react-native@5.0.0 uses context.getSourceCode() (removed in ESLint 10).
      // Disable until the plugin ships ESLint 10-compatible rules.
      "react-native/no-inline-styles": "off",
      // KTLO: off/warn for now — turn on after team discussion / refactor.
      "no-console": "off",
      quotes: "off",
      "no-prototype-builtins": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty-pattern": "warn",
    },
  },

  // TypeScript handles undefined-symbol checking; disable core no-undef for TS
  // (matches the old @react-native-community TS override).
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
    },
  },

  // Jest — scoped to test files (was extends: plugin:jest/recommended + overrides)
  {
    ...jest.configs["flat/recommended"],
    files: ["**/*.test.{js,jsx,ts,tsx}"],
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {...globals.jest},
    },
    rules: {
      "jest/no-identical-title": "off",
      "jest/no-conditional-expect": "warn",
      "jest/valid-expect-in-promise": "warn",
      "jest/valid-expect": "off",
    },
  },

  // Prettier — MUST be last so it can turn off conflicting formatting rules.
  prettierRecommended,
);
