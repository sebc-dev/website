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

export default function globalSetup() {
  const rootDir = path.resolve(__dirname, '../..');

  console.log('🚀 Global setup: Applying D1 migrations...');

  try {
    const result = execSync('npx wrangler d1 migrations apply DB --local', {
      cwd: rootDir,
      encoding: 'utf-8',
      env: {
        ...process.env,
        CI: 'true',
        NO_D1_WARNING: 'true',
      },
    });
    console.log(result);
    console.log('✅ Migrations applied successfully');
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string };
    console.error('❌ Failed to apply migrations');
    if (execError.stdout) console.error('stdout:', execError.stdout);
    if (execError.stderr) console.error('stderr:', execError.stderr);
    throw error;
  }
}
