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
import { z } from 'zod'
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
 * Insert schema for article translations with custom refinements
 * Use this when creating translated content for an article
 *
 * Custom refinements:
 * - slug: Lowercase alphanumeric with hyphens only (SEO-friendly URLs)
 * - title: Max 200 characters
 * - excerpt: Max 500 characters
 * - seoTitle: Max 60 characters (Google title limit)
 * - seoDescription: Max 160 characters (Google description limit)
 */
const baseArticleTranslationSchema = createInsertSchema(article_translations)
export const insertArticleTranslationSchema = baseArticleTranslationSchema.extend({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	slug: (baseArticleTranslationSchema as any).shape.slug
		.min(1, 'Slug is required')
		.max(200, 'Slug must be 200 characters or less')
		.regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	title: (baseArticleTranslationSchema as any).shape.title
		.min(1, 'Title is required')
		.max(200, 'Title must be 200 characters or less'),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	excerpt: (baseArticleTranslationSchema as any).shape.excerpt
		.min(1, 'Excerpt is required')
		.max(500, 'Excerpt must be 500 characters or less'),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seoTitle: (baseArticleTranslationSchema as any).shape.seoTitle
		.min(1, 'SEO title is required')
		.max(60, 'SEO title should be 60 characters or less for optimal display'),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seoDescription: (baseArticleTranslationSchema as any).shape.seoDescription
		.min(1, 'SEO description is required')
		.max(160, 'SEO description should be 160 characters or less for optimal display')
})

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

// ============================================================================
// PARTIAL SCHEMAS (for updates)
// ============================================================================

/**
 * Partial insert schema for articles (for updates)
 * Use this when updating article records where all fields are optional
 */
export const updateArticleSchema = insertArticleSchema.partial()

/**
 * Partial insert schema for article translations (for updates)
 * Use this when updating translation records where all fields are optional
 * Note: Custom refinements still apply to provided fields
 */
export const updateArticleTranslationSchema = insertArticleTranslationSchema.partial()

// ============================================================================
// TYPE INFERENCE EXPORTS
// ============================================================================

/**
 * TypeScript type for inserting articles
 * Automatically inferred from insertArticleSchema
 *
 * @example
 * ```typescript
 * const newArticle: InsertArticle = {
 *   categoryId: 'cat-1',
 *   complexity: 'beginner',
 *   status: 'draft'
 * }
 * ```
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type InsertArticle = z.infer<typeof insertArticleSchema>

/**
 * TypeScript type for selecting articles
 * Automatically inferred from selectArticleSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type SelectArticle = z.infer<typeof selectArticleSchema>

/**
 * TypeScript type for inserting article translations
 * Automatically inferred from insertArticleTranslationSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type InsertArticleTranslation = z.infer<typeof insertArticleTranslationSchema>

/**
 * TypeScript type for selecting article translations
 * Automatically inferred from selectArticleTranslationSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type SelectArticleTranslation = z.infer<typeof selectArticleTranslationSchema>

/**
 * TypeScript type for inserting categories
 * Automatically inferred from insertCategorySchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type InsertCategory = z.infer<typeof insertCategorySchema>

/**
 * TypeScript type for selecting categories
 * Automatically inferred from selectCategorySchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type SelectCategory = z.infer<typeof selectCategorySchema>

/**
 * TypeScript type for inserting tags
 * Automatically inferred from insertTagSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type InsertTag = z.infer<typeof insertTagSchema>

/**
 * TypeScript type for selecting tags
 * Automatically inferred from selectTagSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type SelectTag = z.infer<typeof selectTagSchema>

/**
 * TypeScript type for inserting article tags
 * Automatically inferred from insertArticleTagSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type InsertArticleTag = z.infer<typeof insertArticleTagSchema>

/**
 * TypeScript type for selecting article tags
 * Automatically inferred from selectArticleTagSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type SelectArticleTag = z.infer<typeof selectArticleTagSchema>

/**
 * TypeScript type for updating articles
 * All fields optional - automatically inferred from updateArticleSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type UpdateArticle = z.infer<typeof updateArticleSchema>

/**
 * TypeScript type for updating article translations
 * All fields optional - automatically inferred from updateArticleTranslationSchema
 */
// @ts-expect-error - drizzle-zod schema types don't perfectly align with Zod's ZodType
export type UpdateArticleTranslation = z.infer<typeof updateArticleTranslationSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Generic validation helper for any Zod schema
 * Uses safe parsing to avoid throwing errors, instead returning a discriminated union
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate (can be any type)
 * @returns Object with success flag and either validated data or errors
 *
 * @example
 * ```typescript
 * const result = validateData(insertArticleSchema, formData);
 * if (result.success) {
 *   console.log('Valid:', result.data);
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validateData<T>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schema: any,
	data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result = schema.safeParse(data) as any

	if (result.success) {
		return { success: true, data: result.data }
	}

	return { success: false, errors: result.error }
}

/**
 * Validate article insert data
 *
 * @param data - The data to validate
 * @returns Validation result with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = validateArticleInsert({
 *   categoryId: 'cat-1',
 *   complexity: 'beginner',
 *   status: 'draft'
 * });
 * ```
 */
export function validateArticleInsert(data: unknown) {
	return validateData<InsertArticle>(insertArticleSchema, data)
}

/**
 * Validate article translation insert data
 *
 * @param data - The data to validate
 * @returns Validation result with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = validateTranslationInsert({
 *   articleId: 'art-1',
 *   language: 'fr',
 *   title: 'Mon Article',
 *   slug: 'mon-article',
 *   excerpt: 'Description',
 *   seoTitle: 'SEO',
 *   seoDescription: 'SEO Desc',
 *   contentMdx: '# Content'
 * });
 * ```
 */
export function validateTranslationInsert(data: unknown) {
	return validateData<InsertArticleTranslation>(insertArticleTranslationSchema, data)
}

/**
 * Validate article update data
 * All fields are optional for updates
 *
 * @param data - The data to validate (partial update)
 * @returns Validation result with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = validateArticleUpdate({
 *   status: 'published'
 * });
 * ```
 */
export function validateArticleUpdate(data: unknown) {
	return validateData<UpdateArticle>(updateArticleSchema, data)
}

/**
 * Validate article translation update data
 * All fields are optional for updates
 *
 * @param data - The data to validate (partial update)
 * @returns Validation result with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = validateTranslationUpdate({
 *   title: 'Updated Title'
 * });
 * ```
 */
export function validateTranslationUpdate(data: unknown) {
	return validateData<UpdateArticleTranslation>(updateArticleTranslationSchema, data)
}

/**
 * Format Zod validation errors into a user-friendly field → message map
 * Flattens nested errors and provides clear error messages
 *
 * @param errors - Zod validation error object
 * @returns Object mapping field paths to error messages
 *
 * @example
 * ```typescript
 * const result = insertArticleTranslationSchema.safeParse(invalidData);
 * if (!result.success) {
 *   const formatted = formatZodErrors(result.error);
 *   // Returns: { slug: "Slug must be lowercase alphanumeric with hyphens only" }
 * }
 * ```
 */
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
	const formatted: Record<string, string> = {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const errorArray = (errors as any).errors || []
	errorArray.forEach((error: any) => {
		const path = (error.path || []).join('.')
		// Only store the first error per field
		if (!formatted[path]) {
			formatted[path] = error.message || 'Validation error'
		}
	})

	return formatted
}
