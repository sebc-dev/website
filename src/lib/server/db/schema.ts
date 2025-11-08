/**
 * Database Schema Definitions
 *
 * This file defines the complete database schema for the sebc.dev blog platform using Drizzle ORM.
 * Schemas are organized by domain:
 * - ENUMs: Reusable type definitions
 * - Articles: Core article metadata
 * - Translations: Multilingual content
 *
 * @see https://orm.drizzle.team/docs/column-types/sqlite
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ============================================================================
// ENUM Definitions
// ============================================================================

/**
 * Article complexity levels
 *
 * Indicates the technical difficulty and target audience for an article.
 * - 'beginner': Introductory content, assumes no prior knowledge
 * - 'intermediate': Moderate difficulty, assumes basic understanding
 * - 'advanced': Complex topics, requires strong foundation
 */
export const ComplexityEnum = ['beginner', 'intermediate', 'advanced'] as const;
export type Complexity = (typeof ComplexityEnum)[number];

/**
 * Article publication status
 *
 * Controls article visibility and workflow state.
 * - 'draft': Work in progress, not visible to public
 * - 'published': Live article, visible to all users
 */
export const StatusEnum = ['draft', 'published'] as const;
export type Status = (typeof StatusEnum)[number];

// ============================================================================
// Articles Table
// ============================================================================

/**
 * Articles table - Core article metadata shared across translations
 *
 * This table stores language-agnostic metadata for blog articles.
 * Each article can have multiple translations (article_translations table).
 * Supports bilingual content (FR/EN) with proper foreign key relations.
 *
 * Relationships:
 * - One article -> Many translations (article_translations)
 * - One article -> One category (categories, created in Phase 3)
 *
 * @field id - Unique identifier (UUID or text)
 * @field categoryId - Foreign key to categories table (nullable until Phase 3)
 * @field complexity - Technical difficulty level (beginner, intermediate, advanced)
 * @field status - Publication status (draft, published)
 * @field publishedAt - Publication timestamp (null for drafts)
 * @field coverImage - Cover image path/URL (nullable)
 * @field createdAt - Record creation timestamp
 * @field updatedAt - Last modification timestamp
 */
export const articles = sqliteTable(
	'articles',
	{
		id: text('id').primaryKey(),
		categoryId: text('category_id'), // Nullable FK placeholder for Phase 3
		complexity: text('complexity', { enum: ComplexityEnum }).notNull(),
		status: text('status', { enum: StatusEnum }).notNull().default('draft'),
		publishedAt: integer('published_at', { mode: 'timestamp' }),
		coverImage: text('cover_image'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => ({
		// Indexes for query performance
		categoryIdIdx: index('articles_category_id_idx').on(table.categoryId),
		statusIdx: index('articles_status_idx').on(table.status),
		publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt)
	})
);

/**
 * TypeScript type inference for Article records
 *
 * Use this type when working with article data in application code.
 * Automatically inferred from the schema definition above.
 */
export type Article = typeof articles.$inferSelect;
