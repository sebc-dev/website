# Phase 3 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 3.

---

## 📋 Commit 1: Define categories table schema

**Files**: `src/lib/server/db/schema.ts` (modified)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Open `src/lib/server/db/schema.ts`
- [ ] Import necessary Drizzle types: `sqliteTable`, `text`
- [ ] Add `categories` table definition after existing tables
- [ ] Define 8 fields:
  - [ ] `id` - text, primary key
  - [ ] `key` - text, unique, not null (e.g., 'news', 'tutorial')
  - [ ] `nameFr` - text, not null (French display name)
  - [ ] `nameEn` - text, not null (English display name)
  - [ ] `slugFr` - text, not null (French slug)
  - [ ] `slugEn` - text, not null (English slug)
  - [ ] `icon` - text, not null (Lucide icon name)
  - [ ] `color` - text, not null (hex color code)
- [ ] Add unique constraint on `key` field using `unique()`
- [ ] Add JSDoc comment above table explaining:
  - 9 canonical categories
  - Modifiable but not deletable
  - Used for primary article classification
- [ ] Export the table as `categories`

### Validation

```bash
# Type-check schema
pnpm tsc --noEmit

# Verify Drizzle can parse (dry-run)
pnpm db:generate --check
```

**Expected Result**:
- No TypeScript errors
- Drizzle recognizes categories table
- No migration generated yet (schema only)

### Review Checklist

#### Schema Structure
- [ ] All 8 required fields present
- [ ] Field names follow camelCase convention
- [ ] `id` is primary key
- [ ] `key` has unique constraint
- [ ] All fields are `text` type (SQLite best practice)

#### Code Quality
- [ ] No TypeScript errors
- [ ] JSDoc comment is clear and comprehensive
- [ ] Table exported correctly
- [ ] Consistent formatting with existing tables
- [ ] No unused imports

### Commit Message

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(db): add categories table schema

- Define 8 fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- Add unique constraint on key field
- Document 9 canonical categories (modifiable, not deletable)
- Categories used for primary article classification

Part of Phase 3 - Commit 1/5"
```

---

## 📋 Commit 2: Define tags and articleTags junction tables

**Files**: `src/lib/server/db/schema.ts` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Open `src/lib/server/db/schema.ts`
- [ ] Define `tags` table after `categories`:
  - [ ] `id` - text, primary key
  - [ ] `nameFr` - text, not null (French tag name)
  - [ ] `nameEn` - text, not null (English tag name)
  - [ ] `createdAt` - integer (timestamp mode), not null, default now
- [ ] Define `articleTags` junction table:
  - [ ] `articleId` - text, not null, foreign key to `articles.id`
  - [ ] `tagId` - text, not null, foreign key to `tags.id`
  - [ ] Add composite primary key: `primaryKey: { columns: [articleId, tagId] }`
  - [ ] Add FK reference to `articles.id` with `onDelete: 'cascade'`
  - [ ] Add FK reference to `tags.id` with `onDelete: 'cascade'`
- [ ] Update `articles` table (if categoryId is nullable from Phase 2):
  - [ ] Add FK reference from `categoryId` to `categories.id`
  - [ ] Use `.references(() => categories.id)`
- [ ] Add JSDoc comments for both new tables:
  - `tags`: Flexible taxonomy, admin-managed
  - `articleTags`: Many-to-Many junction, composite PK prevents duplicates
- [ ] Export both tables

### Validation

```bash
# Type-check all tables
pnpm tsc --noEmit

# Verify Drizzle parses all relationships
pnpm db:generate --check
```

**Expected Result**:
- No TypeScript errors
- Drizzle recognizes tags and articleTags tables
- Foreign key relationships detected
- Composite primary key validated

### Review Checklist

#### Tags Table
- [ ] All 4 fields present (id, nameFr, nameEn, createdAt)
- [ ] `createdAt` uses timestamp mode with default now
- [ ] Table exported correctly
- [ ] JSDoc documents flexible taxonomy

#### ArticleTags Junction Table
- [ ] Both FK fields present (articleId, tagId)
- [ ] Composite primary key defined correctly
- [ ] FK to articles includes `onDelete: 'cascade'`
- [ ] FK to tags includes `onDelete: 'cascade'`
- [ ] JSDoc explains Many-to-Many relationship

#### Articles Table Update
- [ ] `categoryId` FK references `categories.id` (if not already done)
- [ ] FK behavior appropriate (nullable or not, based on Phase 2)

#### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types
- [ ] Consistent formatting
- [ ] JSDoc comments are clear

### Commit Message

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(db): add tags and articleTags junction tables

- Define tags table with bilingual names (nameFr, nameEn)
- Define articleTags junction with composite PK (articleId, tagId)
- Add ON DELETE CASCADE for both FKs (articles, tags)
- Update articles.categoryId FK to reference categories.id
- Enable Many-to-Many article-tag relationship

Part of Phase 3 - Commit 2/5"
```

---

## 📋 Commit 3: Generate and apply taxonomy migration

**Files**: `drizzle/migrations/0002_add_taxonomy_tables.sql` (generated), `drizzle/migrations/meta/` (updated)
**Estimated Duration**: 20-30 minutes

### Implementation Tasks

- [ ] Ensure local D1 database is running (from Phase 1)
- [ ] Generate migration:
  ```bash
  pnpm db:generate
  ```
- [ ] Review generated SQL in `drizzle/migrations/0002_*` (or next sequential number):
  - [ ] Verify CREATE TABLE for `categories` (8 fields)
  - [ ] Verify CREATE TABLE for `tags` (4 fields)
  - [ ] Verify CREATE TABLE for `articleTags` (composite PK syntax)
  - [ ] Verify FOREIGN KEY constraints for articleTags
  - [ ] Verify ALTER TABLE or CREATE for articles.categoryId FK (if added in Commit 2)
  - [ ] Verify UNIQUE constraint on categories.key
- [ ] Apply migration locally:
  ```bash
  pnpm db:migrate:local
  ```
- [ ] Verify tables created:
  ```bash
  wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('categories', 'tags', 'articleTags');"
  ```
- [ ] Stage all migration files (SQL + meta JSON)

### Validation

```bash
# Generate migration
pnpm db:generate

# Apply locally
pnpm db:migrate:local

# Verify tables exist
wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected Result**:
- Migration SQL generated successfully
- Migration applies without errors
- Query returns 3 rows: categories, tags, articleTags
- No errors in Wrangler output

### Review Checklist

#### Migration SQL
- [ ] CREATE TABLE statements for all 3 tables
- [ ] Categories table has 8 columns
- [ ] Tags table has 4 columns
- [ ] ArticleTags has composite PRIMARY KEY syntax correct for SQLite
- [ ] FOREIGN KEY constraints defined (articleId → articles, tagId → tags)
- [ ] ON DELETE CASCADE clauses present
- [ ] UNIQUE constraint on categories.key
- [ ] No syntax errors

#### Migration Execution
- [ ] Migration applies successfully (no errors)
- [ ] All 3 tables created in local D1
- [ ] Previous tables still exist (articles, article_translations from Phase 2)
- [ ] Migration number is sequential (e.g., 0002 if Phase 2 was 0001)

#### Code Quality
- [ ] Migration files committed (SQL + meta JSON)
- [ ] No manual edits to generated SQL (breaks drizzle-kit)
- [ ] Migration is reversible (can drop tables if needed)

### Commit Message

```bash
git add drizzle/migrations/
git commit -m "chore(db): generate and apply taxonomy migration

- Generate migration 0002 for categories, tags, articleTags
- Create categories table with 8 fields + unique key constraint
- Create tags table with 4 fields
- Create articleTags junction with composite PK
- Apply migration successfully to local D1
- Verify all tables created without errors

Part of Phase 3 - Commit 3/5"
```

---

## 📋 Commit 4: Create seed script for 9 canonical categories

**Files**: `drizzle/seeds/categories.sql` (new), `package.json` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Create directory if not exists: `mkdir -p drizzle/seeds`
- [ ] Create `drizzle/seeds/categories.sql` file
- [ ] Add SQL header comment explaining canonical categories
- [ ] Write INSERT OR IGNORE statements for 9 categories:
  1. [ ] Actualités (news) - key: 'news', icon: 'Newspaper', color: '#3B82F6'
  2. [ ] Analyse Approfondie (deep-analysis) - key: 'deep-analysis', icon: 'Microscope', color: '#8B5CF6'
  3. [ ] Parcours d'Apprentissage (learning-path) - key: 'learning-path', icon: 'Route', color: '#10B981'
  4. [ ] Rétrospective (retrospective) - key: 'retrospective', icon: 'Calendar', color: '#F97316'
  5. [ ] Tutoriel (tutorial) - key: 'tutorial', icon: 'BookOpen', color: '#14B8A6'
  6. [ ] Étude de Cas (case-study) - key: 'case-study', icon: 'FileText', color: '#6366F1'
  7. [ ] Astuces Rapides (quick-tips) - key: 'quick-tips', icon: 'Zap', color: '#EAB308'
  8. [ ] Dans les Coulisses (behind-scenes) - key: 'behind-scenes', icon: 'Eye', color: '#EC4899'
  9. [ ] Test d'Outil (tool-test) - key: 'tool-test', icon: 'Wrench', color: '#6B7280'
- [ ] Use consistent IDs: 'cat-1' through 'cat-9'
- [ ] Include all 8 fields for each row
- [ ] Escape single quotes in French names (e.g., `d''Apprentissage`)
- [ ] Open `package.json`
- [ ] Add script: `"db:seed": "wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql"`
- [ ] Execute seed script:
  ```bash
  pnpm db:seed
  ```
- [ ] Verify 9 categories loaded:
  ```bash
  wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories;"
  ```

### Validation

```bash
# Execute seed script
pnpm db:seed

# Verify count
wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories;"

# Verify keys
wrangler d1 execute DB --local --command "SELECT key FROM categories ORDER BY key;"

# Re-run seed (should be idempotent)
pnpm db:seed
```

**Expected Result**:
- Seed script executes without errors
- COUNT returns 9
- All keys present (behind-scenes, case-study, deep-analysis, learning-path, news, quick-tips, retrospective, tool-test, tutorial)
- Re-running seed doesn't create duplicates

### Review Checklist

#### Seed Script Content
- [ ] All 9 canonical categories included
- [ ] Each INSERT has all 8 fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- [ ] IDs are consistent ('cat-1' to 'cat-9')
- [ ] Keys are URL-safe (lowercase, hyphens)
- [ ] French names are correct (Actualités, Analyse Approfondie, etc.)
- [ ] English names are correct (News, Deep Analysis, etc.)
- [ ] Slugs match locale (slugFr: 'actualites', slugEn: 'news')
- [ ] Icons match Lucide React library (Newspaper, Microscope, Route, etc.)
- [ ] Colors are valid hex codes (#3B82F6, #8B5CF6, etc.)
- [ ] Single quotes in French escaped correctly (`d''Apprentissage`)
- [ ] Uses `INSERT OR IGNORE` for idempotency

#### Package.json
- [ ] `db:seed` script added
- [ ] Script uses correct path to SQL file
- [ ] Script targets local D1 (`--local` flag)

#### Execution
- [ ] Seed script runs without errors
- [ ] 9 categories inserted
- [ ] Re-running script doesn't duplicate (idempotent)
- [ ] All category data queryable

### Commit Message

```bash
git add drizzle/seeds/categories.sql package.json
git commit -m "feat(db): create seed script for 9 canonical categories

- Add categories.sql with INSERT OR IGNORE for all 9 categories
- Categories: news, deep-analysis, learning-path, retrospective, tutorial, case-study, quick-tips, behind-scenes, tool-test
- Include bilingual names (FR/EN), slugs, Lucide icons, hex colors
- Add db:seed npm script to package.json
- Seed script is idempotent (re-runnable)
- Verify 9 categories loaded successfully

Part of Phase 3 - Commit 4/5"
```

---

## 📋 Commit 5: Add integration tests for taxonomy operations

**Files**: `tests/integration/taxonomy-schema.test.ts` (new)
**Estimated Duration**: 60-90 minutes

### Implementation Tasks

- [ ] Create `tests/integration/taxonomy-schema.test.ts`
- [ ] Import test utilities: `describe`, `it`, `beforeEach`, `expect` from Vitest
- [ ] Import `execSync` from `child_process` for seeding
- [ ] Import database connection and tables from schema
- [ ] Add `beforeEach` hook to seed test database:
  ```typescript
  beforeEach(() => {
    execSync('wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql');
  });
  ```
- [ ] Test Suite 1: Categories Operations
  - [ ] Test: Retrieve all 9 canonical categories
  - [ ] Test: Query category by key (e.g., 'news')
  - [ ] Test: Verify category structure (all 8 fields present)
  - [ ] Test: Verify unique constraint (duplicate key insert fails)
- [ ] Test Suite 2: Tags Operations
  - [ ] Test: Insert tag with bilingual names
  - [ ] Test: Query tag by ID
  - [ ] Test: Update tag name
  - [ ] Test: Delete tag
- [ ] Test Suite 3: ArticleTags Junction
  - [ ] Test: Link article to tag (insert articleTag)
  - [ ] Test: Query tags for specific article
  - [ ] Test: Composite primary key prevents duplicates
  - [ ] Test: ON DELETE CASCADE (deleting article removes articleTags)
  - [ ] Test: ON DELETE CASCADE (deleting tag removes articleTags)
- [ ] Use descriptive test names (user story format)
- [ ] Use proper assertions (toHaveLength, toBe, toThrow, etc.)
- [ ] Clean up test data in tests that modify database

### Validation

```bash
# Run integration tests
pnpm test:integration

# Run specific test file
pnpm test tests/integration/taxonomy-schema.test.ts

# Run with coverage
pnpm test:coverage tests/integration/taxonomy-schema.test.ts
```

**Expected Result**:
- All tests pass
- Coverage >80% for taxonomy operations
- No errors or warnings
- Tests run in <10 seconds

### Review Checklist

#### Test Coverage
- [ ] Tests cover categories table (query, structure, unique constraint)
- [ ] Tests cover tags table (CRUD operations)
- [ ] Tests cover articleTags junction (insert, query, constraints)
- [ ] Tests verify 9 canonical categories exist
- [ ] Tests verify foreign key relationships work
- [ ] Tests verify composite primary key constraint
- [ ] Tests verify ON DELETE CASCADE behavior

#### Test Quality
- [ ] Uses local D1 database (not mocks)
- [ ] `beforeEach` hook seeds data consistently
- [ ] Tests are isolated (each starts with known state)
- [ ] Test names are descriptive (describe what they verify)
- [ ] Uses proper Vitest assertions
- [ ] No hardcoded IDs that might break
- [ ] Tests clean up after themselves (if needed)

#### Code Quality
- [ ] No TypeScript errors
- [ ] No `any` types
- [ ] Consistent formatting
- [ ] Imports are organized
- [ ] No console.logs or debug code

### Commit Message

```bash
git add tests/integration/taxonomy-schema.test.ts
git commit -m "test(db): add integration tests for taxonomy operations

- Test categories: query all 9, query by key, verify structure
- Test tags: CRUD operations (insert, query, update, delete)
- Test articleTags: junction operations, composite PK constraint
- Test ON DELETE CASCADE for both FKs (articles, tags)
- Use beforeEach hook to seed test database consistently
- All tests pass with >80% coverage

Part of Phase 3 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist
- [ ] All 5 commits completed
- [ ] All integration tests pass
- [ ] Type-check passes (`pnpm tsc --noEmit`)
- [ ] Linter passes (`pnpm lint`)
- [ ] 9 canonical categories seeded in local D1
- [ ] All 3 taxonomy tables created (categories, tags, articleTags)
- [ ] Foreign key relationships working
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Type-check
pnpm tsc --noEmit

# Lint
pnpm lint

# Run all integration tests
pnpm test:integration

# Verify database state
wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories;"
wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected Results**:
- Type-check: ✅ No errors
- Lint: ✅ No errors
- Tests: ✅ All pass
- Categories count: 9
- Tables include: categories, tags, articleTags

**Phase 3 is complete when all checkboxes are checked! 🎉**
