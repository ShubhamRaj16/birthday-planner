module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    // Catch unused imports/vars — Phase 4 shipped with 2 unused imports
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

    // Strict equality — prevents null/undefined coercion bugs
    'eqeqeq': ['error', 'always', { null: 'ignore' }],

    // Modern JS — no var, prefer const
    'no-var': 'error',
    'prefer-const': 'warn',

    // Throw proper Error objects, not strings
    'no-throw-literal': 'error',

    // Async safety
    'no-async-promise-executor': 'error',
    'no-promise-executor-return': 'error',

    // No duplicate requires
    'no-duplicate-imports': 'error',

    // Allow console — backend uses it for cron/debug logging intentionally
    'no-console': 'off',

    // Shadowing local vars is a common source of silent bugs
    'no-shadow': ['warn', { allow: ['err', 'error', 'resolve', 'reject'] }],
  },
  ignorePatterns: ['node_modules/', 'prisma/migrations/'],
  overrides: [
    {
      files: ['src/test/**/*.{js,ts}', 'src/test/**/*.mjs', 'tests/**/*.{js,ts}'],
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  ],
};
