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

import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

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
// Categories Table
// ============================================================================

/**
 * Categories table - Primary article classification system
 *
 * This table defines the 9 canonical categories that form the content
 * classification taxonomy for the sebc.dev blog. Each article belongs to
 * exactly one category, providing structured navigation.
 *
 * The 9 canonical categories are:
 * 1. Actualités (News) - Current events and updates
 * 2. Analyse Approfondie (Deep Analysis) - In-depth technical analysis
 * 3. Parcours d'Apprentissage (Learning Path) - Structured learning sequences
 * 4. Rétrospective (Retrospective) - Project reviews and retrospectives
 * 5. Tutoriel (Tutorial) - Step-by-step guides and walkthroughs
 * 6. Étude de Cas (Case Study) - Real-world project case studies
 * 7. Astuces Rapides (Quick Tips) - Short, actionable tips
 * 8. Dans les Coulisses (Behind the Scenes) - Behind-the-scenes content
 * 9. Test d'Outil (Tool Test) - Tool and technology reviews
 *
 * **Important**: Categories are modifiable but NOT deletable. Once created,
 * they can be updated (names, colors, icons) but cannot be removed, as they
 * are referenced by existing articles.
 *
 * Relationships:
 * - One category -> Many articles (articles.categoryId foreign key)
 *
 * @field id - Unique identifier (text, e.g., 'cat-1' to 'cat-9')
 * @field key - Machine-readable key (unique, lowercase, hyphens, e.g., 'news', 'tutorial')
 * @field nameFr - French display name (e.g., 'Actualités')
 * @field nameEn - English display name (e.g., 'News')
 * @field slugFr - French URL slug (e.g., 'actualites')
 * @field slugEn - English URL slug (e.g., 'news')
 * @field icon - Lucide React icon name (e.g., 'Newspaper', 'BookOpen')
 * @field color - Hex color code for UI display (e.g., '#3B82F6')
 */
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  slugFr: text('slug_fr').notNull(),
  slugEn: text('slug_en').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
});

/**
 * TypeScript type inference for Category records
 *
 * Use this type when working with category data in application code.
 * Automatically inferred from the schema definition above.
 */
export type Category = typeof categories.$inferSelect;

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
    categoryId: text('category_id').references(() => categories.id), // FK to categories (nullable)
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
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Indexes for query performance
    categoryIdIdx: index('articles_category_id_idx').on(table.categoryId),
    statusIdx: index('articles_status_idx').on(table.status),
    publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
  }),
);

/**
 * TypeScript type inference for Article records
 *
 * Use this type when working with article data in application code.
 * Automatically inferred from the schema definition above.
 */
export type Article = typeof articles.$inferSelect;

// ============================================================================
// Article Translations Table
// ============================================================================

/**
 * Supported languages for article translations
 *
 * Platform currently supports bilingual content:
 * - 'fr': French (primary language)
 * - 'en': English
 */
export const LanguageEnum = ['fr', 'en'] as const;
export type Language = (typeof LanguageEnum)[number];

/**
 * Article Translations table - Language-specific content for articles
 *
 * This table stores multilingual content for blog articles. Each article in
 * the articles table can have multiple translations (one per language).
 *
 * Relationships:
 * - Many translations -> One article (foreign key with CASCADE delete)
 *
 * Constraints:
 * - Unique (articleId, language): One translation per language per article
 * - Unique slug: URL-friendly slugs must be globally unique
 *
 * @field id - Unique identifier (UUID or text)
 * @field articleId - Foreign key to articles.id (CASCADE on delete)
 * @field language - Content language ('fr' or 'en')
 * @field title - Article title in this language
 * @field slug - URL-friendly slug for routing (must be unique)
 * @field excerpt - Short summary/preview text
 * @field seoTitle - SEO-optimized title for meta tags
 * @field seoDescription - SEO meta description
 * @field contentMdx - Full article content in MDX format
 * @field createdAt - Record creation timestamp
 * @field updatedAt - Last modification timestamp
 */
export const article_translations = sqliteTable(
  'article_translations',
  {
    id: text('id').primaryKey(),
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    language: text('language', { enum: LanguageEnum }).notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    excerpt: text('excerpt').notNull(),
    seoTitle: text('seo_title').notNull(),
    seoDescription: text('seo_description').notNull(),
    contentMdx: text('content_mdx').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Indexes for query performance
    articleIdIdx: index('article_translations_article_id_idx').on(
      table.articleId,
    ),
    languageIdx: index('article_translations_language_idx').on(table.language),
    slugIdx: index('article_translations_slug_idx').on(table.slug),
    // Unique constraints
    uniqueArticleLanguage: unique(
      'article_translations_unique_article_language',
    ).on(table.articleId, table.language),
    uniqueSlug: unique('article_translations_unique_slug').on(table.slug),
  }),
);

/**
 * TypeScript type inference for ArticleTranslation records
 *
 * Use this type when working with article translation data in application code.
 * Automatically inferred from the schema definition above.
 */
export type ArticleTranslation = typeof article_translations.$inferSelect;

// ============================================================================
// Tags Table
// ============================================================================

/**
 * Tags table - Flexible article taxonomy
 *
 * This table stores flexible tags that can be applied to articles for
 * secondary classification and content discovery. Unlike the fixed 9 canonical
 * categories, tags are flexible and can be created/managed by administrators.
 *
 * Tags support bilingual content (FR/EN) for consistent user experience
 * across language versions.
 *
 * Relationships:
 * - Many tags -> Many articles (via articleTags junction table)
 *
 * @field id - Unique identifier (UUID or text)
 * @field nameFr - French tag name (e.g., 'TypeScript', 'React')
 * @field nameEn - English tag name (e.g., 'TypeScript', 'React')
 * @field createdAt - Record creation timestamp
 */
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  nameFr: text('name_fr').notNull(),
  nameEn: text('name_en').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * TypeScript type inference for Tag records
 *
 * Use this type when working with tag data in application code.
 * Automatically inferred from the schema definition above.
 */
export type Tag = typeof tags.$inferSelect;

// ============================================================================
// Article Tags Junction Table
// ============================================================================

/**
 * ArticleTags junction table - Many-to-Many relationship
 *
 * This table implements the Many-to-Many relationship between articles and tags.
 * Each row represents a link between an article and a tag, allowing flexible
 * content classification beyond the fixed 9 canonical categories.
 *
 * Uses a composite primary key (articleId, tagId) to prevent duplicate
 * article-tag pairs and ensure data integrity.
 *
 * Foreign keys use ON DELETE CASCADE to automatically remove articleTag links
 * when either the article or tag is deleted.
 *
 * Relationships:
 * - Foreign key to articles.id (ON DELETE CASCADE)
 * - Foreign key to tags.id (ON DELETE CASCADE)
 *
 * @field articleId - Foreign key to articles.id
 * @field tagId - Foreign key to tags.id
 */
export const articleTags = sqliteTable(
  'article_tags',
  {
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    // Composite primary key prevents duplicate article-tag pairs
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  }),
);

/**
 * TypeScript type inference for ArticleTag records
 *
 * Use this type when working with article-tag relationship data in application code.
 * Automatically inferred from the schema definition above.
 */
export type ArticleTag = typeof articleTags.$inferSelect;
