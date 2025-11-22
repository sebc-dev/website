import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    root: rootDir,
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', '.stryker-tmp', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        '.stryker-tmp/',
        'tests/',
        '**/*.config.{ts,js}',
        '**/types.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
