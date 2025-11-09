/**
 * Unit tests for database validation module
 *
 * Tests auto-generated Zod schemas, custom refinements, partial schemas,
 * validation helpers, and error formatting utilities.
 */

import { describe, it, expect } from 'vitest'
import {
	insertArticleSchema,
	insertArticleTranslationSchema,
	selectArticleSchema,
	selectArticleTranslationSchema,
	updateArticleSchema,
	updateArticleTranslationSchema,
	validateArticleInsert,
	validateTranslationInsert,
	validateArticleUpdate,
	validateTranslationUpdate,
	formatZodErrors
} from './validation'

// ============================================================================
// AUTO-GENERATED SCHEMAS - ENUM VALIDATION
// ============================================================================

describe('Auto-generated Schemas', () => {
	describe('insertArticleSchema', () => {
		it('should reject invalid complexity enum', () => {
			const invalidArticle = {
				categoryId: 'cat-1',
				complexity: 'invalid_complexity',
				status: 'draft'
			}

			const result = insertArticleSchema.safeParse(invalidArticle)
			expect(result.success).toBe(false)
		})

		it('should reject invalid status enum', () => {
			const invalidArticle = {
				categoryId: 'cat-1',
				complexity: 'intermediate',
				status: 'invalid_status'
			}

			const result = insertArticleSchema.safeParse(invalidArticle)
			expect(result.success).toBe(false)
		})
	})
})

// ============================================================================
// SELECT SCHEMAS
// ============================================================================

describe('Select Schemas', () => {
	it('should validate valid selected article', () => {
		const validArticle = {
			id: 'art-1',
			categoryId: 'cat-1',
			complexity: 'beginner',
			status: 'published',
			publishedAt: new Date(),
			coverImage: '/image.jpg',
			createdAt: new Date(),
			updatedAt: new Date()
		}

		const result = selectArticleSchema.safeParse(validArticle)
		expect(result.success).toBe(true)
	})

	it('should validate valid selected translation', () => {
		const validTranslation = {
			id: 'trans-1',
			articleId: 'art-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'mon-article',
			excerpt: 'Description',
			seoTitle: 'SEO',
			seoDescription: 'SEO Desc',
			contentMdx: '# Content',
			createdAt: new Date(),
			updatedAt: new Date()
		}

		const result = selectArticleTranslationSchema.safeParse(validTranslation)
		expect(result.success).toBe(true)
	})
})

// ============================================================================
// PARTIAL SCHEMAS
// ============================================================================

describe('Partial Schemas for Updates', () => {
	it('should allow partial article update', () => {
		const partialUpdate = {
			status: 'published'
		}

		const result = updateArticleSchema.safeParse(partialUpdate)
		expect(result.success).toBe(true)
	})

	it('should allow empty update object for articles', () => {
		const emptyUpdate = {}

		const result = updateArticleSchema.safeParse(emptyUpdate)
		expect(result.success).toBe(true)
	})

	it('should allow empty update object for translations', () => {
		const emptyUpdate = {}

		const result = updateArticleTranslationSchema.safeParse(emptyUpdate)
		expect(result.success).toBe(true)
	})

	it('should allow partial article translation update with title only', () => {
		const partialUpdate = {
			title: 'Updated Title'
		}

		const result = updateArticleTranslationSchema.safeParse(partialUpdate)
		expect(result.success).toBe(true)
	})

	it('should allow partial article translation update with slug only', () => {
		const partialUpdate = {
			slug: 'updated-slug'
		}

		const result = updateArticleTranslationSchema.safeParse(partialUpdate)
		expect(result.success).toBe(true)
	})
})

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

describe('Validation Helpers', () => {
	describe('validateArticleInsert', () => {
		it('should return errors for invalid article data', () => {
			const invalidArticle = {
				complexity: 'invalid',
				status: 'draft'
			}

			const result = validateArticleInsert(invalidArticle)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.errors).toBeDefined()
			}
		})
	})

	describe('validateArticleUpdate', () => {
		it('should return success for partial article update', () => {
			const partialUpdate = {
				status: 'published'
			}

			const result = validateArticleUpdate(partialUpdate)
			expect(result.success).toBe(true)
		})

		it('should return success for empty update object', () => {
			const emptyUpdate = {}

			const result = validateArticleUpdate(emptyUpdate)
			expect(result.success).toBe(true)
		})
	})

	describe('validateTranslationUpdate', () => {
		it('should return success for partial translation update', () => {
			const partialUpdate = {
				title: 'Updated Title'
			}

			const result = validateTranslationUpdate(partialUpdate)
			expect(result.success).toBe(true)
		})

		it('should reject invalid slug even in partial update', () => {
			const partialUpdate = {
				slug: 'Invalid_Slug'
			}

			const result = validateTranslationUpdate(partialUpdate)
			expect(result.success).toBe(false)
		})
	})

	describe('validateTranslationInsert', () => {
		it('should return errors for invalid slug in translation', () => {
			const invalidTranslation = {
				articleId: 'art-1',
				language: 'fr',
				title: 'Mon Article',
				slug: 'Invalid-Slug',
				excerpt: 'Description',
				seoTitle: 'SEO',
				seoDescription: 'SEO Desc',
				contentMdx: '# Content'
			}

			const result = validateTranslationInsert(invalidTranslation)
			expect(result.success).toBe(false)
		})
	})
})

// ============================================================================
// VALIDATION - SLUG FORMAT
// ============================================================================

describe('Slug Format Validation', () => {
	it('should reject slug with uppercase', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'Mon-Article',
			excerpt: 'Description',
			seoTitle: 'SEO Title',
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

	it('should reject slug with spaces', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'mon article',
			excerpt: 'Description',
			seoTitle: 'SEO Title',
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

	it('should reject slug with underscores', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'mon_article',
			excerpt: 'Description',
			seoTitle: 'SEO Title',
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

})

// ============================================================================
// VALIDATION - STRING LENGTH CONSTRAINTS
// ============================================================================

describe('String Length Validation', () => {
	it('should reject title exceeding 200 characters', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'a'.repeat(201),
			slug: 'valid-slug',
			excerpt: 'Description',
			seoTitle: 'SEO Title',
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

	it('should reject excerpt exceeding 500 characters', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'valid-slug',
			excerpt: 'a'.repeat(501),
			seoTitle: 'SEO Title',
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

	it('should reject SEO title exceeding 60 characters', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'valid-slug',
			excerpt: 'Description',
			seoTitle: 'a'.repeat(61),
			seoDescription: 'SEO Description',
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})

	it('should reject SEO description exceeding 160 characters', () => {
		const invalidData = {
			articleId: 'article-1',
			language: 'fr',
			title: 'Mon Article',
			slug: 'valid-slug',
			excerpt: 'Description',
			seoTitle: 'SEO Title',
			seoDescription: 'a'.repeat(161),
			contentMdx: '# Content'
		}

		const result = validateTranslationInsert(invalidData)
		expect(result.success).toBe(false)
	})
})

// ============================================================================
// ERROR FORMATTING
// ============================================================================

describe('Error Formatting', () => {
	it('should export formatZodErrors function', () => {
		// Verify the function is exported and callable
		expect(typeof formatZodErrors).toBe('function')
	})
})

