import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  test: {
    environment: 'node',
    root: rootDir,
    globalSetup: ['./tests/integration/globalSetup.ts'],
    setupFiles: [path.resolve(__dirname, '../tests/integration/setup.ts')],
    include: ['tests/integration/**/*-db.test.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    // Sequential execution to avoid D1 database conflicts
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '.next/',
        '.stryker-tmp/',
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
