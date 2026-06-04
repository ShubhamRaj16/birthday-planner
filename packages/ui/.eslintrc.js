module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',    // not needed with React 17+ JSX transform
    'react/prop-types': 'off',             // we don't use PropTypes
    'react/display-name': 'off',           // styled-components breaks this

    // Catch unused imports/vars — Phase 4 shipped with 2 unused imports
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

    // Hook dependencies — catches missing deps that cause stale closures
    'react-hooks/exhaustive-deps': 'warn',

    // Strict equality
    'eqeqeq': ['error', 'always', { null: 'ignore' }],

    // Modern JS
    'no-var': 'error',
    'prefer-const': 'warn',

    // Throw proper Error objects
    'no-throw-literal': 'error',

    // Async safety
    'no-async-promise-executor': 'error',

    // No duplicate imports
    'no-duplicate-imports': 'error',

    // Warn on console in frontend — should use error state, not console.error
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Shadowing
    'no-shadow': ['warn', { allow: ['err', 'error', 'resolve', 'reject'] }],
  },
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
      },
    },
    {
      // DIP transport seam: UI (components + pages) must call an `api/*.api.ts`
      // repository module, never axios or the raw http instance directly.
      files: ['src/components/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'axios',
                message: 'Do not import axios in the UI. Call an api/*.api.ts repository module instead.',
              },
            ],
            patterns: [
              {
                group: ['**/api/http', '**/lib/apiClient'],
                message: 'UI must depend on an api/*.api.ts repository, not the raw http transport instance.',
              },
            ],
          },
        ],
      },
    },
    {
      // Webpack config and scripts are CJS
      files: ['config/**/*.js', 'scripts/**/*.js'],
      parserOptions: { sourceType: 'script' },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Test files can use describe/it/expect globals and relax some rules
      files: ['src/**/*.test.{js,ts,tsx}', 'src/test/**/*.{js,ts,tsx}'],
      env: { node: true },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // SSR server is Node.js — console.log is intentional for request logging
      files: ['src/server/**/*.js'],
      env: { node: true, browser: false },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Vitest test files — globals provided by vitest runtime
      files: ['src/test/**/*.{js,ts,tsx}', 'src/tests/**/*.{js,ts,tsx}'],
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
