import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import _import from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";
import {fixupConfigRules} from "@eslint/compat";

const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const removeInvalidRules = configs => {
  if (!configs) {
    return;
  }

  configs.forEach(config => {
    if (!config.rules) {
      return;
    }

    delete config.rules["@typescript-eslint/func-call-spacing"];
  });

  return configs;
};

const reactCompat = new FlatCompat();

export default [
  ...compat.extends(
    "plugin:jest/recommended",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ),
  //...removeInvalidRules(fixupConfigRules(reactCompat.extends("@react-native")),
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...reactNative.environments["react-native"].globals,
        ErrorUtils: "writable",
      },
      ecmaVersion: 12,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-native": reactNative,
      "@typescript-eslint": typescriptEslint,
      prettier,
      import: _import,
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
      "no-unused-vars": "warn",
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
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      //"react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "jest/no-conditional-expect": "warn",
      "jest/valid-expect-in-promise": "warn",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
    },
  },
  {
    files: ["**/*.test.js", "**/*.test.ts", "**/*.test.jsx", "**/*.test.tsx"], // Adjust patterns to match your Jest test files
    rules: {
      "jest/valid-expect": "off", // Disable the rule that enforces async handling of expectations
    },
  },
  {
    ignores: [
      "coverage/",
      "dist/",
      "node_modules/",
      "examples/",
      "integration-tests/",
      "lib/",
      ".yarn/",
    ],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
