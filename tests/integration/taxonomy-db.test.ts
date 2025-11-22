/**
 * Taxonomy Integration Tests
 *
 * Tests real CRUD operations on categories, tags, and articleTags tables
 * with Cloudflare D1 via getPlatformProxy.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { getTestDb } from './setup';
import {
  categories,
  tags,
  articleTags,
  articles,
} from '@/lib/server/db/schema';

describe('Taxonomy Integration Tests', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    const d1 = getTestDb();
    db = drizzle(d1);

    // Clean up test data in correct order (FK constraints)
    await db
      .delete(articleTags)
      .where(eq(articleTags.articleId, 'test-tax-article'));
    await db.delete(articles).where(eq(articles.id, 'test-tax-article'));
    await db.delete(tags).where(eq(tags.id, 'test-tag-1'));
    await db.delete(tags).where(eq(tags.id, 'test-tag-2'));
    await db.delete(categories).where(eq(categories.id, 'test-tax-cat'));
  });

  describe('Tags CRUD Operations', () => {
    it('should insert and retrieve a tag', async () => {
      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'TypeScript',
        nameEn: 'TypeScript',
      });

      const results = await db
        .select()
        .from(tags)
        .where(eq(tags.id, 'test-tag-1'));

      expect(results).toHaveLength(1);
      expect(results[0].nameFr).toBe('TypeScript');
      expect(results[0].nameEn).toBe('TypeScript');
      expect(results[0].createdAt).toBeDefined();
    });

    it('should update tag names', async () => {
      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'Original FR',
        nameEn: 'Original EN',
      });

      await db
        .update(tags)
        .set({ nameFr: 'Mis à jour', nameEn: 'Updated' })
        .where(eq(tags.id, 'test-tag-1'));

      const results = await db
        .select()
        .from(tags)
        .where(eq(tags.id, 'test-tag-1'));

      expect(results[0].nameFr).toBe('Mis à jour');
      expect(results[0].nameEn).toBe('Updated');
    });

    it('should delete a tag', async () => {
      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'À supprimer',
        nameEn: 'To delete',
      });

      await db.delete(tags).where(eq(tags.id, 'test-tag-1'));

      const results = await db
        .select()
        .from(tags)
        .where(eq(tags.id, 'test-tag-1'));

      expect(results).toHaveLength(0);
    });

    it('should support bilingual tag names', async () => {
      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'Apprentissage automatique',
        nameEn: 'Machine Learning',
      });

      const results = await db
        .select()
        .from(tags)
        .where(eq(tags.id, 'test-tag-1'));

      expect(results[0].nameFr).toBe('Apprentissage automatique');
      expect(results[0].nameEn).toBe('Machine Learning');
    });
  });

  describe('ArticleTags Junction Table', () => {
    it('should create article-tag relationship', async () => {
      // Create article and tag
      await db.insert(articles).values({
        id: 'test-tax-article',
        complexity: 'beginner',
        status: 'draft',
      });

      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'React',
        nameEn: 'React',
      });

      // Create relationship
      await db.insert(articleTags).values({
        articleId: 'test-tax-article',
        tagId: 'test-tag-1',
      });

      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, 'test-tax-article'));

      expect(results).toHaveLength(1);
      expect(results[0].tagId).toBe('test-tag-1');
    });

    it('should support multiple tags per article', async () => {
      await db.insert(articles).values({
        id: 'test-tax-article',
        complexity: 'intermediate',
        status: 'published',
      });

      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'React',
        nameEn: 'React',
      });

      await db.insert(tags).values({
        id: 'test-tag-2',
        nameFr: 'TypeScript',
        nameEn: 'TypeScript',
      });

      await db.insert(articleTags).values([
        { articleId: 'test-tax-article', tagId: 'test-tag-1' },
        { articleId: 'test-tax-article', tagId: 'test-tag-2' },
      ]);

      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, 'test-tax-article'));

      expect(results).toHaveLength(2);
    });

    it('should cascade delete articleTags when article is deleted', async () => {
      await db.insert(articles).values({
        id: 'test-tax-article',
        complexity: 'beginner',
        status: 'draft',
      });

      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'Test',
        nameEn: 'Test',
      });

      await db.insert(articleTags).values({
        articleId: 'test-tax-article',
        tagId: 'test-tag-1',
      });

      // Delete article
      await db.delete(articles).where(eq(articles.id, 'test-tax-article'));

      // ArticleTag should be deleted via CASCADE
      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, 'test-tax-article'));

      expect(results).toHaveLength(0);
    });

    it('should cascade delete articleTags when tag is deleted', async () => {
      await db.insert(articles).values({
        id: 'test-tax-article',
        complexity: 'beginner',
        status: 'draft',
      });

      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'Test',
        nameEn: 'Test',
      });

      await db.insert(articleTags).values({
        articleId: 'test-tax-article',
        tagId: 'test-tag-1',
      });

      // Delete tag
      await db.delete(tags).where(eq(tags.id, 'test-tag-1'));

      // ArticleTag should be deleted via CASCADE
      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.tagId, 'test-tag-1'));

      expect(results).toHaveLength(0);
    });

    it('should prevent duplicate article-tag pairs', async () => {
      await db.insert(articles).values({
        id: 'test-tax-article',
        complexity: 'beginner',
        status: 'draft',
      });

      await db.insert(tags).values({
        id: 'test-tag-1',
        nameFr: 'Test',
        nameEn: 'Test',
      });

      await db.insert(articleTags).values({
        articleId: 'test-tax-article',
        tagId: 'test-tag-1',
      });

      // Try to insert duplicate - should fail (composite PK)
      await expect(
        db.insert(articleTags).values({
          articleId: 'test-tax-article',
          tagId: 'test-tag-1',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Categories with Articles FK', () => {
    it('should create category and link to article', async () => {
      await db.insert(categories).values({
        id: 'test-tax-cat',
        key: 'test-taxonomy',
        nameFr: 'Test Taxonomie',
        nameEn: 'Test Taxonomy',
        slugFr: 'test-taxonomie',
        slugEn: 'test-taxonomy',
        icon: 'Tag',
        color: '#00FF00',
      });

      await db.insert(articles).values({
        id: 'test-tax-article',
        categoryId: 'test-tax-cat',
        complexity: 'advanced',
        status: 'published',
      });

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-tax-article'));

      expect(results[0].categoryId).toBe('test-tax-cat');
    });

    it('should query articles by category', async () => {
      await db.insert(categories).values({
        id: 'test-tax-cat',
        key: 'query-test',
        nameFr: 'Query Test',
        nameEn: 'Query Test',
        slugFr: 'query-test',
        slugEn: 'query-test',
        icon: 'Search',
        color: '#0000FF',
      });

      await db.insert(articles).values({
        id: 'test-tax-article',
        categoryId: 'test-tax-cat',
        complexity: 'beginner',
        status: 'published',
      });

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.categoryId, 'test-tax-cat'));

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-tax-article');
    });
  });
});
