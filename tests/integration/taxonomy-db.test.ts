/**
 * Taxonomy Integration Tests
 *
 * Tests real CRUD operations on categories, tags, and articleTags tables
 * with Cloudflare D1 via getPlatformProxy.
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  articles,
  articleTags,
  categories,
  tags,
} from '@/lib/server/db/schema';

import { getTestDb } from './setup';

// Helper to setup article with tags for testing
type TagConfig = {
  id: string;
  nameFr: string;
  nameEn: string;
};

async function setupArticleWithTags(
  db: ReturnType<typeof drizzle>,
  articleId: string,
  tagConfigs: TagConfig[],
  articleOptions?: {
    complexity?: 'beginner' | 'intermediate' | 'advanced';
    status?: 'draft' | 'published';
  },
) {
  const { complexity = 'beginner', status = 'draft' } = articleOptions || {};

  await db.insert(articles).values({
    id: articleId,
    complexity,
    status,
  });

  for (const tag of tagConfigs) {
    await db.insert(tags).values(tag);
  }

  if (tagConfigs.length > 0) {
    await db.insert(articleTags).values(
      tagConfigs.map((tag) => ({
        articleId,
        tagId: tag.id,
      })),
    );
  }
}

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
      await setupArticleWithTags(db, 'test-tax-article', [
        { id: 'test-tag-1', nameFr: 'React', nameEn: 'React' },
      ]);

      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, 'test-tax-article'));

      expect(results).toHaveLength(1);
      expect(results[0].tagId).toBe('test-tag-1');
    });

    it('should support multiple tags per article', async () => {
      await setupArticleWithTags(
        db,
        'test-tax-article',
        [
          { id: 'test-tag-1', nameFr: 'React', nameEn: 'React' },
          { id: 'test-tag-2', nameFr: 'TypeScript', nameEn: 'TypeScript' },
        ],
        { complexity: 'intermediate', status: 'published' },
      );

      const results = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, 'test-tax-article'));

      expect(results).toHaveLength(2);
    });

    it('should cascade delete articleTags when article is deleted', async () => {
      await setupArticleWithTags(db, 'test-tax-article', [
        { id: 'test-tag-1', nameFr: 'Test', nameEn: 'Test' },
      ]);

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
      await setupArticleWithTags(db, 'test-tax-article', [
        { id: 'test-tag-1', nameFr: 'Test', nameEn: 'Test' },
      ]);

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
      await setupArticleWithTags(db, 'test-tax-article', [
        { id: 'test-tag-1', nameFr: 'Test', nameEn: 'Test' },
      ]);

      // Try to insert duplicate - should fail (composite PK)
      await expect(
        db.insert(articleTags).values({
          articleId: 'test-tax-article',
          tagId: 'test-tag-1',
        }),
      ).rejects.toThrow(/Failed query:.*article_tags/);
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

    it('should prevent category deletion when referenced by articles', async () => {
      await db.insert(categories).values({
        id: 'test-cat-delete',
        key: 'delete-test',
        nameFr: 'Delete Test',
        nameEn: 'Delete Test',
        slugFr: 'delete-test',
        slugEn: 'delete-test',
        icon: 'Trash',
        color: '#FF0000',
      });

      await db.insert(articles).values({
        id: 'test-article-with-cat',
        categoryId: 'test-cat-delete',
        complexity: 'intermediate',
        status: 'draft',
      });

      // Attempt to delete category - should fail due to FK constraint
      await expect(
        db.delete(categories).where(eq(categories.id, 'test-cat-delete')),
      ).rejects.toThrow(/Failed query:.*categories/);
    });
  });
});
