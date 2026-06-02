import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/tests/**/*.test.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcovonly'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/server/**',
        'src/test/**',
        'src/tests/**',
        'src/client/index.js',
        'src/api/http.ts', // transport config (axios.create); behaviourless
      ],
      thresholds: {
        // Ratchet gate: set to the CURRENT measured floor so CI is green and can
        // never regress. Raise toward 90% as the next increment adds tests for the
        // untested thunks (eventsSlice fetchEvent/fetchUpcoming/activateEvent,
        // rejected branches) and csv.downloadCsv. Never lower these.
        'src/redux/**/*.ts': { lines: 77, functions: 75 },
        'src/api/**/*.ts': { lines: 90 },
        'src/lib/**/*.ts': { lines: 70 },
      },
    },
  },
});
