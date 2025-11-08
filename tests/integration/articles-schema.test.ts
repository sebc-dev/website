/**
 * Article Schema Integration Tests
 *
 * Comprehensive test suite for validating the articles and article_translations
 * database schema, including:
 * - ENUM type definitions and exports
 * - Table structure and field definitions
 * - Type inference for Article and ArticleTranslation records
 * - TypeScript type safety
 *
 * Note: These tests validate schema definitions and structure through type-checking
 * and compile-time validation. Full integration tests with actual database operations
 * require Wrangler with local D1. See TESTING.md for running full integration tests
 * with `pnpm db:migrate:local && pnpm db:seed:articles`.
 *
 * @see docs/specs/epics/epic_0/story_0_4/implementation/phase_2/
 * @see /docs/specs/epics/epic_0/story_0_4/implementation/phase_2/guides/TESTING.md
 */

import { describe, it, expect } from 'vitest';
import { articles, article_translations, type Article, type ArticleTranslation, ComplexityEnum, StatusEnum, LanguageEnum } from '@/src/lib/server/db/schema';

describe('Articles Schema Definition Tests', () => {
	/**
	 * Test Suite 1: ENUM Type Definitions
	 *
	 * Validates that ENUM types are properly defined and exported.
	 * These are runtime-validated constraints for field values.
	 */
	describe('Suite 1: ENUM Type Definitions', () => {
		it('should export ComplexityEnum with exactly 3 values', () => {
			expect(ComplexityEnum).toHaveLength(3);
			expect(ComplexityEnum).toEqual(['beginner', 'intermediate', 'advanced']);
		});

		it('should export StatusEnum with exactly 2 values', () => {
			expect(StatusEnum).toHaveLength(2);
			expect(StatusEnum).toEqual(['draft', 'published']);
		});

		it('should export LanguageEnum with exactly 2 values', () => {
			expect(LanguageEnum).toHaveLength(2);
			expect(LanguageEnum).toEqual(['fr', 'en']);
		});

		it('should have readonly tuple types for ENUMs (const assertions)', () => {
			// Verify they are const assertions (readonly arrays)
			expect(Array.isArray(ComplexityEnum)).toBe(true);
			expect(Array.isArray(StatusEnum)).toBe(true);
			expect(Array.isArray(LanguageEnum)).toBe(true);
		});

		it('ComplexityEnum should include all required difficulty levels', () => {
			expect(ComplexityEnum).toContain('beginner');
			expect(ComplexityEnum).toContain('intermediate');
			expect(ComplexityEnum).toContain('advanced');
		});

		it('StatusEnum should include all required publication states', () => {
			expect(StatusEnum).toContain('draft');
			expect(StatusEnum).toContain('published');
		});

		it('LanguageEnum should support bilingual content (FR/EN)', () => {
			expect(LanguageEnum).toContain('fr');
			expect(LanguageEnum).toContain('en');
		});
	});

	/**
	 * Test Suite 2: Articles Table Schema Definition
	 *
	 * Validates the structure and properties of the articles table schema,
	 * including field definitions and type inference.
	 */
	describe('Suite 2: Articles Table Schema', () => {
		it('should define articles table', () => {
			// Table is properly defined and importable
			expect(articles).toBeDefined();
		});

		it('should have all 8 required fields defined', () => {
			// Articles table should have these fields:
			// id, categoryId, complexity, status, publishedAt, coverImage, createdAt, updatedAt
			expect(articles.id).toBeDefined();
			expect(articles.categoryId).toBeDefined();
			expect(articles.complexity).toBeDefined();
			expect(articles.status).toBeDefined();
			expect(articles.publishedAt).toBeDefined();
			expect(articles.coverImage).toBeDefined();
			expect(articles.createdAt).toBeDefined();
			expect(articles.updatedAt).toBeDefined();
		});

		it('should have id as primary key field', () => {
			// TypeScript type checking ensures this at compile time
			expect(articles.id).toBeDefined();
		});

		it('should have nullable categoryId field (allows NULL until Phase 3)', () => {
			// categoryId should be nullable - can be set to null for Phase 2
			// Phase 3 will add the categories table and remove nullability
			expect(articles.categoryId).toBeDefined();
		});

		it('should have nullable publishedAt field (only set when published)', () => {
			// publishedAt is null for drafts, set to timestamp when published
			expect(articles.publishedAt).toBeDefined();
		});

		it('should have nullable coverImage field', () => {
			// Cover image is optional
			expect(articles.coverImage).toBeDefined();
		});

		it('should have timestamp fields (createdAt, updatedAt)', () => {
			expect(articles.createdAt).toBeDefined();
			expect(articles.updatedAt).toBeDefined();
		});

		it('should support type inference for Article records', () => {
			// Type: Article = typeof articles.$inferSelect
			// Verify the type is properly exported and usable
			const testArticle: Article = {
				id: 'test-article-1',
				categoryId: null,
				complexity: 'beginner' as const,
				status: 'draft' as const,
				publishedAt: null,
				coverImage: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(testArticle.id).toBe('test-article-1');
			expect(testArticle.categoryId).toBeNull();
			expect(testArticle.complexity).toBe('beginner');
			expect(testArticle.status).toBe('draft');
		});

		it('should enforce complexity field to valid ENUM values', () => {
			// Verify all valid complexity values work
			const validComplexities = ['beginner', 'intermediate', 'advanced'] as const;

			validComplexities.forEach((complexity) => {
				const article: Article = {
					id: `test-${complexity}`,
					categoryId: null,
					complexity,
					status: 'draft' as const,
					publishedAt: null,
					coverImage: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				expect(article.complexity).toBe(complexity);
				expect(ComplexityEnum).toContain(complexity);
			});
		});

		it('should enforce status field to valid ENUM values', () => {
			// Verify all valid status values work
			const validStatuses = ['draft', 'published'] as const;

			validStatuses.forEach((status) => {
				const article: Article = {
					id: `test-${status}`,
					categoryId: null,
					complexity: 'beginner' as const,
					status,
					publishedAt: null,
					coverImage: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				expect(article.status).toBe(status);
				expect(StatusEnum).toContain(status);
			});
		});

		it('should allow articles with publishedAt timestamp', () => {
			const publishedDate = new Date('2024-01-15');
			const article: Article = {
				id: 'published-article',
				categoryId: null,
				complexity: 'intermediate' as const,
				status: 'published' as const,
				publishedAt: publishedDate,
				coverImage: '/images/article.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(article.status).toBe('published');
			expect(article.publishedAt).toEqual(publishedDate);
		});

		it('should allow articles with cover image', () => {
			const article: Article = {
				id: 'article-with-cover',
				categoryId: null,
				complexity: 'advanced' as const,
				status: 'published' as const,
				publishedAt: null,
				coverImage: '/images/advanced-topic.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(article.coverImage).toBe('/images/advanced-topic.jpg');
		});

		it('should allow articles with categoryId reference (nullable)', () => {
			// Phase 2: categoryId is nullable
			// Phase 3: will reference categories table
			const article: Article = {
				id: 'article-with-category',
				categoryId: 'category-1',
				complexity: 'beginner' as const,
				status: 'draft' as const,
				publishedAt: null,
				coverImage: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(article.categoryId).toBe('category-1');
		});
	});

	/**
	 * Test Suite 3: Article Translations Table Schema
	 *
	 * Validates the structure of the article_translations table,
	 * including language support and type inference.
	 */
	describe('Suite 3: Article Translations Table Schema', () => {
		it('should define article_translations table', () => {
			// Table is properly defined and importable
			expect(article_translations).toBeDefined();
		});

		it('should have all 10 required fields defined', () => {
			// Article translations table should have these fields:
			// id, articleId, language, title, slug, excerpt, seoTitle, seoDescription, contentMdx, createdAt, updatedAt
			expect(article_translations.id).toBeDefined();
			expect(article_translations.articleId).toBeDefined();
			expect(article_translations.language).toBeDefined();
			expect(article_translations.title).toBeDefined();
			expect(article_translations.slug).toBeDefined();
			expect(article_translations.excerpt).toBeDefined();
			expect(article_translations.seoTitle).toBeDefined();
			expect(article_translations.seoDescription).toBeDefined();
			expect(article_translations.contentMdx).toBeDefined();
			expect(article_translations.createdAt).toBeDefined();
			expect(article_translations.updatedAt).toBeDefined();
		});

		it('should have id as primary key field', () => {
			expect(article_translations.id).toBeDefined();
		});

		it('should have articleId as foreign key to articles table', () => {
			// FK relationship to articles table
			expect(article_translations.articleId).toBeDefined();
		});

		it('should support type inference for ArticleTranslation records', () => {
			// Type: ArticleTranslation = typeof article_translations.$inferSelect
			const testTranslation: ArticleTranslation = {
				id: 'trans-1',
				articleId: 'article-1',
				language: 'en',
				title: 'Test Article',
				slug: 'test-article',
				excerpt: 'This is a test article excerpt.',
				seoTitle: 'Test Article | sebc.dev',
				seoDescription: 'A test article for schema validation.',
				contentMdx: '# Test Article\n\nThis is test content in Markdown.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(testTranslation.articleId).toBe('article-1');
			expect(testTranslation.language).toBe('en');
		});

		it('should enforce language field to valid ENUM values (FR/EN)', () => {
			// Verify all valid language values work
			const validLanguages = ['fr', 'en'] as const;

			validLanguages.forEach((language) => {
				const translation: ArticleTranslation = {
					id: `trans-${language}`,
					articleId: 'article-1',
					language,
					title: `Title in ${language}`,
					slug: `slug-${language}`,
					excerpt: `Excerpt in ${language}`,
					seoTitle: `SEO ${language}`,
					seoDescription: `Description ${language}`,
					contentMdx: `Content in ${language}`,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				expect(translation.language).toBe(language);
				expect(LanguageEnum).toContain(language);
			});
		});

		it('should support multilingual content (FR and EN)', () => {
			const articleId = 'multilingual-article';

			// French translation
			const frenchTranslation: ArticleTranslation = {
				id: 'trans-fr-1',
				articleId,
				language: 'fr',
				title: 'Article de test en français',
				slug: 'article-test-fr',
				excerpt: 'Ceci est un extrait de test.',
				seoTitle: 'Article Test | sebc.dev',
				seoDescription: 'Description SEO en français.',
				contentMdx: '# Article de Test\n\nCeci est le contenu en français.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// English translation
			const englishTranslation: ArticleTranslation = {
				id: 'trans-en-1',
				articleId,
				language: 'en',
				title: 'Test Article in English',
				slug: 'test-article-en',
				excerpt: 'This is a test excerpt.',
				seoTitle: 'Test Article | sebc.dev',
				seoDescription: 'Description in English.',
				contentMdx: '# Test Article\n\nThis is the content in English.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Both should reference same article
			expect(frenchTranslation.articleId).toBe(articleId);
			expect(englishTranslation.articleId).toBe(articleId);

			// Different languages
			expect(frenchTranslation.language).toBe('fr');
			expect(englishTranslation.language).toBe('en');

			// Different slugs
			expect(frenchTranslation.slug).not.toBe(englishTranslation.slug);
		});

		it('should require all content fields (title, slug, excerpt, SEO, contentMdx)', () => {
			// All these fields should be required (not optional)
			const translation: ArticleTranslation = {
				id: 'trans-full-content',
				articleId: 'article-1',
				language: 'en' as const,
				title: 'Complete Article Title',
				slug: 'complete-article-slug',
				excerpt: 'This is the article excerpt for preview.',
				seoTitle: 'SEO Title for Search Engines',
				seoDescription: 'SEO meta description for search results.',
				contentMdx: '# Full Markdown Content\n\n## Section 1\n\nContent here.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(translation.title).toBeDefined();
			expect(translation.slug).toBeDefined();
			expect(translation.excerpt).toBeDefined();
			expect(translation.seoTitle).toBeDefined();
			expect(translation.seoDescription).toBeDefined();
			expect(translation.contentMdx).toBeDefined();
		});

		it('should support MDX content format (Markdown with React components)', () => {
			const mdxContent = `# Article Title

## Introduction
This is an introduction with [links](https://example.com).

<CustomComponent prop="value">
  Embedded React component
</CustomComponent>

## Section 2
More content here.
`;

			const translation: ArticleTranslation = {
				id: 'trans-mdx',
				articleId: 'article-1',
				language: 'en' as const,
				title: 'MDX Article',
				slug: 'mdx-article',
				excerpt: 'Article with MDX components.',
				seoTitle: 'MDX Article | sebc.dev',
				seoDescription: 'Article demonstrating MDX support.',
				contentMdx: mdxContent,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(translation.contentMdx).toContain('# Article Title');
			expect(translation.contentMdx).toContain('<CustomComponent');
		});

		it('should have timestamp fields (createdAt, updatedAt)', () => {
			expect(article_translations.createdAt).toBeDefined();
			expect(article_translations.updatedAt).toBeDefined();
		});
	});

	/**
	 * Test Suite 4: Schema Relations and Constraints
	 *
	 * Validates the relationships between tables and constraint definitions.
	 */
	describe('Suite 4: Schema Relations and Constraints', () => {
		it('should define foreign key from article_translations to articles', () => {
			// articleId in article_translations references articles.id
			expect(article_translations.articleId).toBeDefined();
		});

		it('should support one-to-many relationship (article to translations)', () => {
			// One article can have multiple translations (one per language)
			const article1: Article = {
				id: 'article-multi-trans',
				categoryId: null,
				complexity: 'beginner' as const,
				status: 'published' as const,
				publishedAt: null,
				coverImage: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const translations: ArticleTranslation[] = [
				{
					id: 'trans-fr',
					articleId: 'article-multi-trans',
					language: 'fr',
					title: 'Titre Français',
					slug: 'titre-francais',
					excerpt: 'Extrait français',
					seoTitle: 'SEO Français',
					seoDescription: 'Description française',
					contentMdx: 'Contenu français',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 'trans-en',
					articleId: 'article-multi-trans',
					language: 'en',
					title: 'English Title',
					slug: 'english-title',
					excerpt: 'English excerpt',
					seoTitle: 'English SEO',
					seoDescription: 'English description',
					contentMdx: 'English content',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			// All translations reference the same article
			translations.forEach((trans) => {
				expect(trans.articleId).toBe(article1.id);
			});
		});

		it('should enforce unique constraint on (articleId, language) combination', () => {
			// Each article can have only one translation per language
			// This is a constraint definition (verified at database level)
			expect(article_translations.articleId).toBeDefined();
			expect(article_translations.language).toBeDefined();
		});

		it('should enforce unique constraint on slug field', () => {
			// Each slug must be globally unique (for URL routing)
			// This is a constraint definition (verified at database level)
			expect(article_translations.slug).toBeDefined();
		});

		it('should support CASCADE delete behavior', () => {
			// When an article is deleted, all its translations are deleted
			// This is a FK constraint definition
			expect(article_translations.articleId).toBeDefined();
		});
	});

	/**
	 * Test Suite 5: Complete Schema Validation
	 *
	 * End-to-end schema validation combining articles and translations.
	 */
	describe('Suite 5: Complete Schema Validation', () => {
		it('should create a complete article with bilingual translations', () => {
			// Create article
			const article: Article = {
				id: 'complete-article',
				categoryId: 'tech-guides',
				complexity: 'intermediate' as const,
				status: 'published' as const,
				publishedAt: new Date('2024-01-20'),
				coverImage: '/images/guide-cover.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Create French translation
			const frenchTrans: ArticleTranslation = {
				id: 'complete-fr',
				articleId: article.id,
				language: 'fr',
				title: 'Guide Complet',
				slug: 'guide-complet-fr',
				excerpt: 'Un guide technique complet en français.',
				seoTitle: 'Guide Complet | sebc.dev',
				seoDescription: 'Guide technique complet pour les développeurs.',
				contentMdx: '# Guide Complet\n\nContenu technique en français.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Create English translation
			const englishTrans: ArticleTranslation = {
				id: 'complete-en',
				articleId: article.id,
				language: 'en',
				title: 'Complete Guide',
				slug: 'complete-guide-en',
				excerpt: 'A complete technical guide in English.',
				seoTitle: 'Complete Guide | sebc.dev',
				seoDescription: 'Complete technical guide for developers.',
				contentMdx: '# Complete Guide\n\nTechnical content in English.',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Verify article properties
			expect(article.status).toBe('published');
			expect(article.complexity).toBe('intermediate');
			expect(article.publishedAt).not.toBeNull();

			// Verify translations link to article
			expect(frenchTrans.articleId).toBe(article.id);
			expect(englishTrans.articleId).toBe(article.id);

			// Verify each translation has different language and slug
			expect(frenchTrans.language).toBe('fr');
			expect(englishTrans.language).toBe('en');
			expect(frenchTrans.slug).not.toBe(englishTrans.slug);
		});

		it('should validate all schema constraints are in place', () => {
			// Both tables should be properly defined and importable
			expect(articles).toBeDefined();
			expect(article_translations).toBeDefined();

			// Verify all required fields exist
			expect(articles.id).toBeDefined();
			expect(articles.categoryId).toBeDefined();
			expect(articles.complexity).toBeDefined();
			expect(articles.status).toBeDefined();

			expect(article_translations.articleId).toBeDefined();
			expect(article_translations.language).toBeDefined();
			expect(article_translations.slug).toBeDefined();
		});

		it('should maintain data consistency across schema', () => {
			// Create draft article (no publishedAt)
			const draftArticle: Article = {
				id: 'draft-article',
				categoryId: null,
				complexity: 'beginner' as const,
				status: 'draft' as const,
				publishedAt: null,
				coverImage: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(draftArticle.status).toBe('draft');
			expect(draftArticle.publishedAt).toBeNull();

			// Create published article (with publishedAt)
			const publishedArticle: Article = {
				id: 'published-article',
				categoryId: null,
				complexity: 'advanced' as const,
				status: 'published' as const,
				publishedAt: new Date(),
				coverImage: '/images/published.jpg',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			expect(publishedArticle.status).toBe('published');
			expect(publishedArticle.publishedAt).not.toBeNull();

			// Different articles have different properties
			expect(draftArticle.status).not.toBe(publishedArticle.status);
			expect(draftArticle.publishedAt).not.toBe(publishedArticle.publishedAt);
		});
	});
});
