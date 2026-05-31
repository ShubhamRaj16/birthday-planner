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
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
