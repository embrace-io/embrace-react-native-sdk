import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jest from "eslint-plugin-jest";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default tseslint.config(
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
  {
    ...react.configs.flat.recommended,
    files: ["**/*.{js,jsx,ts,tsx}"],
  },

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
        ...globals.node,
        ...globals.es2021,
        __DEV__: "readonly",
      },
    },
    settings: {
      // eslint-plugin-react crashes in in ESLint 10 when version is "detect", so specify the version explicitly
      react: {version: "19.0"},
    },
    plugins: {
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "react/no-unescaped-entities": "off",
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
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
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
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        {allowShortCircuit: true},
      ],
      // Previously provided by @react-native-community/eslint-config:
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // KTLO: @typescript-eslint/no-require-imports has 91 violations across build/setup scripts and tests
      // We should turn this on if/when we migrate require() -> import in a dedicated refactor
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // TypeScript handles undefined-symbol checking
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
    },
  },

  // CommonJS config/script files (e.g. yarn.config.cjs) — provide Node globals so
  // `require`/`module` don't trip no-undef
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {...globals.node},
    },
    rules: {
      // require() is the correct idiom in CommonJS files
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Jest — scoped to test files
  {
    ...jest.configs["flat/recommended"],
    files: ["**/*.test.{js,jsx,ts,tsx}"],
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    rules: {
      "jest/no-identical-title": "off",
      "jest/no-conditional-expect": "warn",
      "jest/valid-expect-in-promise": "warn",
      "jest/valid-expect": "off",
      "jest/expect-expect": [
        "warn",
        {assertFunctionNames: ["expect", "verifySpans"]},
      ],
    },
  },

  // Prettier must be last so it can turn off conflicting formatting rules.
  prettierRecommended,
);
