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
        // Logic layer gated at 95% lines. Glob targets slices/ (not store.ts /
        // hooks.ts, which are DI/typing wiring like api/http.ts). Components/pages
        // stay ungated until T2/T3 land their tests. Never lower — only raise.
        'src/redux/slices/**/*.ts': { lines: 95, functions: 95 },
        'src/api/**/*.ts': { lines: 95 },
        'src/lib/**/*.ts': { lines: 95 },
      },
    },
  },
});
