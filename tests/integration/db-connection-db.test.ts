/**
 * D1 Database Connection Integration Tests
 *
 * Tests real database connectivity with Cloudflare D1 via getPlatformProxy.
 */

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';

import { getDb } from '@/lib/server/db';

import { getTestDb } from './setup';

describe('D1 Database Connection Integration Tests', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(() => {
    const d1 = getTestDb();
    db = drizzle(d1);
  });

  it('should create database instance and connect successfully', () => {
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });

  it('should execute a simple query on D1', async () => {
    // Execute a simple SELECT 1 query to verify connection
    const result = await db.run(sql`SELECT 1 as value`);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should query sqlite_master to verify database structure', async () => {
    // Query the sqlite_master table to verify the database has tables
    const result = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%'`,
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Should have at least our schema tables
    const tableNames = (result as { name: string }[]).map((r) => r.name);
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('articles');
    expect(tableNames).toContain('article_translations');
    expect(tableNames).toContain('tags');
    expect(tableNames).toContain('article_tags');
  });

  it('should throw error when DB binding is missing', () => {
    const emptyEnv = {} as unknown as { DB: D1Database };

    expect(() => getDb(emptyEnv)).toThrow('DB binding is not available');
  });

  it('should throw error with helpful message mentioning wrangler.jsonc', () => {
    const emptyEnv = {} as unknown as { DB: D1Database };

    expect(() => getDb(emptyEnv)).toThrow(/wrangler\.jsonc/);
  });
});
