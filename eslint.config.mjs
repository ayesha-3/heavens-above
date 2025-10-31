import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      "node_modules",
      "dist",
      "__tests__/**",
      "docs/scripts/prettify/**", // Ignore all vendor scripts
      "docs/scripts/linenumber.js",
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser, // Add browser globals to avoid 'window' errors
        ...globals.jest,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-redeclare": "error",
      "no-useless-escape": "warn",
    },
  },
];
