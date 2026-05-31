import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/tests/**/*.test.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/server/**',
        'src/test/**',
        'src/tests/**',
        'src/client/index.js',
      ],
    },
  },
});
