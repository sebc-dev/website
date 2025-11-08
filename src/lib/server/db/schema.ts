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

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
