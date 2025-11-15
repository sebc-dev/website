import { describe, expect, it } from 'vitest';

import { getDb } from '@/lib/server/db';

describe('D1 Database Connection', () => {
  it('should create database instance without errors', () => {
    // Mock env with D1 binding
    const mockEnv = {
      DB: {} as D1Database, // Mock D1Database for testing
    };

    expect(() => getDb(mockEnv)).not.toThrow();
  });

  it('should throw error when DB binding is missing', () => {
    const emptyEnv = {} as unknown as { DB: D1Database };

    expect(() => getDb(emptyEnv)).toThrow('DB binding is not available');
  });

  it('should throw error with helpful message mentioning wrangler.jsonc', () => {
    const emptyEnv = {} as unknown as { DB: D1Database };

    expect(() => getDb(emptyEnv)).toThrow(/wrangler\.jsonc/);
  });

  it('should throw error with helpful message mentioning Cloudflare Workers', () => {
    const emptyEnv = {} as unknown as { DB: D1Database };

    expect(() => getDb(emptyEnv)).toThrow(/Cloudflare Workers runtime/);
  });

  it('should return a Drizzle database instance with expected type', () => {
    const mockEnv = {
      DB: {} as D1Database,
    };

    const db = getDb(mockEnv);

    // Verify that db is an object (Drizzle instance)
    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });
});
