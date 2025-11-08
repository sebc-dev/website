# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Define ENUM types and base constants

**Files**: `src/lib/server/db/schema.ts` (new)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Create `src/lib/server/db/schema.ts` file
- [ ] Import Drizzle SQLite helpers at top of file
- [ ] Define `ComplexityEnum` with values: 'beginner', 'intermediate', 'advanced'
- [ ] Define `StatusEnum` with values: 'draft', 'published'
- [ ] Add JSDoc comments explaining each ENUM value's purpose
- [ ] Export ENUM types for use in application code
- [ ] Add file header comment with purpose and description

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

**Expected Result**: No TypeScript errors, no linting errors, ENUMs properly typed

### Review Checklist

#### ENUM Definitions
- [ ] `ComplexityEnum` includes exactly 3 values: 'beginner', 'intermediate', 'advanced'
- [ ] `StatusEnum` includes exactly 2 values: 'draft', 'published'
- [ ] ENUM values match story specification exactly
- [ ] Types are const arrays for proper TypeScript inference

#### Code Quality
- [ ] No `any` types
- [ ] Clear and consistent naming (PascalCase for types)
- [ ] JSDoc comments present and meaningful
- [ ] No commented code
- [ ] No debug statements

#### Project Standards
- [ ] File follows project directory structure (`src/lib/server/db/`)
- [ ] Imports are organized and clean
- [ ] Coding style matches project conventions

### Commit Message

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(db): define complexity and status ENUM types

- Add ComplexityEnum with 3 levels (beginner, intermediate, advanced)
- Add StatusEnum with 2 states (draft, published)
- Export types for application-wide use
- Add JSDoc documentation for each ENUM value

Part of Phase 2 - Commit 1/6"
```

---

## 📋 Commit 2: Create articles table schema

**Files**: `src/lib/server/db/schema.ts` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [x] Import `sqliteTable`, `text`, `integer` from `drizzle-orm/sqlite-core`
- [x] Define `articles` table using `sqliteTable()` helper
- [x] Add `id` field: text UUID primary key
- [x] Add `categoryId` field: text UUID nullable (FK placeholder for Phase 3)
- [x] Add `complexity` field: text with ENUM constraint (ComplexityEnum)
- [x] Add `status` field: text with ENUM constraint (StatusEnum)
- [x] Add `publishedAt` field: integer timestamp nullable
- [x] Add `coverImage` field: text nullable
- [x] Add `createdAt` field: integer timestamp with default now
- [x] Add `updatedAt` field: integer timestamp with default now
- [x] Add indexes: `categoryId_idx`, `status_idx`, `publishedAt_idx`
- [x] Export table definition
- [x] Export inferred TypeScript type: `export type Article = typeof articles.$inferSelect`

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

**Expected Result**: TypeScript compiles, type inference works, no errors

### Review Checklist

#### Schema Structure
- [ ] All 8 fields defined: id, categoryId, complexity, status, publishedAt, coverImage, createdAt, updatedAt
- [ ] Field types match SQLite requirements (text for strings/UUIDs, integer for timestamps)
- [ ] `id` is primary key
- [ ] `categoryId` is nullable (allows Phase 2 to work before Phase 3)
- [ ] `publishedAt` is nullable (only set when status becomes 'published')
- [ ] `coverImage` is nullable (optional field)

#### ENUM Constraints
- [ ] `complexity` field uses ComplexityEnum values
- [ ] `status` field uses StatusEnum values
- [ ] ENUM constraints properly typed

#### Timestamps
- [ ] `createdAt` uses integer type with timestamp mode
- [ ] `createdAt` has `defaultNow()` or equivalent
- [ ] `updatedAt` uses integer type with timestamp mode
- [ ] `updatedAt` has `defaultNow()` or equivalent

#### Indexes
- [ ] Index on `categoryId` for filtering by category
- [ ] Index on `status` for filtering by draft/published
- [ ] Index on `publishedAt` for sorting/filtering published articles
- [ ] Indexes named clearly (e.g., `articles_categoryId_idx`)

#### Type Safety
- [ ] Table export is properly typed
- [ ] Type inference works: `typeof articles.$inferSelect` gives correct type
- [ ] No `any` types

### Commit Message

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(db): create articles table schema

- Define articles table with 8 fields (id, categoryId, complexity, status, etc.)
- Add nullable categoryId FK placeholder (will reference categories in Phase 3)
- Add ENUM constraints for complexity and status fields
- Add indexes for performance on categoryId, status, publishedAt
- Export type inference for TypeScript autocomplete

Part of Phase 2 - Commit 2/6"
```

---

## 📋 Commit 3: Create article_translations table schema with FK relations

**Files**: `src/lib/server/db/schema.ts` (modified)
**Estimated Duration**: 60-75 minutes

### Implementation Tasks

- [ ] Define `article_translations` table using `sqliteTable()`
- [ ] Add `id` field: text UUID primary key
- [ ] Add `articleId` field: text UUID with FK to `articles.id`, ON DELETE CASCADE
- [ ] Add `language` field: text with values 'fr' | 'en'
- [ ] Add `title` field: text required
- [ ] Add `slug` field: text required
- [ ] Add `excerpt` field: text required
- [ ] Add `seoTitle` field: text required
- [ ] Add `seoDescription` field: text required
- [ ] Add `contentMdx` field: text required
- [ ] Add `createdAt` field: integer timestamp with default now
- [ ] Add `updatedAt` field: integer timestamp with default now
- [ ] Add unique constraint on `(articleId, language)` composite
- [ ] Add unique index on `slug` field
- [ ] Add foreign key relation with `references(() => articles.id, { onDelete: 'cascade' })`
- [ ] Add indexes: `articleId_idx`, `language_idx`, `slug_idx`
- [ ] Export table definition
- [ ] Export inferred TypeScript type: `export type ArticleTranslation = typeof article_translations.$inferSelect`

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

**Expected Result**: TypeScript compiles, relations are type-safe, constraints defined

### Review Checklist

#### Schema Structure
- [ ] All 10 fields defined correctly
- [ ] All required fields are non-nullable (title, slug, excerpt, seoTitle, seoDescription, contentMdx)
- [ ] `id` is primary key
- [ ] `articleId` references `articles.id`

#### Foreign Key Relation
- [ ] FK to `articles.id` defined with `references()`
- [ ] ON DELETE CASCADE behavior configured
- [ ] Drizzle relation properly typed

#### Unique Constraints
- [ ] Unique constraint on `(articleId, language)` composite key
- [ ] Unique index on `slug` field for URL generation
- [ ] Constraints prevent duplicate translations

#### Language Field
- [ ] Language field restricted to 'fr' | 'en'
- [ ] Properly typed (not just `text()`)

#### Indexes
- [ ] Index on `articleId` for join performance
- [ ] Index on `language` for filtering
- [ ] Index on `slug` for URL lookups
- [ ] Indexes named clearly

#### Type Safety
- [ ] Table export is properly typed
- [ ] Type inference includes relation to articles
- [ ] No `any` types
- [ ] TypeScript autocomplete works

### Commit Message

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(db): create article_translations table with FK relations

- Define article_translations table with 10 fields
- Add FK to articles.id with ON DELETE CASCADE
- Add unique constraint on (articleId, language) composite key
- Add unique index on slug for URL generation
- Restrict language field to 'fr' | 'en'
- Add indexes for articleId, language, slug
- Export type inference with relations

Part of Phase 2 - Commit 3/6"
```

---

## 📋 Commit 4: Generate and apply first migration

**Files**: `drizzle/migrations/0001_***.sql` (generated), `drizzle/migrations/meta/*` (generated metadata)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Run `pnpm db:generate` to create migration SQL from schema
- [ ] Review generated migration SQL for correctness:
  - [ ] CREATE TABLE statements for articles and article_translations
  - [ ] Foreign key constraints defined
  - [ ] Unique constraints defined
  - [ ] Indexes created
- [ ] If migration looks correct, proceed to apply
- [ ] Run `pnpm db:migrate:local` to apply migration to local D1
- [ ] Verify migration applied successfully (check wrangler output)
- [ ] Test that tables exist with `wrangler d1 execute` command
- [ ] Stage generated migration files for commit

### Validation

```bash
# Generate migration
pnpm db:generate

# Apply migration to local D1
pnpm db:migrate:local

# Verify tables created
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Expected output: articles, article_translations, __drizzle_migrations
```

**Expected Result**:
- Migration SQL generated in `drizzle/migrations/0001_*.sql`
- Migration applied without errors
- Tables visible in local D1 database

### Review Checklist

#### Migration SQL
- [ ] CREATE TABLE for `articles` with all 8 columns
- [ ] CREATE TABLE for `article_translations` with all 10 columns
- [ ] FOREIGN KEY constraint from article_translations.articleId to articles.id
- [ ] ON DELETE CASCADE in FK constraint
- [ ] UNIQUE constraint on (articleId, language)
- [ ] UNIQUE constraint on slug
- [ ] Indexes created (categoryId, status, publishedAt, articleId, language, slug)
- [ ] SQL syntax is valid SQLite

#### Migration Application
- [ ] `pnpm db:migrate:local` executes without errors
- [ ] Tables created in local D1 database
- [ ] Can query tables (even if empty)
- [ ] Migration metadata tracked in `__drizzle_migrations` table

#### Git Staging
- [ ] Migration SQL file staged (`drizzle/migrations/0001_*.sql`)
- [ ] Metadata files staged (`drizzle/migrations/meta/*`)
- [ ] No unintended files included

### Commit Message

```bash
git add drizzle/migrations/
git commit -m "feat(db): generate and apply first migration for articles schema

- Generate migration SQL with drizzle-kit for articles and article_translations
- Apply migration to local D1 database successfully
- Verify tables created with proper constraints and indexes
- Migration includes FK cascade, unique constraints, and performance indexes

Part of Phase 2 - Commit 4/6"
```

---

## 📋 Commit 5: Create sample insert test data

**Files**: `drizzle/seeds/sample-articles.sql` (new), `package.json` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Create directory `drizzle/seeds/` if not exists
- [ ] Create `drizzle/seeds/sample-articles.sql` file
- [ ] Write INSERT statement for 1 sample article:
  - [ ] id: 'test-article-1'
  - [ ] categoryId: NULL (no categories yet)
  - [ ] complexity: 'intermediate'
  - [ ] status: 'published'
  - [ ] publishedAt: current timestamp (e.g., 1699000000)
  - [ ] coverImage: '/images/test-cover.jpg'
  - [ ] createdAt and updatedAt: current timestamp
- [ ] Write INSERT statement for French translation:
  - [ ] id: 'test-translation-fr-1'
  - [ ] articleId: 'test-article-1'
  - [ ] language: 'fr'
  - [ ] title: 'Article de test en français'
  - [ ] slug: 'article-test-fr'
  - [ ] excerpt: 'Ceci est un extrait de test'
  - [ ] seoTitle: 'Article Test | sebc.dev'
  - [ ] seoDescription: 'Description SEO de test'
  - [ ] contentMdx: Sample Markdown content
- [ ] Write INSERT statement for English translation:
  - [ ] id: 'test-translation-en-1'
  - [ ] articleId: 'test-article-1'
  - [ ] language: 'en'
  - [ ] title: 'Test article in English'
  - [ ] slug: 'test-article-en'
  - [ ] excerpt: 'This is a test excerpt'
  - [ ] seoTitle: 'Test Article | sebc.dev'
  - [ ] seoDescription: 'Test SEO description'
  - [ ] contentMdx: Sample Markdown content
- [ ] Add npm script in `package.json`: `"db:seed:articles": "wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql"`
- [ ] Test seed script execution
- [ ] Verify data inserted correctly

### Validation

```bash
# Run seed
pnpm db:seed:articles

# Verify article inserted
wrangler d1 execute DB --local --command="SELECT * FROM articles WHERE id='test-article-1';"

# Verify translations inserted
wrangler d1 execute DB --local --command="SELECT * FROM article_translations WHERE articleId='test-article-1';"
```

**Expected Result**:
- 1 article in `articles` table
- 2 translations in `article_translations` table
- Foreign key relation works (articleId references valid article)
- No constraint errors

### Review Checklist

#### Article Data
- [ ] Article has valid id (UUID format or test id)
- [ ] categoryId is NULL (valid since nullable)
- [ ] complexity is valid ENUM value ('intermediate')
- [ ] status is valid ENUM value ('published')
- [ ] publishedAt is valid timestamp
- [ ] coverImage path looks realistic
- [ ] Timestamps are valid

#### Translation Data (French)
- [ ] articleId matches article id ('test-article-1')
- [ ] language is 'fr'
- [ ] slug is URL-friendly (lowercase, hyphens, no spaces)
- [ ] All required fields populated (title, excerpt, seo fields, contentMdx)
- [ ] Content is in French

#### Translation Data (English)
- [ ] articleId matches article id ('test-article-1')
- [ ] language is 'en'
- [ ] slug is URL-friendly and unique (different from French slug)
- [ ] All required fields populated
- [ ] Content is in English

#### SQL Quality
- [ ] INSERT statements are valid SQLite syntax
- [ ] Values properly quoted (strings in single quotes)
- [ ] Timestamps are integers (not strings)
- [ ] No SQL injection vulnerabilities

#### npm Script
- [ ] Script added to `package.json` under `scripts` section
- [ ] Script name is `db:seed:articles`
- [ ] Command uses `wrangler d1 execute` with correct flags
- [ ] Script runs without errors

### Commit Message

```bash
git add drizzle/seeds/sample-articles.sql package.json
git commit -m "feat(db): create sample article seed data

- Add 1 test article (id: test-article-1, complexity: intermediate, status: published)
- Add French translation (slug: article-test-fr)
- Add English translation (slug: test-article-en)
- Add npm script db:seed:articles for seeding
- Seed data validated: FK relations work, unique constraints enforced

Part of Phase 2 - Commit 5/6"
```

---

## 📋 Commit 6: Add schema validation integration tests

**Files**: `tests/integration/articles-schema.test.ts` (new)
**Estimated Duration**: 60-90 minutes

### Implementation Tasks

- [ ] Create `tests/integration/` directory if not exists
- [ ] Create `tests/integration/articles-schema.test.ts` file
- [ ] Import Vitest testing utilities (`describe`, `it`, `expect`, `beforeEach`)
- [ ] Import Drizzle client and schema
- [ ] Set up test database connection (use local D1)
- [ ] Implement `beforeEach` hook to reset database state:
  - [ ] Delete all article_translations
  - [ ] Delete all articles
- [ ] **Test Suite 1: Articles table insertion**
  - [ ] Test: Insert article with valid data
  - [ ] Test: Query article by id and verify all fields
  - [ ] Test: Verify createdAt and updatedAt are set
- [ ] **Test Suite 2: Article translations table**
  - [ ] Test: Insert 2 translations (FR + EN) for same article
  - [ ] Test: Query translations by articleId
  - [ ] Test: Verify language and content fields correct
- [ ] **Test Suite 3: Unique constraints**
  - [ ] Test: Attempt duplicate (articleId, language) - should throw error
  - [ ] Test: Attempt duplicate slug - should throw error
  - [ ] Test: Verify error messages are meaningful
- [ ] **Test Suite 4: Foreign key cascade**
  - [ ] Test: Insert article with translations
  - [ ] Test: Delete article
  - [ ] Test: Verify translations auto-deleted (CASCADE works)
- [ ] **Test Suite 5: ENUM validation**
  - [ ] Test: Insert article with invalid complexity - should fail
  - [ ] Test: Insert article with invalid status - should fail
  - [ ] Test: Verify valid ENUM values work

### Validation

```bash
# Run integration tests
pnpm test tests/integration/articles-schema.test.ts

# Run with coverage
pnpm test:coverage tests/integration/articles-schema.test.ts
```

**Expected Result**:
- All tests pass (15+ test cases)
- Coverage >80% for schema validation
- No flaky tests

### Review Checklist

#### Test Structure
- [ ] File uses Vitest syntax (`describe`, `it`, `expect`)
- [ ] Tests organized into 5 logical suites
- [ ] `beforeEach` properly resets database state
- [ ] Test isolation works (tests can run in any order)

#### Test Suite 1: Articles Insertion
- [ ] Test inserts article successfully
- [ ] Test queries article and verifies all fields
- [ ] Test checks timestamps are set
- [ ] Assertions are specific and meaningful

#### Test Suite 2: Translations
- [ ] Test inserts 2 translations (FR + EN)
- [ ] Test queries by articleId
- [ ] Test verifies language field ('fr', 'en')
- [ ] Test verifies content fields populated

#### Test Suite 3: Unique Constraints
- [ ] Test attempts duplicate (articleId, language) and expects error
- [ ] Test attempts duplicate slug and expects error
- [ ] Test catches correct error type (constraint violation)
- [ ] Error messages are checked

#### Test Suite 4: Foreign Key Cascade
- [ ] Test creates article + translations
- [ ] Test deletes article
- [ ] Test verifies translations no longer exist
- [ ] CASCADE behavior validated

#### Test Suite 5: ENUM Validation
- [ ] Test invalid complexity value (e.g., 'expert') fails
- [ ] Test invalid status value (e.g., 'archived') fails
- [ ] Test valid values work
- [ ] Error handling is correct

#### Code Quality
- [ ] No `any` types
- [ ] Clear test descriptions
- [ ] No commented-out tests
- [ ] No `test.skip` without justification
- [ ] Assertions are meaningful (not just `.toBeTruthy()`)

#### Database Handling
- [ ] Database connection properly configured
- [ ] Cleanup happens in `beforeEach` (not `afterEach`)
- [ ] No hardcoded database paths
- [ ] Tests use local D1 database

### Commit Message

```bash
git add tests/integration/articles-schema.test.ts
git commit -m "test(db): add comprehensive schema validation integration tests

- Test Suite 1: Articles table insertion and querying
- Test Suite 2: Translations with FR/EN languages
- Test Suite 3: Unique constraints (articleId+language, slug)
- Test Suite 4: Foreign key CASCADE on article deletion
- Test Suite 5: ENUM validation for complexity and status
- All 15+ tests pass with >80% coverage

Part of Phase 2 - Commit 6/6"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist
- [ ] All 6 commits completed in order
- [ ] All integration tests pass
- [ ] TypeScript type-checking passes
- [ ] Linter passes with no errors
- [ ] Migration applied successfully to local D1
- [ ] Sample data inserted successfully
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# All tests
pnpm test

# Verify migration
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Verify seed data
pnpm db:seed:articles
wrangler d1 execute DB --local --command="SELECT COUNT(*) FROM articles;"
```

**Phase 2 is complete when all checkboxes are checked! 🎉**

---

## 🔗 Next Steps

1. Update INDEX.md status to ✅ COMPLETED
2. Update EPIC_TRACKING.md (Phase 2 complete)
3. Proceed to Phase 3: Taxonomy Schemas (Categories, Tags, ArticleTags)
