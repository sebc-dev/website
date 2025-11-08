# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation: Core Database Schema (Articles & Translations).

---

## 🎯 Review Objective

Validate that the implementation:
- ✅ Correctly defines articles and article_translations tables with proper fields and types
- ✅ Implements foreign key relations with CASCADE delete behavior
- ✅ Adds unique constraints to prevent duplicate translations and slugs
- ✅ Uses proper ENUM types for complexity and status fields
- ✅ Generates valid migration SQL and applies it successfully
- ✅ Includes comprehensive integration tests with >80% coverage
- ✅ Follows Drizzle ORM best practices and project standards

---

## 📋 Review Approach

Phase 2 is split into **6 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)
- Easier to digest (15-40 min per commit)
- Progressive validation
- Targeted feedback

**Option B: Global review at once**
- Faster (2-3h total)
- Immediate overview
- Requires more focus

**Estimated Total Time**: 2-3.5 hours

---

## 🔍 Commit-by-Commit Review

### Commit 1: Define ENUM types and base constants

**Files**: `src/lib/server/db/schema.ts` (new, ~80 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### ENUM Definitions
- [ ] File created at correct path: `src/lib/server/db/schema.ts`
- [ ] `ComplexityEnum` defined with exactly 3 values: 'beginner', 'intermediate', 'advanced'
- [ ] `StatusEnum` defined with exactly 2 values: 'draft', 'published'
- [ ] ENUM values match specification exactly (lowercase, no typos)
- [ ] ENUMs use const arrays for proper TypeScript inference
- [ ] Types are exported for use in application code

##### Documentation
- [ ] JSDoc comments explain purpose of each ENUM value
- [ ] File header comment describes purpose of schema file
- [ ] Comments are clear and concise

##### Code Quality
- [ ] No `any` types anywhere
- [ ] Imports are clean and organized
- [ ] Naming follows conventions (PascalCase for types)
- [ ] No commented code
- [ ] No debug statements or console.logs

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

**Expected Result**: No errors, ENUMs properly typed

#### Questions to Ask

1. Do the ENUM values match the story specification?
2. Are the types properly exported for reuse?
3. Is the documentation clear enough for other developers?

---

### Commit 2: Create articles table schema

**Files**: `src/lib/server/db/schema.ts` (modified, +~120 lines)
**Duration**: 20-30 minutes

#### Review Checklist

##### Schema Structure
- [ ] `articles` table defined using `sqliteTable()` from drizzle-orm/sqlite-core
- [ ] All 8 required fields present:
  - [ ] `id`: text UUID primary key
  - [ ] `categoryId`: text UUID nullable
  - [ ] `complexity`: text with ENUM constraint
  - [ ] `status`: text with ENUM constraint
  - [ ] `publishedAt`: integer timestamp nullable
  - [ ] `coverImage`: text nullable
  - [ ] `createdAt`: integer timestamp with default
  - [ ] `updatedAt`: integer timestamp with default

##### Field Types and Constraints
- [ ] `id` is primary key
- [ ] `categoryId` is nullable (allows Phase 2 to work before Phase 3)
- [ ] `complexity` uses ComplexityEnum values
- [ ] `status` uses StatusEnum values
- [ ] `publishedAt` is nullable (only set when published)
- [ ] `coverImage` is nullable (optional field)
- [ ] Timestamps use `integer` type with `mode: 'timestamp'`
- [ ] Timestamps have `defaultNow()` or equivalent

##### Indexes
- [ ] Index on `categoryId` for filtering by category
- [ ] Index on `status` for filtering by draft/published
- [ ] Index on `publishedAt` for sorting/filtering
- [ ] Indexes are named clearly (e.g., `articles_categoryId_idx`)

##### Type Safety
- [ ] Table properly exported
- [ ] Type inference works: `typeof articles.$inferSelect` gives correct type
- [ ] No `any` types
- [ ] TypeScript autocomplete works for all fields

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Verify type inference
# In your editor, hover over: typeof articles.$inferSelect
# Should show all 8 fields with correct types
```

**Expected Result**: TypeScript compiles, types are correct

#### Questions to Ask

1. Why is `categoryId` nullable? (Answer: categories table created in Phase 3)
2. Are the timestamp fields using the correct SQLite type (integer)?
3. Do the indexes cover the most common query patterns?

---

### Commit 3: Create article_translations table schema with FK relations

**Files**: `src/lib/server/db/schema.ts` (modified, +~150 lines)
**Duration**: 25-35 minutes

#### Review Checklist

##### Schema Structure
- [ ] `article_translations` table defined using `sqliteTable()`
- [ ] All 10 required fields present:
  - [ ] `id`: text UUID primary key
  - [ ] `articleId`: text UUID with FK to articles.id
  - [ ] `language`: text with 'fr' | 'en' constraint
  - [ ] `title`: text required
  - [ ] `slug`: text required
  - [ ] `excerpt`: text required
  - [ ] `seoTitle`: text required
  - [ ] `seoDescription`: text required
  - [ ] `contentMdx`: text required
  - [ ] `createdAt`: integer timestamp
  - [ ] `updatedAt`: integer timestamp

##### Foreign Key Relation
- [ ] FK to `articles.id` defined with `references(() => articles.id)`
- [ ] ON DELETE CASCADE configured
- [ ] Relation is properly typed in Drizzle

##### Unique Constraints
- [ ] Unique constraint on composite key `(articleId, language)`
  - Prevents duplicate translations for same article
- [ ] Unique index on `slug` field
  - Ensures URL uniqueness
- [ ] Constraints are named clearly

##### Language Field
- [ ] Language restricted to 'fr' | 'en' (not just text)
- [ ] Properly typed for TypeScript autocomplete

##### Indexes
- [ ] Index on `articleId` for join performance
- [ ] Index on `language` for filtering by language
- [ ] Index on `slug` for URL lookups
- [ ] Indexes named clearly

##### Type Safety
- [ ] Table properly exported
- [ ] Type inference includes relation to articles
- [ ] No `any` types
- [ ] All fields properly typed

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Verify FK relation type inference
# In your editor, check if autocomplete suggests articles table fields
```

**Expected Result**: TypeScript compiles, relations are type-safe

#### Questions to Ask

1. Does the FK cascade delete work correctly? (Deleting article should delete translations)
2. Why is there a unique constraint on (articleId, language)? (One translation per language per article)
3. Is the slug unique across all translations or per article? (Across all)

---

### Commit 4: Generate and apply first migration

**Files**: `drizzle/migrations/0001_***.sql` (generated), `drizzle/migrations/meta/*` (metadata)
**Duration**: 15-20 minutes

#### Review Checklist

##### Migration SQL Quality
- [ ] CREATE TABLE statement for `articles` with all 8 columns
- [ ] CREATE TABLE statement for `article_translations` with all 10 columns
- [ ] FOREIGN KEY constraint from `article_translations.articleId` to `articles.id`
- [ ] ON DELETE CASCADE in FK constraint
- [ ] UNIQUE constraint on (articleId, language)
- [ ] UNIQUE constraint on slug
- [ ] CREATE INDEX statements for all defined indexes
- [ ] SQL syntax is valid SQLite (no MySQL/PostgreSQL-specific syntax)

##### Migration Application
- [ ] Migration applied to local D1 without errors
- [ ] Tables created successfully
- [ ] Can query tables (even if empty):
  ```bash
  wrangler d1 execute DB --local --command="SELECT * FROM articles;"
  wrangler d1 execute DB --local --command="SELECT * FROM article_translations;"
  ```
- [ ] Migration metadata tracked in `__drizzle_migrations` table

##### Migration Metadata
- [ ] `drizzle/migrations/meta/_journal.json` updated correctly
- [ ] Migration hash/timestamp present
- [ ] No duplicate migration entries

##### Git Hygiene
- [ ] Only migration files committed (no unrelated changes)
- [ ] Migration SQL file named correctly (timestamped)
- [ ] Metadata files included

#### Technical Validation

```bash
# Apply migration
pnpm db:migrate:local

# Verify tables
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Expected: articles, article_translations, __drizzle_migrations
```

**Expected Result**: Migration applies successfully, tables created

#### Questions to Ask

1. Does the generated SQL look correct (no obvious errors)?
2. Are all constraints properly defined in SQL?
3. Can the migration be rolled back if needed? (Document manual process)

---

### Commit 5: Create sample insert test data

**Files**: `drizzle/seeds/sample-articles.sql` (new, ~100 lines), `package.json` (modified)
**Duration**: 20-25 minutes

#### Review Checklist

##### Article Data Quality
- [ ] 1 article inserted with valid test id (e.g., 'test-article-1')
- [ ] `categoryId` is NULL (valid since nullable)
- [ ] `complexity` is valid ENUM value ('beginner', 'intermediate', or 'advanced')
- [ ] `status` is valid ENUM value ('draft' or 'published')
- [ ] `publishedAt` is valid integer timestamp (if status is 'published')
- [ ] `coverImage` path looks realistic (e.g., '/images/test-cover.jpg')
- [ ] `createdAt` and `updatedAt` are valid integer timestamps

##### French Translation Quality
- [ ] `articleId` matches article id ('test-article-1')
- [ ] `language` is 'fr'
- [ ] `title` is in French
- [ ] `slug` is URL-friendly (lowercase, hyphens, no spaces, no special chars)
- [ ] `excerpt` is realistic French text (not "lorem ipsum")
- [ ] `seoTitle` and `seoDescription` are populated
- [ ] `contentMdx` has sample Markdown content
- [ ] All required fields are non-null

##### English Translation Quality
- [ ] `articleId` matches article id ('test-article-1')
- [ ] `language` is 'en'
- [ ] `title` is in English
- [ ] `slug` is URL-friendly and unique (different from French slug)
- [ ] `excerpt` is realistic English text
- [ ] `seoTitle` and `seoDescription` are populated
- [ ] `contentMdx` has sample Markdown content
- [ ] All required fields are non-null

##### SQL Quality
- [ ] INSERT statements are valid SQLite syntax
- [ ] String values properly quoted (single quotes)
- [ ] Timestamps are integers (not quoted strings)
- [ ] No SQL injection vulnerabilities
- [ ] Uses `INSERT OR IGNORE` or similar for idempotency (optional but good practice)

##### npm Script
- [ ] Script added to `package.json` under `scripts` section
- [ ] Script named `db:seed:articles`
- [ ] Command uses correct syntax: `wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql`
- [ ] Script runs without errors

#### Technical Validation

```bash
# Run seed
pnpm db:seed:articles

# Verify article
wrangler d1 execute DB --local --command="SELECT * FROM articles WHERE id='test-article-1';"

# Verify translations
wrangler d1 execute DB --local --command="SELECT * FROM article_translations WHERE articleId='test-article-1';"

# Expected: 1 article, 2 translations
```

**Expected Result**: Data inserted successfully, FK relation works

#### Questions to Ask

1. Is the test data realistic enough to be useful for manual testing?
2. Do the slugs follow URL best practices?
3. Can the seed script be run multiple times safely (idempotent)?

---

### Commit 6: Add schema validation integration tests

**Files**: `tests/integration/articles-schema.test.ts` (new, ~180 lines)
**Duration**: 30-40 minutes

#### Review Checklist

##### Test File Structure
- [ ] Uses Vitest syntax (`describe`, `it`, `expect`, `beforeEach`)
- [ ] Imports are clean and organized
- [ ] Database connection properly set up
- [ ] `beforeEach` hook resets database state (deletes all data)

##### Test Suite 1: Articles Table
- [ ] Test: Insert article with valid data succeeds
- [ ] Test: Query article by id returns correct data
- [ ] Test: All fields are populated correctly
- [ ] Test: Timestamps (createdAt, updatedAt) are set automatically
- [ ] Assertions are specific and meaningful

##### Test Suite 2: Translations Table
- [ ] Test: Insert 2 translations (FR + EN) for same article succeeds
- [ ] Test: Query translations by articleId returns both
- [ ] Test: Language field ('fr', 'en') is correct
- [ ] Test: Content fields (title, slug, excerpt, etc.) are populated
- [ ] Assertions verify all fields

##### Test Suite 3: Unique Constraints
- [ ] Test: Duplicate (articleId, language) insertion fails with constraint error
- [ ] Test: Duplicate slug insertion fails with constraint error
- [ ] Test: Error type is checked (constraint violation, not generic error)
- [ ] Test: Error messages are meaningful
- [ ] Valid data still works (positive test alongside negative tests)

##### Test Suite 4: Foreign Key Cascade
- [ ] Test: Insert article with translations
- [ ] Test: Delete article
- [ ] Test: Query translations returns empty (CASCADE deleted them)
- [ ] Test verifies CASCADE behavior explicitly

##### Test Suite 5: ENUM Validation
- [ ] Test: Invalid complexity value (e.g., 'expert') fails
- [ ] Test: Invalid status value (e.g., 'archived') fails
- [ ] Test: Valid ENUM values work correctly
- [ ] Error handling is proper (catches correct error type)

##### Code Quality
- [ ] No `any` types
- [ ] Test descriptions are clear (describe what's being tested)
- [ ] No commented-out tests without explanation
- [ ] No `test.skip` without justification
- [ ] Assertions are meaningful (not just `.toBeTruthy()`)
- [ ] Each test is focused (tests one thing)

##### Test Isolation
- [ ] `beforeEach` properly cleans database
- [ ] Tests can run in any order (no inter-dependencies)
- [ ] No hardcoded data from other tests
- [ ] Each test creates its own test data

##### Database Handling
- [ ] Uses local D1 database (not remote)
- [ ] Database connection is properly configured
- [ ] No hardcoded database paths
- [ ] Cleanup happens before each test (not after)

#### Technical Validation

```bash
# Run tests
pnpm test tests/integration/articles-schema.test.ts

# Run with coverage
pnpm test:coverage tests/integration/articles-schema.test.ts

# Expected: All tests pass, coverage >80%
```

**Expected Result**: All 15+ tests pass, good coverage

#### Questions to Ask

1. Do the tests cover all schema constraints?
2. Are negative tests (error cases) properly handled?
3. Is test isolation working (tests don't affect each other)?
4. Are the tests maintainable and easy to understand?

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design
- [ ] Schema matches specification in story_0.4.md
- [ ] Tables follow naming conventions (snake_case for DB, camelCase for TS)
- [ ] Foreign key relations are logical and correct
- [ ] Indexes cover common query patterns
- [ ] ENUM types prevent invalid data

### Code Quality
- [ ] Consistent code style throughout
- [ ] Clear and descriptive naming
- [ ] Appropriate comments where needed
- [ ] No dead code or commented-out sections
- [ ] No debug statements (console.log, etc.)

### Testing
- [ ] All features tested (insertion, querying, constraints, cascades, ENUMs)
- [ ] Edge cases covered (duplicates, invalid values, cascades)
- [ ] Test coverage >80%
- [ ] Tests are meaningful (not just for coverage numbers)
- [ ] Tests are stable (no flaky tests)

### Type Safety
- [ ] No `any` types (unless absolutely necessary and documented)
- [ ] Proper type inference from Drizzle schemas
- [ ] TypeScript autocomplete works for all table fields
- [ ] Exported types for application use

### Database Design
- [ ] Tables normalized appropriately (1-to-many between articles and translations)
- [ ] Foreign keys enforce referential integrity
- [ ] Unique constraints prevent data anomalies
- [ ] Indexes improve query performance
- [ ] No redundant data

### Migration Quality
- [ ] Generated SQL is valid SQLite
- [ ] Migration applies without errors
- [ ] Migration is versioned and tracked
- [ ] No destructive changes (safe for future rollback strategy)

### Documentation
- [ ] Schema fields documented with JSDoc or comments
- [ ] ENUM values explained
- [ ] Complex logic has explanatory comments
- [ ] README updated if needed (migration workflow)

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: 1-6 (all)

### ✅ Strengths

- Schema correctly implements articles and translations as 1-to-many relationship
- Foreign key CASCADE behavior properly configured
- Comprehensive test coverage (80%+) with meaningful assertions
- Clean TypeScript type inference from Drizzle schemas
- Migration applies successfully to local D1

### 🔧 Required Changes

1. **src/lib/server/db/schema.ts (Commit 2)**:
   - Issue: categoryId should have comment explaining why nullable
   - Why: Future developers need context for Phase 3 dependency
   - Suggestion: Add JSDoc comment: `// Nullable until Phase 3 (categories table created)`

2. **tests/integration/articles-schema.test.ts (Commit 6)**:
   - Issue: Test for ENUM validation missing
   - Why: Specification requires ENUM validation tests
   - Suggestion: Add test suite 5 as specified in COMMIT_CHECKLIST.md

### 💡 Suggestions (Optional)

- Consider adding index on `article_translations.language` for better filtering performance
- Seed data could include more realistic MDX content (with code blocks, etc.)
- Test descriptions could be more specific (e.g., "should prevent duplicate FR translation for same article")

### 📊 Verdict

- [x] ✅ **APPROVED** - Ready to merge after addressing required changes
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

1. Address required changes (add comments, complete test suite 5)
2. Re-run tests to verify coverage still >80%
3. Update INDEX.md status to ✅ COMPLETED
4. Proceed to Phase 3
```

---

## 🎯 Review Actions

### If Approved ✅
1. Merge the commits to main branch
2. Update `INDEX.md` status to ✅ COMPLETED
3. Update `EPIC_TRACKING.md` (Phase 2 complete, 2/5)
4. Archive review notes
5. Prepare for Phase 3

### If Changes Requested 🔧
1. Create detailed feedback using template above
2. Discuss with developer (schedule code review meeting if needed)
3. Developer makes fixes
4. Re-review after fixes (quick pass, 30-60 min)

### If Rejected ❌
1. Document major issues clearly
2. Schedule discussion with developer and tech lead
3. Plan rework strategy (may need to adjust PHASES_PLAN.md)
4. Re-review after major rework

---

## ❓ FAQ

**Q: What if I disagree with an implementation choice?**
A: Discuss with the developer. If it works, meets requirements, and follows project standards, it might be acceptable even if you'd do it differently. Focus on correctness, not personal preference.

**Q: Should I review tests as thoroughly as code?**
A: Yes! Tests are as important as the code. Ensure they're meaningful, cover edge cases, and aren't flaky.

**Q: How detailed should feedback be?**
A: Specific enough to be actionable. Include file path, line number (if possible), what's wrong, why it's wrong, and a concrete suggestion to fix it.

**Q: Can I approve with minor comments?**
A: Yes, mark as approved and note that comments are optional improvements (not blockers).

**Q: What if I'm not sure about something?**
A: Flag it for discussion. It's better to ask than to approve something questionable.

**Q: How do I verify type safety?**
A: Check TypeScript compilation (`pnpm tsc --noEmit`) and use your editor's autocomplete to verify type inference works.

---

## 🔗 Related Documents

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Detailed commit plan
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Per-commit checklist
- [VALIDATION_CHECKLIST.md](../validation/VALIDATION_CHECKLIST.md) - Final validation
- [Story 0.4 Specification](../../story_0.4.md) - Original requirements
