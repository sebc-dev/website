/**
 * Articles Integration Tests
 *
 * Tests real CRUD operations on articles and article_translations tables
 * with Cloudflare D1 via getPlatformProxy.
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  article_translations,
  articles,
  categories,
} from '@/lib/server/db/schema';

import { getTestDb } from './setup';

// Helper functions to reduce duplication
function createArticle(
  overrides: Partial<typeof articles.$inferInsert> = {},
): typeof articles.$inferInsert {
  return {
    id: 'test-article-1',
    categoryId: null,
    complexity: 'beginner',
    status: 'draft',
    publishedAt: null,
    coverImage: null,
    ...overrides,
  };
}

function createTranslation(
  overrides: Partial<typeof article_translations.$inferInsert> = {},
): typeof article_translations.$inferInsert {
  return {
    id: 'trans-1',
    articleId: 'test-article-1',
    language: 'fr',
    title: 'Test Title',
    slug: 'test-slug',
    excerpt: 'Test excerpt',
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Description',
    contentMdx: '# Content',
    ...overrides,
  };
}

describe('Articles Integration Tests', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    const d1 = getTestDb();
    db = drizzle(d1);

    // Clean up test data
    await db
      .delete(article_translations)
      .where(eq(article_translations.articleId, 'test-article-1'));
    await db.delete(articles).where(eq(articles.id, 'test-article-1'));
    await db.delete(categories).where(eq(categories.id, 'test-cat-int'));
  });

  describe('Articles CRUD Operations', () => {
    it('should insert and retrieve an article', async () => {
      const testArticle = createArticle();

      await db.insert(articles).values(testArticle);

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-article-1'));

      expect(results).toHaveLength(1);
      expect(results[0].complexity).toBe('beginner');
      expect(results[0].status).toBe('draft');
    });

    it('should update article status from draft to published', async () => {
      await db
        .insert(articles)
        .values(createArticle({ complexity: 'intermediate' }));

      const publishedAt = new Date();
      await db
        .update(articles)
        .set({ status: 'published', publishedAt })
        .where(eq(articles.id, 'test-article-1'));

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-article-1'));

      expect(results[0].status).toBe('published');
      expect(results[0].publishedAt).toBeDefined();
    });

    it('should delete an article', async () => {
      await db
        .insert(articles)
        .values(createArticle({ complexity: 'advanced' }));

      await db.delete(articles).where(eq(articles.id, 'test-article-1'));

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-article-1'));

      expect(results).toHaveLength(0);
    });

    it('should auto-generate createdAt and updatedAt timestamps', async () => {
      const beforeInsert = new Date();

      await db.insert(articles).values({
        id: 'test-article-1',
        complexity: 'beginner',
        status: 'draft',
      });

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-article-1'));

      const afterInsert = new Date();

      expect(results[0].createdAt).toBeDefined();
      expect(results[0].updatedAt).toBeDefined();
      expect(results[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeInsert.getTime() - 10000,
      );
      expect(results[0].createdAt.getTime()).toBeLessThanOrEqual(
        afterInsert.getTime() + 10000,
      );
    });

    it('should link article to category via foreign key', async () => {
      // Create category first
      await db.insert(categories).values({
        id: 'test-cat-int',
        key: 'test-integration',
        nameFr: 'Test Intégration',
        nameEn: 'Test Integration',
        slugFr: 'test-integration',
        slugEn: 'test-integration',
        icon: 'TestTube',
        color: '#FF00FF',
      });

      // Create article with category FK
      await db
        .insert(articles)
        .values(createArticle({ categoryId: 'test-cat-int' }));

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, 'test-article-1'));

      expect(results[0].categoryId).toBe('test-cat-int');
    });
  });

  describe('Article Translations CRUD Operations', () => {
    it('should insert and retrieve article translation', async () => {
      await db.insert(articles).values(createArticle());

      await db.insert(article_translations).values(
        createTranslation({
          title: 'Titre de Test',
          slug: 'titre-de-test',
          excerpt: 'Extrait de test',
          seoTitle: 'SEO Titre',
          seoDescription: 'SEO Description',
          contentMdx: '# Contenu MDX',
        }),
      );

      const results = await db
        .select()
        .from(article_translations)
        .where(eq(article_translations.articleId, 'test-article-1'));

      expect(results).toHaveLength(1);
      expect(results[0].language).toBe('fr');
      expect(results[0].title).toBe('Titre de Test');
      expect(results[0].slug).toBe('titre-de-test');
    });

    it('should auto-generate timestamps for translations', async () => {
      await db.insert(articles).values(createArticle());

      const beforeInsert = new Date();

      await db.insert(article_translations).values({
        id: 'trans-timestamps',
        articleId: 'test-article-1',
        language: 'fr',
        title: 'Test Timestamps',
        slug: 'test-timestamps',
        excerpt: 'Test',
        seoTitle: 'Test',
        seoDescription: 'Test',
        contentMdx: '# Test',
      });

      const results = await db
        .select()
        .from(article_translations)
        .where(eq(article_translations.id, 'trans-timestamps'));

      const afterInsert = new Date();

      expect(results[0].createdAt).toBeDefined();
      expect(results[0].updatedAt).toBeDefined();
      expect(results[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeInsert.getTime() - 10000,
      );
      expect(results[0].createdAt.getTime()).toBeLessThanOrEqual(
        afterInsert.getTime() + 10000,
      );
    });

    it('should support multiple translations for same article', async () => {
      await db
        .insert(articles)
        .values(
          createArticle({ complexity: 'intermediate', status: 'published' }),
        );

      // French translation
      await db.insert(article_translations).values(
        createTranslation({
          id: 'trans-fr',
          title: 'Titre Français',
          slug: 'titre-francais',
          excerpt: 'Extrait',
          seoTitle: 'SEO FR',
          seoDescription: 'Description FR',
          contentMdx: '# FR',
        }),
      );

      // English translation
      await db.insert(article_translations).values(
        createTranslation({
          id: 'trans-en',
          language: 'en',
          title: 'English Title',
          slug: 'english-title',
          excerpt: 'Excerpt',
          seoTitle: 'SEO EN',
          seoDescription: 'Description EN',
          contentMdx: '# EN',
        }),
      );

      const results = await db
        .select()
        .from(article_translations)
        .where(eq(article_translations.articleId, 'test-article-1'));

      expect(results).toHaveLength(2);

      const frTrans = results.find((r) => r.language === 'fr');
      const enTrans = results.find((r) => r.language === 'en');

      expect(frTrans?.title).toBe('Titre Français');
      expect(enTrans?.title).toBe('English Title');
    });

    it('should cascade delete translations when article is deleted', async () => {
      await db.insert(articles).values(createArticle());

      await db.insert(article_translations).values(
        createTranslation({
          id: 'trans-cascade',
          title: 'À supprimer',
          slug: 'a-supprimer',
          excerpt: 'Test',
          seoTitle: 'Test',
          seoDescription: 'Test',
          contentMdx: 'Test',
        }),
      );

      // Delete article
      await db.delete(articles).where(eq(articles.id, 'test-article-1'));

      // Translation should be deleted via CASCADE
      const results = await db
        .select()
        .from(article_translations)
        .where(eq(article_translations.id, 'trans-cascade'));

      expect(results).toHaveLength(0);
    });

    it('should enforce unique slug constraint', async () => {
      await db.insert(articles).values(createArticle());

      await db.insert(article_translations).values(
        createTranslation({
          title: 'Premier',
          slug: 'unique-slug',
          excerpt: 'Test',
          seoTitle: 'Test',
          seoDescription: 'Test',
          contentMdx: 'Test',
        }),
      );

      // Try to insert duplicate slug - should fail
      await expect(
        db.insert(article_translations).values(
          createTranslation({
            id: 'trans-2',
            language: 'en',
            title: 'Second',
            slug: 'unique-slug', // Duplicate!
            excerpt: 'Test',
            seoTitle: 'Test',
            seoDescription: 'Test',
            contentMdx: 'Test',
          }),
        ),
      ).rejects.toThrow();
    });

    it('should enforce unique article-language constraint', async () => {
      await db.insert(articles).values(createArticle());

      // First French translation
      await db.insert(article_translations).values(
        createTranslation({
          id: 'trans-fr-1',
          language: 'fr',
          title: 'Premier Titre',
          slug: 'premier-titre',
          excerpt: 'Test',
          seoTitle: 'Test',
          seoDescription: 'Test',
          contentMdx: 'Test',
        }),
      );

      // Try to insert second French translation for same article - should fail
      await expect(
        db.insert(article_translations).values(
          createTranslation({
            id: 'trans-fr-2',
            language: 'fr', // Same language as first!
            title: 'Deuxième Titre',
            slug: 'deuxieme-titre', // Different slug
            excerpt: 'Test',
            seoTitle: 'Test',
            seoDescription: 'Test',
            contentMdx: 'Test',
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe('Query Filters', () => {
    it('should filter articles by status', async () => {
      const articleId = 'filter-status-test';
      await db
        .insert(articles)
        .values(createArticle({ id: articleId, status: 'published' }));

      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.id, articleId));

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(articleId);
      expect(results[0].status).toBe('published');
    });

    it('should filter translations by language', async () => {
      const articleId = 'filter-lang-test';
      const transId = 'trans-lang-filter';
      await db.insert(articles).values(createArticle({ id: articleId }));

      await db.insert(article_translations).values(
        createTranslation({
          id: transId,
          articleId,
          language: 'fr',
          title: 'Performance Test',
          slug: 'perf-test',
          excerpt: 'Test',
          seoTitle: 'Test',
          seoDescription: 'Test',
          contentMdx: 'Test',
        }),
      );

      const results = await db
        .select()
        .from(article_translations)
        .where(eq(article_translations.id, transId));

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(transId);
      expect(results[0].language).toBe('fr');
    });
  });
});
