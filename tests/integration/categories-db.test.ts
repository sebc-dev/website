/**
 * Integration tests for Categories
 *
 * These tests interact with a real D1 database instance via getPlatformProxy.
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { afterAll,beforeEach, describe, expect, it } from 'vitest';

import { categories } from '@/lib/server/db/schema';

import { getTestDb } from './setup';

describe('Categories Integration Tests', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    const d1 = getTestDb();
    db = drizzle(d1);

    // Clean up test data before each test
    // We delete test categories but preserve canonical ones
    await db.delete(categories).where(eq(categories.id, 'test-cat-1'));
  });

  afterAll(async () => {
    // Final cleanup to ensure no residual test data remains
    const d1 = getTestDb();
    const db = drizzle(d1);
    await db.delete(categories).where(eq(categories.id, 'test-cat-1'));
  });

  it('should insert and retrieve a category', async () => {
    const testCategory: typeof categories.$inferInsert = {
      id: 'test-cat-1',
      key: 'test-category',
      nameFr: 'Catégorie Test',
      nameEn: 'Test Category',
      slugFr: 'categorie-test',
      slugEn: 'test-category',
      icon: 'TestTube',
      color: '#FF0000',
    };

    // Insert the category
    await db.insert(categories).values(testCategory);

    // Retrieve and verify
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.id, 'test-cat-1'));

    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('test-category');
    expect(results[0].nameFr).toBe('Catégorie Test');
    expect(results[0].nameEn).toBe('Test Category');
  });

  it('should update a category', async () => {
    const testCategory: typeof categories.$inferInsert = {
      id: 'test-cat-1',
      key: 'test-update',
      nameFr: 'Original',
      nameEn: 'Original',
      slugFr: 'original',
      slugEn: 'original',
      icon: 'Star',
      color: '#0000FF',
    };

    // Insert
    await db.insert(categories).values(testCategory);

    // Update
    await db
      .update(categories)
      .set({ nameFr: 'Mise à jour', nameEn: 'Updated' })
      .where(eq(categories.id, 'test-cat-1'));

    // Verify
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.id, 'test-cat-1'));

    expect(results[0].nameFr).toBe('Mise à jour');
    expect(results[0].nameEn).toBe('Updated');
  });

  it('should query categories by key', async () => {
    const testCategory: typeof categories.$inferInsert = {
      id: 'test-cat-1',
      key: 'unique-test-key',
      nameFr: 'Test',
      nameEn: 'Test',
      slugFr: 'test',
      slugEn: 'test',
      icon: 'Search',
      color: '#00FF00',
    };

    await db.insert(categories).values(testCategory);

    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.key, 'unique-test-key'));

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('test-cat-1');
  });
});
