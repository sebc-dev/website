/**
 * Article Schema Integration Tests
 *
 * Comprehensive test suite for validating the articles and article_translations
 * database schema through Zod validation schemas. Tests actual validation behavior
 * instead of just static type definitions.
 *
 * These tests verify:
 * - Zod schema validation with valid and invalid data
 * - ENUM constraints enforcement
 * - String length constraints (titles, excerpts, SEO fields)
 * - Slug format validation (lowercase, alphanumeric, hyphens)
 * - Required vs optional fields
 * - Partial update schemas
 *
 * @see docs/specs/epics/epic_0/story_0_4/implementation/phase_2/
 * @see /docs/specs/epics/epic_0/story_0_4/implementation/phase_2/guides/TESTING.md
 */

import { describe, expect, it } from 'vitest';

import {
  ComplexityEnum,
  LanguageEnum,
  StatusEnum,
} from '@/lib/server/db/schema';
import {
  insertArticleSchema,
  insertArticleTranslationSchema,
  updateArticleSchema,
  updateArticleTranslationSchema,
} from '@/lib/server/db/validation';

describe('Articles Schema Validation Tests', () => {
  /**
   * Test Suite 1: ENUM Validation
   *
   * Validates that ENUM constraints are enforced by Zod schemas.
   */
  describe('Suite 1: ENUM Validation', () => {
    it('should accept valid complexity values', () => {
      ComplexityEnum.forEach((complexity) => {
        const result = insertArticleSchema.safeParse({
          complexity,
          status: 'draft',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid complexity value', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'invalid',
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid status values', () => {
      StatusEnum.forEach((status) => {
        const result = insertArticleSchema.safeParse({
          complexity: 'beginner',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status value', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid language values in translations', () => {
      LanguageEnum.forEach((language) => {
        const result = insertArticleTranslationSchema.safeParse({
          articleId: 'art-1',
          language,
          title: 'Test Title',
          slug: 'test-slug',
          excerpt: 'Test excerpt',
          seoTitle: 'SEO Title',
          seoDescription: 'SEO Description',
          contentMdx: '# Content',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid language value', () => {
      const result = insertArticleTranslationSchema.safeParse({
        articleId: 'art-1',
        language: 'invalid',
        title: 'Test Title',
        slug: 'test-slug',
        excerpt: 'Test excerpt',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        contentMdx: '# Content',
      });
      expect(result.success).toBe(false);
    });
  });

  /**
   * Test Suite 2: Articles Table Validation
   *
   * Validates article insert and update schemas.
   */
  describe('Suite 2: Articles Table Validation', () => {
    it('should validate minimal valid article', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });

    it('should validate complete article with all fields', () => {
      const result = insertArticleSchema.safeParse({
        id: 'article-1',
        categoryId: 'cat-1',
        complexity: 'intermediate',
        status: 'published',
        publishedAt: new Date(),
        coverImage: '/images/cover.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null categoryId', () => {
      const result = insertArticleSchema.safeParse({
        categoryId: null,
        complexity: 'advanced',
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null publishedAt for drafts', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'draft',
        publishedAt: null,
      });
      expect(result.success).toBe(true);
    });

    it('should allow partial updates with empty object', () => {
      const result = updateArticleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow partial updates with single field', () => {
      const result = updateArticleSchema.safeParse({
        status: 'published',
      });
      expect(result.success).toBe(true);
    });
  });

  /**
   * Test Suite 3: Translation Slug Validation
   *
   * Validates slug format constraints (lowercase, alphanumeric, hyphens only).
   */
  describe('Suite 3: Translation Slug Validation', () => {
    const validTranslation = {
      articleId: 'art-1',
      language: 'fr',
      title: 'Test Title',
      excerpt: 'Test excerpt',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      contentMdx: '# Content',
    };

    it('should accept valid slug with lowercase and hyphens', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: 'valid-slug-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject slug with uppercase letters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: 'Invalid-Slug',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject slug with spaces', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: 'invalid slug',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject slug with underscores', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: 'invalid_slug',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject slug with special characters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: 'invalid@slug!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty slug', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        slug: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });
  });

  /**
   * Test Suite 4: String Length Constraints
   *
   * Validates max length constraints for all string fields.
   */
  describe('Suite 4: String Length Constraints', () => {
    const validTranslation = {
      articleId: 'art-1',
      language: 'fr',
      slug: 'test-slug',
      contentMdx: '# Content',
    };

    it('should accept title at max length (200 chars)', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'a'.repeat(200),
        excerpt: 'Test excerpt',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(true);
    });

    it('should reject title exceeding 200 characters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'a'.repeat(201),
        excerpt: 'Test excerpt',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200');
      }
    });

    it('should accept excerpt at max length (500 chars)', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'a'.repeat(500),
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(true);
    });

    it('should reject excerpt exceeding 500 characters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'a'.repeat(501),
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500');
      }
    });

    it('should accept SEO title at max length (60 chars)', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'Test excerpt',
        seoTitle: 'a'.repeat(60),
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(true);
    });

    it('should reject SEO title exceeding 60 characters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'Test excerpt',
        seoTitle: 'a'.repeat(61),
        seoDescription: 'SEO Description',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('60');
      }
    });

    it('should accept SEO description at max length (160 chars)', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'Test excerpt',
        seoTitle: 'SEO Title',
        seoDescription: 'a'.repeat(160),
      });
      expect(result.success).toBe(true);
    });

    it('should reject SEO description exceeding 160 characters', () => {
      const result = insertArticleTranslationSchema.safeParse({
        ...validTranslation,
        title: 'Test Title',
        excerpt: 'Test excerpt',
        seoTitle: 'SEO Title',
        seoDescription: 'a'.repeat(161),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('160');
      }
    });
  });

  /**
   * Test Suite 5: Required vs Optional Fields
   *
   * Validates which fields are required vs optional.
   */
  describe('Suite 5: Required vs Optional Fields', () => {
    it('should require complexity for articles (status has default)', () => {
      const result = insertArticleSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.issues.map((i) => i.path[0]);
        expect(fieldErrors).toContain('complexity');
        // status has a default value of 'draft', so it's not required
      }
    });

    it('should require all content fields for translations', () => {
      const result = insertArticleTranslationSchema.safeParse({
        articleId: 'art-1',
        language: 'fr',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.issues.map((i) => i.path[0]);
        expect(fieldErrors).toContain('title');
        expect(fieldErrors).toContain('slug');
        expect(fieldErrors).toContain('excerpt');
        expect(fieldErrors).toContain('seoTitle');
        expect(fieldErrors).toContain('seoDescription');
        expect(fieldErrors).toContain('contentMdx');
      }
    });

    it('should not require categoryId for articles', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'draft',
        // categoryId omitted
      });
      expect(result.success).toBe(true);
    });

    it('should not require publishedAt for articles', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'draft',
        // publishedAt omitted
      });
      expect(result.success).toBe(true);
    });
  });

  /**
   * Test Suite 6: Partial Update Schemas
   *
   * Validates that update schemas allow partial data.
   */
  describe('Suite 6: Partial Update Schemas', () => {
    it('should allow partial article update with single field', () => {
      const result = updateArticleSchema.safeParse({
        status: 'published',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty update object for articles', () => {
      const result = updateArticleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow partial translation update with title only', () => {
      const result = updateArticleTranslationSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should allow partial translation update with slug only', () => {
      const result = updateArticleTranslationSchema.safeParse({
        slug: 'updated-slug',
      });
      expect(result.success).toBe(true);
    });

    it('should still enforce slug format in partial updates', () => {
      const result = updateArticleTranslationSchema.safeParse({
        slug: 'Invalid_Slug',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should still enforce length constraints in partial updates', () => {
      const result = updateArticleTranslationSchema.safeParse({
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200');
      }
    });

    it('should allow empty update object for translations', () => {
      const result = updateArticleTranslationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  /**
   * Test Suite 7: Edge Cases
   *
   * Validates edge cases and boundary conditions.
   */
  describe('Suite 7: Edge Cases', () => {
    it('should accept minimum valid translation', () => {
      const result = insertArticleTranslationSchema.safeParse({
        articleId: 'a',
        language: 'fr',
        title: 'T',
        slug: 't',
        excerpt: 'E',
        seoTitle: 'S',
        seoDescription: 'D',
        contentMdx: 'C',
      });
      expect(result.success).toBe(true);
    });

    it('should accept slug with only numbers', () => {
      const result = insertArticleTranslationSchema.safeParse({
        articleId: 'art-1',
        language: 'fr',
        title: 'Test',
        slug: '123',
        excerpt: 'Test',
        seoTitle: 'Test',
        seoDescription: 'Test',
        contentMdx: 'Test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept slug with only hyphens and numbers', () => {
      const result = insertArticleTranslationSchema.safeParse({
        articleId: 'art-1',
        language: 'fr',
        title: 'Test',
        slug: '123-456-789',
        excerpt: 'Test',
        seoTitle: 'Test',
        seoDescription: 'Test',
        contentMdx: 'Test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept article with all nullable fields as null', () => {
      const result = insertArticleSchema.safeParse({
        complexity: 'beginner',
        status: 'draft',
        categoryId: null,
        publishedAt: null,
        coverImage: null,
      });
      expect(result.success).toBe(true);
    });
  });
});
