/**
 * Global Setup for Integration Tests
 *
 * Runs once before all test files to apply D1 migrations.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const rootDir = path.resolve(__dirname, '../..');

  console.log('🚀 Global setup: Applying D1 migrations...');

  try {
    execSync('npx wrangler d1 migrations apply DB --local', {
      stdio: 'inherit',
      cwd: rootDir,
      env: {
        ...process.env,
        CI: 'true',
        NO_D1_WARNING: 'true',
      },
    });
    console.log('✅ Migrations applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply migrations:', error);
    throw error;
  }
}
