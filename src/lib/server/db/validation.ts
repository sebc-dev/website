/**
 * Zod Validation Schemas - Auto-generated from Drizzle ORM
 *
 * This file contains auto-generated Zod validation schemas created using drizzle-zod.
 * Each Drizzle table has both insert and select schemas:
 *
 * INSERT SCHEMAS: Used for creating new records (POST/CREATE operations)
 * - insertArticleSchema
 * - insertArticleTranslationSchema
 * - insertCategorySchema
 * - insertTagSchema
 * - insertArticleTagSchema
 *
 * SELECT SCHEMAS: Used for querying existing records (GET/READ operations)
 * - selectArticleSchema
 * - selectArticleTranslationSchema
 * - selectCategorySchema
 * - selectTagSchema
 * - selectArticleTagSchema
 *
 * Validation chain flow:
 * Drizzle Schema → drizzle-zod auto-generation → Zod Schemas → Server Actions → Forms
 *
 * The single source of truth is the Drizzle schema in schema.ts. Any changes to the
 * schema automatically reflect in the Zod validation through this auto-generation.
 *
 * @see https://orm.drizzle.team/docs/zod
 * @see https://zod.dev
 */

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import {
	articles,
	article_translations,
	categories,
	tags,
	articleTags
} from './schema'

// ============================================================================
// INSERT SCHEMAS (for creating new records)
// ============================================================================

/**
 * Insert schema for articles
 * Use this when creating new article records
 */
export const insertArticleSchema = createInsertSchema(articles)

/**
 * Insert schema for article translations
 * Use this when creating translated content for an article
 */
export const insertArticleTranslationSchema = createInsertSchema(article_translations)

/**
 * Insert schema for categories
 * Use this when creating new category records
 */
export const insertCategorySchema = createInsertSchema(categories)

/**
 * Insert schema for tags
 * Use this when creating new tag records
 */
export const insertTagSchema = createInsertSchema(tags)

/**
 * Insert schema for article-tag relationships
 * Use this when associating a tag with an article
 */
export const insertArticleTagSchema = createInsertSchema(articleTags)

// ============================================================================
// SELECT SCHEMAS (for query results)
// ============================================================================

/**
 * Select schema for articles
 * Use this for validating query results or type inference
 */
export const selectArticleSchema = createSelectSchema(articles)

/**
 * Select schema for article translations
 * Use this for validating query results or type inference
 */
export const selectArticleTranslationSchema = createSelectSchema(article_translations)

/**
 * Select schema for categories
 * Use this for validating query results or type inference
 */
export const selectCategorySchema = createSelectSchema(categories)

/**
 * Select schema for tags
 * Use this for validating query results or type inference
 */
export const selectTagSchema = createSelectSchema(tags)

/**
 * Select schema for article tags
 * Use this for validating query results or type inference
 */
export const selectArticleTagSchema = createSelectSchema(articleTags)
