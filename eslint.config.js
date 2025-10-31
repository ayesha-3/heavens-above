// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ["node_modules", "dist",  "__tests__/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
      globals.node,
      globals.jest,
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
