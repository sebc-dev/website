import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Playwright Global Setup for D1 Database Initialization
 *
 * This function runs once before all tests and initializes the local D1 database
 * with migrations and seed data. This ensures consistent test data across all E2E tests.
 *
 * Process:
 * 1. Apply D1 migrations from drizzle/migrations
 * 2. Seed categories from drizzle/seeds/categories.sql
 * 3. Seed sample articles from drizzle/seeds/sample-articles.sql
 *
 * Reference: https://playwright.dev/docs/test-global-setup-teardown
 */
export default async function globalSetup(): Promise<void> {
  try {
    console.log("🚀 [GlobalSetup] Démarrage de l'initialisation D1...");
    await Promise.resolve();

    // Optional: Clear D1 cache to ensure clean state
    // This can be enabled if tests fail with "table already exists" errors
    // console.log('   🔄 Purge du cache D1...');
    // execSync('rm -rf .wrangler/state/v3', { encoding: 'utf-8' });

    // Step 1: Apply migrations
    console.log('   📋 Application des migrations D1...');
    execSync('pnpm wrangler d1 migrations apply DB --local', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    // Step 2: Seed categories
    console.log('   🌱 Seed des catégories...');
    const categoriesSeedPath = join(
      process.cwd(),
      'drizzle/seeds/categories.sql',
    );
    if (!existsSync(categoriesSeedPath)) {
      throw new Error(`Categories seed file not found: ${categoriesSeedPath}`);
    }
    execSync(
      `pnpm wrangler d1 execute DB --local --file=${categoriesSeedPath}`,
      {
        stdio: 'inherit',
        encoding: 'utf-8',
      },
    );

    // Step 3: Seed articles
    console.log('   📄 Seed des articles de test...');
    const articlesSeedPath = join(
      process.cwd(),
      'drizzle/seeds/sample-articles.sql',
    );
    if (!existsSync(articlesSeedPath)) {
      throw new Error(`Articles seed file not found: ${articlesSeedPath}`);
    }
    execSync(`pnpm wrangler d1 execute DB --local --file=${articlesSeedPath}`, {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    console.log('   ✅ Base de données D1 initialisée avec succès');
  } catch (error) {
    console.error(
      "   ❌ Erreur lors de l'initialisation D1:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
