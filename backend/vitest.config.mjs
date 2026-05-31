import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: 'file:./test.db',
    },
    globalSetup: './src/test/globalSetup.mjs',
    setupFiles: ['./src/test/setup.js'],
    fileParallelism: false,
    testTimeout: 15000,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/test/**', 'src/lib/cron.js', 'src/lib/backup.js'],
    },
  },
});
