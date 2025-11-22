/**
 * Integration Tests Setup
 *
 * This file configures the test environment for integration tests with Cloudflare D1.
 * Uses getPlatformProxy from Wrangler to emulate Cloudflare bindings in Node.js.
 *
 * @see https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
 */

import { beforeAll, afterAll } from 'vitest';
import { getPlatformProxy, type PlatformProxy } from 'wrangler';
import { execSync } from 'child_process';
import path from 'path';

// Platform proxy instance
let platformProxy: PlatformProxy<{
  DB: D1Database;
  ASSETS: Fetcher;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
}>;

// Export env for use in tests
export let testEnv: {
  DB: D1Database;
  ASSETS: Fetcher;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
};

beforeAll(async () => {
  const rootDir = path.resolve(__dirname, '../..');

  console.log('🚀 Starting integration test setup...');

  // 1. Apply D1 migrations
  console.log('📦 Applying D1 migrations...');
  try {
    execSync('npx wrangler d1 migrations apply DB --local', {
      stdio: 'inherit',
      cwd: rootDir,
      env: {
        ...process.env,
        CI: 'true', // Force non-interactive mode
        NO_D1_WARNING: 'true',
      },
    });
  } catch (error) {
    console.error('❌ Failed to apply migrations:', error);
    throw error;
  }

  // 2. Initialize platform proxy
  console.log('🔌 Initializing Cloudflare platform proxy...');
  try {
    platformProxy = await getPlatformProxy({
      configPath: path.join(rootDir, 'wrangler.jsonc'),
      persist: true, // Persist data between test runs
    });

    testEnv = platformProxy.env;
    console.log('✅ Platform proxy initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize platform proxy:', error);
    throw error;
  }
});

afterAll(async () => {
  // Clean up platform proxy
  if (platformProxy) {
    console.log('🧹 Cleaning up platform proxy...');
    await platformProxy.dispose();
  }
});

/**
 * Helper to get the test database instance
 */
export function getTestDb() {
  if (!testEnv?.DB) {
    throw new Error(
      'Test environment not initialized. Ensure tests are run with the integration config.',
    );
  }
  return testEnv.DB;
}
