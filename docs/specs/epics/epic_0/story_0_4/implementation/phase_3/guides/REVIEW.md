# Phase 3 - Code Review Guide

Complete guide for reviewing the Phase 3 implementation: Taxonomy Schemas.

---

## 🎯 Review Objective

Validate that the implementation:
- ✅ Defines 3 taxonomy tables correctly (categories, tags, articleTags)
- ✅ Establishes proper foreign key relationships with cascading deletes
- ✅ Creates and applies migration successfully without schema errors
- ✅ Seeds 9 canonical categories with accurate metadata
- ✅ Includes comprehensive integration tests covering taxonomy operations
- ✅ Follows Drizzle ORM and SQLite best practices
- ✅ Maintains type safety (100% TypeScript strict mode)

---

## 📋 Review Approach

Phase 3 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)
- Easier to digest (15-45 min per commit)
- Progressive validation (schema → migration → seed → tests)
- Targeted feedback per commit

**Option B: Global review at once**
- Faster (2-3h total)
- Immediate overview of complete taxonomy layer
- Requires more focus

**Estimated Total Time**: 1.5-2.5h

---

## 🔍 Commit-by-Commit Review

### Commit 1: Define categories table schema

**Files**: `src/lib/server/db/schema.ts` (modified) (~30 lines)
**Duration**: 20-30 minutes

#### Review Checklist

##### Schema Structure
- [ ] `categories` table defined using `sqliteTable()`
- [ ] All 8 required fields present:
  - [ ] `id` - text, primary key
  - [ ] `key` - text, unique, not null
  - [ ] `nameFr` - text, not null
  - [ ] `nameEn` - text, not null
  - [ ] `slugFr` - text, not null
  - [ ] `slugEn` - text, not null
  - [ ] `icon` - text, not null
  - [ ] `color` - text, not null
- [ ] Unique constraint on `key` field (`.unique()` or unique index)
- [ ] Table exported: `export const categories = sqliteTable(...)`

##### Documentation
- [ ] JSDoc comment above table definition
- [ ] Comment explains: 9 canonical categories
- [ ] Comment mentions: Modifiable but not deletable
- [ ] Comment describes purpose: Primary article classification

##### Code Quality
- [ ] No TypeScript errors
- [ ] Consistent formatting with existing tables
- [ ] No unused imports
- [ ] Field names follow camelCase convention
- [ ] No `any` types

#### Technical Validation

```bash
# Type-check
pnpm tsc --noEmit

# Verify Drizzle parses schema
pnpm db:generate --check
```

**Expected Result**: No errors, schema valid

#### Questions to Ask

1. **Are all 8 fields necessary?** Yes, bilingual names/slugs + icon/color are required for UX/UI
2. **Why TEXT type for all fields?** SQLite best practice (D1 is SQLite-based, no VARCHAR)
3. **Why unique constraint on `key` vs `id`?** `key` is business identifier, `id` is technical identifier

---

### Commit 2: Define tags and articleTags junction tables

**Files**: `src/lib/server/db/schema.ts` (modified) (~40 lines)
**Duration**: 25-35 minutes

#### Review Checklist

##### Tags Table
- [ ] `tags` table defined with `sqliteTable()`
- [ ] All 4 required fields:
  - [ ] `id` - text, primary key
  - [ ] `nameFr` - text, not null
  - [ ] `nameEn` - text, not null
  - [ ] `createdAt` - integer (timestamp mode), not null, default now
- [ ] Table exported: `export const tags = sqliteTable(...)`
- [ ] JSDoc comment explains: Flexible taxonomy, admin-managed

##### ArticleTags Junction Table
- [ ] `articleTags` table defined with `sqliteTable()`
- [ ] Two FK fields:
  - [ ] `articleId` - text, not null
  - [ ] `tagId` - text, not null
- [ ] Composite primary key defined: `primaryKey: { columns: [articleId, tagId] }`
- [ ] Foreign key to `articles.id` with `.references(() => articles.id, { onDelete: 'cascade' })`
- [ ] Foreign key to `tags.id` with `.references(() => tags.id, { onDelete: 'cascade' })`
- [ ] Table exported: `export const articleTags = sqliteTable(...)`
- [ ] JSDoc comment explains: Many-to-Many, composite PK prevents duplicates

##### Articles Table Update (if applicable)
- [ ] If `categoryId` was nullable in Phase 2:
  - [ ] FK reference added: `.references(() => categories.id)`
  - [ ] Behavior appropriate (nullable or not)
- [ ] If FK already existed, verify it's correct

##### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types
- [ ] Consistent formatting
- [ ] Proper imports for all functions used
- [ ] JSDoc comments are clear and accurate

#### Technical Validation

```bash
# Type-check all tables
pnpm tsc --noEmit

# Verify Drizzle recognizes relationships
pnpm db:generate --check
```

**Expected Result**: No errors, FKs and composite PK recognized

#### Questions to Ask

1. **Why composite primary key vs auto-increment ID?** Best practice for junction tables, prevents duplicate pairs naturally
2. **Why ON DELETE CASCADE?** If article or tag deleted, junction entries should be removed automatically
3. **Why integer for createdAt?** SQLite stores timestamps as integers (Unix epoch), Drizzle's timestamp mode handles conversion

---

### Commit 3: Generate and apply taxonomy migration

**Files**: `drizzle/migrations/0002_add_taxonomy_tables.sql` (generated), `drizzle/migrations/meta/` (updated) (~80 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Migration SQL Content
- [ ] File named correctly (e.g., `0002_add_taxonomy_tables.sql`)
- [ ] CREATE TABLE statement for `categories` with 8 columns
- [ ] CREATE TABLE statement for `tags` with 4 columns
- [ ] CREATE TABLE statement for `articleTags` with composite PRIMARY KEY
- [ ] FOREIGN KEY constraints for `articleTags`:
  - [ ] FK to `articles.id` with ON DELETE CASCADE
  - [ ] FK to `tags.id` with ON DELETE CASCADE
- [ ] UNIQUE constraint on `categories.key`
- [ ] If `articles.categoryId` FK added, verify ALTER TABLE or CREATE statement
- [ ] No SQL syntax errors

##### Migration Metadata
- [ ] `meta/_journal.json` updated with new migration entry
- [ ] Migration hash generated correctly
- [ ] Previous migrations still listed

##### Migration Execution
- [ ] Migration applied successfully (`pnpm db:migrate:local`)
- [ ] No errors in Wrangler output
- [ ] All 3 tables created in local D1
- [ ] Previous tables intact (articles, article_translations)

##### Code Quality
- [ ] Migration files committed (SQL + meta JSON)
- [ ] No manual edits to generated SQL (breaks drizzle-kit tracking)
- [ ] Migration is atomic (single transaction if possible)

#### Technical Validation

```bash
# Generate migration (already done, verify output)
pnpm db:generate

# Apply migration locally
pnpm db:migrate:local

# Verify tables exist
wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('categories', 'tags', 'articleTags');"
```

**Expected Result**: 3 rows returned (categories, tags, articleTags)

#### Questions to Ask

1. **Is the migration reversible?** Manual rollback required (drop tables), document if needed
2. **Are there any breaking changes?** Adding FK to articles.categoryId might require existing articles to have valid categoryId
3. **Why this migration number (0002)?** Should be sequential after Phase 2's migration (0001)

---

### Commit 4: Create seed script for 9 canonical categories

**Files**: `drizzle/seeds/categories.sql` (new), `package.json` (modified) (~60 lines)
**Duration**: 20-30 minutes

#### Review Checklist

##### Seed Script Content
- [ ] File created: `drizzle/seeds/categories.sql`
- [ ] Header comment explains purpose (canonical categories)
- [ ] Uses `INSERT OR IGNORE` for idempotency
- [ ] All 9 categories included:
  1. [ ] news - Actualités / News
  2. [ ] deep-analysis - Analyse Approfondie / Deep Analysis
  3. [ ] learning-path - Parcours d'Apprentissage / Learning Path
  4. [ ] retrospective - Rétrospective / Retrospective
  5. [ ] tutorial - Tutoriel / Tutorial
  6. [ ] case-study - Étude de Cas / Case Study
  7. [ ] quick-tips - Astuces Rapides / Quick Tips
  8. [ ] behind-scenes - Dans les Coulisses / Behind the Scenes
  9. [ ] tool-test - Test d'Outil / Tool Test

##### Category Data Accuracy
- [ ] Each INSERT has all 8 fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- [ ] IDs are consistent (e.g., 'cat-1' through 'cat-9')
- [ ] Keys are URL-safe (lowercase, hyphens, no spaces)
- [ ] French names are correct (with accents: Actualités, Rétrospective)
- [ ] English names are correct
- [ ] French slugs match French names (lowercase, no accents: actualites, retrospective)
- [ ] English slugs match English names (lowercase, hyphens: learning-path, case-study)
- [ ] Icons are valid Lucide React icon names:
  - Newspaper, Microscope, Route, Calendar, BookOpen, FileText, Zap, Eye, Wrench
- [ ] Colors are valid hex codes (6 characters, starting with #):
  - #3B82F6 (blue), #8B5CF6 (purple), #10B981 (green), #F97316 (orange), etc.
- [ ] Single quotes escaped correctly in French (e.g., `d''Apprentissage`, `d''Outil`)

##### Package.json
- [ ] `db:seed` script added to `scripts` section
- [ ] Script command: `wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql`
- [ ] Path to SQL file is correct

##### Execution
- [ ] Seed script runs without errors (`pnpm db:seed`)
- [ ] 9 categories inserted (verify count)
- [ ] Re-running seed is idempotent (no duplicates, no errors)
- [ ] All categories queryable

#### Technical Validation

```bash
# Execute seed
pnpm db:seed

# Verify count
wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories;"

# Verify keys
wrangler d1 execute DB --local --command "SELECT key FROM categories ORDER BY key;"

# Re-run seed (should be idempotent)
pnpm db:seed
```

**Expected Results**:
- Count: 9
- Keys: behind-scenes, case-study, deep-analysis, learning-path, news, quick-tips, retrospective, tool-test, tutorial
- No errors on re-run

#### Questions to Ask

1. **Why these specific icons and colors?** Should reference UX/UI spec for design system consistency
2. **Can categories be modified later?** Yes, via migrations (UPDATE statements), but not deleted
3. **Why fixed IDs ('cat-1' to 'cat-9')?** Easier to reference in seed data and tests, UUIDs overkill for 9 fixed items

---

### Commit 5: Add integration tests for taxonomy operations

**Files**: `tests/integration/taxonomy-schema.test.ts` (new) (~150 lines)
**Duration**: 30-45 minutes

#### Review Checklist

##### Test Structure
- [ ] File created: `tests/integration/taxonomy-schema.test.ts`
- [ ] Proper imports: Vitest (`describe`, `it`, `beforeEach`, `expect`)
- [ ] Database connection and tables imported
- [ ] `execSync` imported for seeding
- [ ] Uses `describe` blocks for test suites
- [ ] Uses `it` or `test` for individual tests

##### Test Coverage - Categories
- [ ] Test: Retrieve all 9 canonical categories
- [ ] Test: Query category by key (e.g., 'news')
- [ ] Test: Verify category structure (all 8 fields present and correct types)
- [ ] Test: Unique constraint on key (duplicate insert fails or is ignored)
- [ ] Categories verified against seed data

##### Test Coverage - Tags
- [ ] Test: Insert tag with bilingual names
- [ ] Test: Query tag by ID
- [ ] Test: Update tag name (optional but recommended)
- [ ] Test: Delete tag (optional but recommended)
- [ ] Tests use proper assertions (toHaveLength, toBe, etc.)

##### Test Coverage - ArticleTags Junction
- [ ] Test: Link article to tag (insert articleTag)
- [ ] Test: Query tags for specific article (join or separate queries)
- [ ] Test: Composite primary key prevents duplicates (insert same pair twice)
- [ ] Test: ON DELETE CASCADE for article (deleting article removes articleTags)
- [ ] Test: ON DELETE CASCADE for tag (deleting tag removes articleTags)

##### Test Quality
- [ ] Uses local D1 database (not mocks)
- [ ] `beforeEach` hook seeds test database consistently
- [ ] Tests are isolated (each starts with clean state)
- [ ] Test names are descriptive (user story format or clear intent)
- [ ] Uses proper Vitest assertions (`expect(...).toBe()`, `.toHaveLength()`, `.toThrow()`, etc.)
- [ ] No hardcoded IDs that might break (use fixtures or query for IDs)
- [ ] Tests clean up if needed (or rely on beforeEach reset)

##### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types
- [ ] Consistent formatting
- [ ] Imports are organized
- [ ] No console.logs or debug code
- [ ] Comments explain complex test logic if needed

#### Technical Validation

```bash
# Run integration tests
pnpm test:integration

# Run specific test file
pnpm test tests/integration/taxonomy-schema.test.ts

# Run with coverage
pnpm test:coverage tests/integration/taxonomy-schema.test.ts
```

**Expected Results**:
- All tests pass (✓)
- Coverage >80% for taxonomy-related code
- No errors or warnings
- Tests run in <10 seconds (integration tests are slower than unit tests)

#### Questions to Ask

1. **Why integration tests vs unit tests?** Taxonomy tests verify database operations, require real D1 instance
2. **Why seed before each test?** Ensures tests start with known state, prevents test interdependence
3. **How are tests isolated?** `beforeEach` re-seeds database, or tests use unique IDs per test

---

## ✅ Global Validation

After reviewing all 5 commits:

### Architecture & Design
- [ ] All 3 taxonomy tables follow SQLite best practices (TEXT types, proper constraints)
- [ ] Foreign key relationships are logical and correct
- [ ] Composite primary key pattern used correctly for junction table
- [ ] ON DELETE CASCADE prevents orphaned records
- [ ] Schema design matches Architecture documentation (if specified)

### Code Quality
- [ ] Consistent style across all schema definitions
- [ ] Clear and consistent naming (camelCase for fields, plural for tables)
- [ ] JSDoc comments provide context and explain design decisions
- [ ] No commented-out code or debug statements

### Testing
- [ ] All taxonomy features tested (categories, tags, junction)
- [ ] Edge cases covered (duplicate prevention, cascade deletes)
- [ ] Integration tests use real D1 database
- [ ] Coverage >80% for taxonomy operations
- [ ] Tests are meaningful and catch regressions

### Type Safety
- [ ] No `any` types (unless justified and documented)
- [ ] Drizzle type inference works correctly
- [ ] TypeScript strict mode passes
- [ ] All table exports have proper types

### Data Integrity
- [ ] 9 canonical categories match specification exactly
- [ ] Category metadata (icons, colors) are valid and reference-able
- [ ] Seed script is idempotent and re-runnable
- [ ] Foreign keys enforce referential integrity

### Documentation
- [ ] JSDoc comments explain non-obvious design choices
- [ ] Seed script has header comment
- [ ] README or dev docs updated if new commands added (`db:seed`)
- [ ] Migration is documented in git history

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 3: Taxonomy Schemas

**Reviewer**: [Your Name]
**Date**: [Review Date]
**Commits Reviewed**: All 5 commits (1-5)

### ✅ Strengths

- Schema design is clean and follows SQLite best practices
- Seed script with 9 canonical categories is comprehensive
- Integration tests provide good coverage of taxonomy operations
- ON DELETE CASCADE correctly configured for junction table

### 🔧 Required Changes

1. **Commit 2 - articleTags schema**:
   - **Issue**: Missing JSDoc comment explaining Many-to-Many relationship
   - **Why**: Documentation helps future developers understand junction table purpose
   - **Suggestion**: Add comment above `articleTags` definition explaining composite PK and cascade behavior

2. **Commit 4 - Seed script**:
   - **Issue**: Icon name 'Newspaper' doesn't match Lucide React library (should be 'Newspaper')
   - **Why**: Icon must exist in Lucide to render correctly
   - **Suggestion**: Verify all icon names against Lucide docs: https://lucide.dev/icons

### 💡 Suggestions (Optional)

- Consider adding a migration rollback script (manual SQL to DROP tables)
- Add a test for querying categories by slug (common use case)
- Document category color palette in UX/UI spec for consistency

### 📊 Verdict

- [x] ✅ **APPROVED** - Ready to merge (after addressing required changes)
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

1. Address required changes (JSDoc, icon name verification)
2. Re-run all validations (`pnpm tsc --noEmit`, `pnpm lint`, `pnpm test:integration`)
3. Merge to main branch
4. Proceed to Phase 4 (Validation Chain)
```

---

## 🎯 Review Actions

### If Approved ✅
1. Merge all 5 commits to main branch
2. Update Phase 3 status to COMPLETED in INDEX.md
3. Archive review notes
4. Notify team that Phase 3 is complete
5. Prepare for Phase 4

### If Changes Requested 🔧
1. Create detailed feedback using template above
2. Discuss with developer (schedule review meeting if needed)
3. Track requested changes (create issues or checklist)
4. Re-review after fixes applied

### If Rejected ❌
1. Document major issues preventing approval
2. Schedule discussion with developer and tech lead
3. Plan rework strategy (which commits need changes)
4. Set timeline for fixes and re-review

---

## ❓ FAQ

**Q: What if I disagree with the seed data (icons, colors)?**
A: Check if UX/UI spec defines this. If not, suggest documenting design decisions. If spec exists, seed data should match it.

**Q: Should I review the generated migration SQL in detail?**
A: Yes! Even though it's generated, SQL can have subtle issues. Verify table definitions, FKs, and constraints.

**Q: How detailed should feedback be on tests?**
A: Specific enough to be actionable. Example: "Test 'should prevent duplicate article-tag pairs' passes but doesn't verify error message."

**Q: Can I approve with minor comments?**
A: Yes, mark as approved and note that comments are optional improvements. Separate required changes from suggestions.

**Q: What if tests are flaky?**
A: This is a blocker. Flaky tests undermine confidence. Identify root cause (race conditions, shared state) before approving.

---

## 🔗 Review Resources

- [Story Spec](../../story_0.4.md) - Original requirements
- [PHASES_PLAN.md](../PHASES_PLAN.md) - Phase 3 section
- [Architecture Documentation](/docs/specs/Architecture_technique.md) - Data model reference
- [Drizzle ORM Best Practices](https://orm.drizzle.team/docs/overview)
- [SQLite Foreign Keys](https://www.sqlite.org/foreignkeys.html)
- [Lucide Icons](https://lucide.dev/icons) - Verify icon names
