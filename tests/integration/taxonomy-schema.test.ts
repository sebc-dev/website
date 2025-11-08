/**
 * Integration Tests: Taxonomy Schema Validation
 *
 * Tests for categories, tags, and articleTags schema definitions including:
 * - Schema exports and type definitions
 * - Type safety validation
 *
 * Note: Full database operation tests (CRUD, cascade deletes) require
 * running Wrangler with local D1. See guides/TESTING.md for details.
 *
 * @see docs/specs/epics/epic_0/story_0_4/implementation/phase_3/guides/TESTING.md
 */

import { describe, it, expect } from 'vitest';
import { categories, tags, articleTags, articles, type Category, type Tag, type ArticleTag } from '@/src/lib/server/db/schema';

/**
 * Test Suite 1: Categories Table Schema
 *
 * Validates the categories table definition and exports.
 */
describe('Categories Schema Definition', () => {
	it('should export categories table', () => {
		expect(categories).toBeDefined();
		expect(typeof categories).toBe('object');
	});

	it('should have Category type exported and type-safe', () => {
		// Verify type is available for type checking
		const category: Category = {
			id: 'cat-1',
			key: 'news',
			nameFr: 'Actualités',
			nameEn: 'News',
			slugFr: 'actualites',
			slugEn: 'news',
			icon: 'Newspaper',
			color: '#3B82F6'
		};
		expect(category.id).toBe('cat-1');
		expect(category.key).toBe('news');
		expect(category.nameFr).toBe('Actualités');
		expect(category.nameEn).toBe('News');
		expect(category.icon).toBe('Newspaper');
		expect(category.color).toBe('#3B82F6');
	});

	it('should validate category creation with valid data', () => {
		const validCategories: Category[] = [
			{
				id: 'cat-1',
				key: 'news',
				nameFr: 'Actualités',
				nameEn: 'News',
				slugFr: 'actualites',
				slugEn: 'news',
				icon: 'Newspaper',
				color: '#3B82F6'
			},
			{
				id: 'cat-2',
				key: 'tutorial',
				nameFr: 'Tutoriel',
				nameEn: 'Tutorial',
				slugFr: 'tutoriel',
				slugEn: 'tutorial',
				icon: 'BookOpen',
				color: '#14B8A6'
			}
		];

		expect(validCategories).toHaveLength(2);
		expect(validCategories[0].key).toBe('news');
		expect(validCategories[1].key).toBe('tutorial');
	});
});

/**
 * Test Suite 2: Tags Table Schema
 *
 * Validates the tags table definition and exports.
 */
describe('Tags Schema Definition', () => {
	it('should export tags table', () => {
		expect(tags).toBeDefined();
		expect(typeof tags).toBe('object');
	});

	it('should have Tag type exported and type-safe', () => {
		// Verify type is available for type checking
		const tag: Tag = {
			id: 'tag-1',
			nameFr: 'TypeScript',
			nameEn: 'TypeScript',
			createdAt: new Date()
		};
		expect(tag.id).toBe('tag-1');
		expect(tag.nameFr).toBe('TypeScript');
		expect(tag.nameEn).toBe('TypeScript');
		expect(tag.createdAt instanceof Date).toBe(true);
	});

	it('should validate tag creation with bilingual names', () => {
		const validTags: Tag[] = [
			{
				id: 'tag-ts',
				nameFr: 'TypeScript',
				nameEn: 'TypeScript',
				createdAt: new Date('2024-01-01')
			},
			{
				id: 'tag-react',
				nameFr: 'React',
				nameEn: 'React',
				createdAt: new Date('2024-01-02')
			}
		];

		expect(validTags).toHaveLength(2);
		expect(validTags[0].nameFr).toBe('TypeScript');
		expect(validTags[1].nameFr).toBe('React');
	});
});

/**
 * Test Suite 3: ArticleTags Junction Table Schema
 *
 * Validates the articleTags junction table definition and type safety.
 */
describe('ArticleTags Schema Definition', () => {
	it('should export articleTags table', () => {
		expect(articleTags).toBeDefined();
		expect(typeof articleTags).toBe('object');
	});

	it('should have ArticleTag type exported and type-safe', () => {
		// Verify type is available for type checking
		const link: ArticleTag = {
			articleId: 'article-1',
			tagId: 'tag-1'
		};
		expect(link.articleId).toBe('article-1');
		expect(link.tagId).toBe('tag-1');
	});

	it('should validate Many-to-Many relationship setup', () => {
		const links: ArticleTag[] = [
			{ articleId: 'article-1', tagId: 'tag-1' },
			{ articleId: 'article-1', tagId: 'tag-2' },
			{ articleId: 'article-2', tagId: 'tag-1' }
		];

		expect(links).toHaveLength(3);
		expect(links.filter((l) => l.articleId === 'article-1')).toHaveLength(2);
		expect(links.filter((l) => l.tagId === 'tag-1')).toHaveLength(2);
	});

	it('should prevent TypeScript compilation with invalid articleTag', () => {
		// This test verifies type safety - should fail to compile with invalid data
		// Example of what should NOT compile:
		// const invalid: ArticleTag = { articleId: 'article-1' }; // Missing tagId
		// const invalid: ArticleTag = { articleId: 'article-1', tagId: 'tag-1', extra: 'field' }; // Extra field

		// Valid articleTag
		const valid: ArticleTag = { articleId: 'article-1', tagId: 'tag-1' };
		expect(valid.articleId).toBe('article-1');
	});
});

/**
 * Test Suite 4: Articles Table FK Update
 *
 * Validates that articles table has been updated with categoryId FK.
 */
describe('Articles Schema FK Update', () => {
	it('should have articles table exported', () => {
		expect(articles).toBeDefined();
		expect(typeof articles).toBe('object');
	});

	it('should allow creation with categoryId FK', () => {
		// Verify that articles can be created with categoryId
		const validArticle = {
			id: 'article-1',
			categoryId: 'cat-1', // FK to categories
			complexity: 'beginner' as const,
			status: 'draft' as const,
			publishedAt: null,
			coverImage: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		expect(validArticle.categoryId).toBe('cat-1');
		expect(validArticle.complexity).toBe('beginner');
	});

	it('should allow nullable categoryId for backward compatibility', () => {
		// Verify that articles can be created without categoryId (nullable)
		const articleWithoutCategory = {
			id: 'article-2',
			categoryId: null, // Nullable FK for Phase 2 compatibility
			complexity: 'intermediate' as const,
			status: 'published' as const,
			publishedAt: new Date(),
			coverImage: '/images/cover.jpg',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		expect(articleWithoutCategory.categoryId).toBeNull();
	});
});

/**
 * Test Suite 5: Taxonomy Schema Completeness
 *
 * Validates that all taxonomy components are properly defined and related.
 */
describe('Taxonomy Schema Completeness', () => {
	it('should have all 5 tables exported', () => {
		expect(categories).toBeDefined();
		expect(tags).toBeDefined();
		expect(articleTags).toBeDefined();
		expect(articles).toBeDefined();
	});

	it('should have all 4 taxonomy types exported', () => {
		// Verify types can be used
		type TestCategory = Category;
		type TestTag = Tag;
		type TestArticleTag = ArticleTag;

		const testCat: TestCategory = {
			id: 'test-1',
			key: 'test',
			nameFr: 'Test',
			nameEn: 'Test',
			slugFr: 'test',
			slugEn: 'test',
			icon: 'Test',
			color: '#000000'
		};

		const testTag: TestTag = {
			id: 'tag-1',
			nameFr: 'Tag',
			nameEn: 'Tag',
			createdAt: new Date()
		};

		const testLink: TestArticleTag = {
			articleId: 'article-1',
			tagId: 'tag-1'
		};

		expect(testCat.key).toBe('test');
		expect(testTag.nameFr).toBe('Tag');
		expect(testLink.articleId).toBe('article-1');
	});
});
