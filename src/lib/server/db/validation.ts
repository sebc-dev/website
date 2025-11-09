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

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  article_translations,
  articles,
  articleTags,
  categories,
  tags,
} from './schema';

// ============================================================================
// INSERT SCHEMAS (for creating new records)
// ============================================================================

/**
 * Insert schema for articles
 * Use this when creating new article records
 * ID is optional - will be generated if not provided
 */
export const insertArticleSchema = createInsertSchema(articles).extend({
  id: z.string().optional(),
});

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
const baseArticleTranslationSchema = createInsertSchema(article_translations);

// Type assertion needed because drizzle-zod schemas don't expose .shape in their type definitions
// but it's available at runtime
type SchemaWithShape = typeof baseArticleTranslationSchema & {
  shape: {
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodString;
    seoTitle: z.ZodString;
    seoDescription: z.ZodString;
  };
};

export const insertArticleTranslationSchema =
  baseArticleTranslationSchema.extend({
    id: z.string().optional(),
    slug: (baseArticleTranslationSchema as SchemaWithShape).shape.slug
      .min(1, 'Slug is required')
      .max(200, 'Slug must be 200 characters or less')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug must be lowercase alphanumeric with hyphens only',
      ),
    title: (baseArticleTranslationSchema as SchemaWithShape).shape.title
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less'),
    excerpt: (baseArticleTranslationSchema as SchemaWithShape).shape.excerpt
      .min(1, 'Excerpt is required')
      .max(500, 'Excerpt must be 500 characters or less'),
    seoTitle: (baseArticleTranslationSchema as SchemaWithShape).shape.seoTitle
      .min(1, 'SEO title is required')
      .max(60, 'SEO title should be 60 characters or less for optimal display'),
    seoDescription: (
      baseArticleTranslationSchema as SchemaWithShape
    ).shape.seoDescription
      .min(1, 'SEO description is required')
      .max(
        160,
        'SEO description should be 160 characters or less for optimal display',
      ),
  });

/**
 * Insert schema for categories
 * Use this when creating new category records
 * ID is optional - will be generated if not provided
 */
export const insertCategorySchema = createInsertSchema(categories).extend({
  id: z.string().optional(),
});

/**
 * Insert schema for tags
 * Use this when creating new tag records
 * ID is optional - will be generated if not provided
 */
export const insertTagSchema = createInsertSchema(tags).extend({
  id: z.string().optional(),
});

/**
 * Insert schema for article-tag relationships
 * Use this when associating a tag with an article
 */
export const insertArticleTagSchema = createInsertSchema(articleTags);

// ============================================================================
// SELECT SCHEMAS (for query results)
// ============================================================================

/**
 * Select schema for articles
 * Use this for validating query results or type inference
 */
export const selectArticleSchema = createSelectSchema(articles);

/**
 * Select schema for article translations
 * Use this for validating query results or type inference
 */
export const selectArticleTranslationSchema =
  createSelectSchema(article_translations);

/**
 * Select schema for categories
 * Use this for validating query results or type inference
 */
export const selectCategorySchema = createSelectSchema(categories);

/**
 * Select schema for tags
 * Use this for validating query results or type inference
 */
export const selectTagSchema = createSelectSchema(tags);

/**
 * Select schema for article tags
 * Use this for validating query results or type inference
 */
export const selectArticleTagSchema = createSelectSchema(articleTags);

// ============================================================================
// PARTIAL SCHEMAS (for updates)
// ============================================================================

/**
 * Partial insert schema for articles (for updates)
 * Use this when updating article records where all fields are optional
 */
export const updateArticleSchema = insertArticleSchema.partial();

/**
 * Partial insert schema for article translations (for updates)
 * Use this when updating translation records where all fields are optional
 * Note: Custom refinements still apply to provided fields
 */
export const updateArticleTranslationSchema =
  insertArticleTranslationSchema.partial();

// ============================================================================
// TYPE INFERENCE EXPORTS
// ============================================================================

/**
 * Helper type to infer types from drizzle-zod schemas
 * drizzle-zod schemas are runtime-compatible with Zod but don't satisfy
 * the ZodType constraint at compile-time, so we use this workaround
 */
type InferDrizzleZod<T> = T extends { _output: infer O } ? O : never;

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
export type InsertArticle = InferDrizzleZod<typeof insertArticleSchema>;

/**
 * TypeScript type for selecting articles
 * Automatically inferred from selectArticleSchema
 */
export type SelectArticle = InferDrizzleZod<typeof selectArticleSchema>;

/**
 * TypeScript type for inserting article translations
 * Automatically inferred from insertArticleTranslationSchema
 */
export type InsertArticleTranslation = InferDrizzleZod<
  typeof insertArticleTranslationSchema
>;

/**
 * TypeScript type for selecting article translations
 * Automatically inferred from selectArticleTranslationSchema
 */
export type SelectArticleTranslation = InferDrizzleZod<
  typeof selectArticleTranslationSchema
>;

/**
 * TypeScript type for inserting categories
 * Automatically inferred from insertCategorySchema
 */
export type InsertCategory = InferDrizzleZod<typeof insertCategorySchema>;

/**
 * TypeScript type for selecting categories
 * Automatically inferred from selectCategorySchema
 */
export type SelectCategory = InferDrizzleZod<typeof selectCategorySchema>;

/**
 * TypeScript type for inserting tags
 * Automatically inferred from insertTagSchema
 */
export type InsertTag = InferDrizzleZod<typeof insertTagSchema>;

/**
 * TypeScript type for selecting tags
 * Automatically inferred from selectTagSchema
 */
export type SelectTag = InferDrizzleZod<typeof selectTagSchema>;

/**
 * TypeScript type for inserting article tags
 * Automatically inferred from insertArticleTagSchema
 */
export type InsertArticleTag = InferDrizzleZod<typeof insertArticleTagSchema>;

/**
 * TypeScript type for selecting article tags
 * Automatically inferred from selectArticleTagSchema
 */
export type SelectArticleTag = InferDrizzleZod<typeof selectArticleTagSchema>;

/**
 * TypeScript type for updating articles
 * All fields optional - automatically inferred from updateArticleSchema
 */
export type UpdateArticle = InferDrizzleZod<typeof updateArticleSchema>;

/**
 * TypeScript type for updating article translations
 * All fields optional - automatically inferred from updateArticleTranslationSchema
 */
export type UpdateArticleTranslation = InferDrizzleZod<
  typeof updateArticleTranslationSchema
>;

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
  schema: {
    safeParse(
      data: unknown,
    ): { success: true; data: T } | { success: false; error: z.ZodError };
  },
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
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
  return validateData(insertArticleSchema, data);
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
  return validateData(insertArticleTranslationSchema, data);
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
  return validateData(updateArticleSchema, data);
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
  return validateData(updateArticleTranslationSchema, data);
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
  const formatted: Record<string, string> = {};

  errors.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join('.');
    // Only store the first error per field
    if (!formatted[path]) {
      formatted[path] = issue.message;
    }
  });

  return formatted;
}
