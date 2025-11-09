# Phase 3 - Atomic Implementation Plan

**Objective**: Define taxonomy database schemas (categories, tags, articleTags), generate migration, create seed script for 9 canonical categories, and validate with integration tests

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single table or operation
✅ **Enable rollback** - If schema issues arise, revert specific commits without breaking everything
✅ **Progressive validation** - Test each table definition independently before integration
✅ **Database evolution** - Track taxonomy schema changes separately from core article schema
✅ **Seed data isolation** - Separate schema definition from data population for clarity

### Global Strategy

```
[Commit 1] → [Commit 2] → [Commit 3] → [Commit 4] → [Commit 5]
     ↓            ↓            ↓            ↓            ↓
 Categories    Tags +      Migration    Seed Data   Integration
   Schema    Junction       Applied      Loaded        Tests
              Schema
```

**Progression**:

1. **Schema Definition** (Commits 1-2): Define all 3 taxonomy tables in Drizzle
2. **Migration** (Commit 3): Generate SQL and apply to local D1
3. **Data Population** (Commit 4): Create and execute seed script for canonical categories
4. **Validation** (Commit 5): Integration tests to ensure taxonomy operations work correctly

---

## 📦 The 5 Atomic Commits

### Commit 1: Define categories table schema

**Files**: `src/lib/server/db/schema.ts` (modified)
**Size**: ~30 lines
**Duration**: 30-45 min (implementation) + 20-30 min (review)

**Content**:

- Add `categories` table definition to `schema.ts`
- Define 8 fields: `id`, `key`, `nameFr`, `nameEn`, `slugFr`, `slugEn`, `icon`, `color`
- Add unique constraint on `key` field (unique identifier like 'news', 'tutorial')
- Use TEXT types for all fields (SQLite/D1 best practice)
- Add JSDoc comments documenting table purpose and non-deletable nature

**Why it's atomic**:

- Single responsibility: Only defines categories table structure
- No external dependencies (independent table, no FK yet)
- Can be validated independently via TypeScript type inference
- Small scope: ~30 lines, focused on one entity

**Technical Validation**:

```bash
# Type-check the schema definition
pnpm tsc --noEmit

# Verify Drizzle can parse the schema
pnpm db:generate --check
```

**Expected Result**:

- TypeScript compiles without errors
- Drizzle recognizes the new table definition
- No migration generated yet (just schema added)

**Review Criteria**:

- [ ] All 8 required fields present (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- [ ] `key` field has unique constraint
- [ ] Field types are appropriate (text for SQLite)
- [ ] Table name is `categories` (plural, lowercase)
- [ ] JSDoc comment documents non-deletable nature and purpose
- [ ] No breaking changes to existing schema

---

### Commit 2: Define tags and articleTags junction tables

**Files**: `src/lib/server/db/schema.ts` (modified)
**Size**: ~40 lines
**Duration**: 45-60 min (implementation) + 25-35 min (review)

**Content**:

- Add `tags` table definition (id, nameFr, nameEn, createdAt)
- Add `articleTags` junction table (articleId FK, tagId FK)
- Define composite primary key on `articleTags`: `[articleId, tagId]`
- Add foreign key references with `ON DELETE CASCADE` for both FKs
- Update `articles` table to add FK reference from `categoryId` to `categories.id` (if nullable in Phase 2)
- Add JSDoc comments for both tables

**Why it's atomic**:

- Single responsibility: Complete Many-to-Many relationship definition
- Dependencies: Requires categories table (Commit 1) and articles table (Phase 2)
- Can be validated independently via type inference
- Logical grouping: Tags and article-tag relationship belong together

**Technical Validation**:

```bash
# Type-check schema with all tables
pnpm tsc --noEmit

# Verify Drizzle can parse all tables
pnpm db:generate --check
```

**Expected Result**:

- TypeScript compiles without errors
- Drizzle recognizes tags and articleTags tables
- Foreign key relationships are detected
- Composite primary key defined correctly

**Review Criteria**:

- [ ] `tags` table has all required fields (id, nameFr, nameEn, createdAt)
- [ ] `articleTags` junction table has composite primary key `[articleId, tagId]`
- [ ] Both FKs reference correct tables (articles, tags)
- [ ] `ON DELETE CASCADE` configured for both FKs
- [ ] `articles.categoryId` FK references `categories.id` (if not already done)
- [ ] JSDoc comments explain Many-to-Many relationship
- [ ] No `any` types used

---

### Commit 3: Generate and apply taxonomy migration

**Files**: `drizzle/migrations/0002_add_taxonomy_tables.sql` (generated), `drizzle/migrations/meta/` (updated)
**Size**: ~80 lines (generated SQL)
**Duration**: 20-30 min (implementation) + 15-20 min (review)

**Content**:

- Run `pnpm db:generate` to create migration SQL
- Review generated SQL for correctness (CREATE TABLE statements, indexes, FKs)
- Apply migration locally with `pnpm db:migrate:local`
- Verify tables created in local D1 database
- Commit generated migration files (SQL + metadata)

**Why it's atomic**:

- Single responsibility: Database migration for taxonomy tables
- Dependencies: Requires schema definitions (Commits 1-2)
- Independent: Can rollback migration without affecting schema files
- Testable: Can verify tables exist after migration

**Technical Validation**:

```bash
# Generate migration
pnpm db:generate

# Apply migration locally
pnpm db:migrate:local

# Verify tables exist
wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('categories', 'tags', 'articleTags');"
```

**Expected Result**:

- Migration SQL generated in `drizzle/migrations/0002_*`
- Migration applies without errors
- Query returns 3 rows (categories, tags, articleTags tables exist)

**Review Criteria**:

- [ ] Migration SQL includes CREATE TABLE for all 3 tables
- [ ] Foreign keys are properly defined in SQL
- [ ] Composite primary key syntax is correct for SQLite
- [ ] Migration applies successfully to local D1
- [ ] No errors in Wrangler output
- [ ] Migration files committed (SQL + meta JSON)
- [ ] Migration number is sequential (0002*\* if Phase 2 was 0001*\*)

---

### Commit 4: Create seed script for 9 canonical categories

**Files**: `drizzle/seeds/categories.sql` (new), `package.json` (modified - add script)
**Size**: ~60 lines (SQL) + 1 line (package.json)
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:

- Create `drizzle/seeds/categories.sql` with INSERT statements for 9 categories:
  1. Actualités (news) - Newspaper icon, blue color
  2. Analyse Approfondie (deep-analysis) - Microscope icon, purple color
  3. Parcours d'Apprentissage (learning-path) - Route icon, green color
  4. Rétrospective (retrospective) - Calendar icon, orange color
  5. Tutoriel (tutorial) - BookOpen icon, teal color
  6. Étude de Cas (case-study) - FileText icon, indigo color
  7. Astuces Rapides (quick-tips) - Zap icon, yellow color
  8. Dans les Coulisses (behind-scenes) - Eye icon, pink color
  9. Test d'Outil (tool-test) - Wrench icon, gray color
- Use `INSERT OR IGNORE` to make seed script idempotent
- Add `db:seed` npm script to package.json
- Execute seed script and verify 9 categories loaded
- Generate UUIDs or use consistent IDs (e.g., 'cat-1' to 'cat-9')

**Why it's atomic**:

- Single responsibility: Populate canonical category data
- Dependencies: Requires categories table (migration applied)
- Independent: Seed data separate from schema
- Testable: Can query categories table to verify 9 rows

**Technical Validation**:

```bash
# Execute seed script
pnpm db:seed

# Verify 9 categories exist
wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories;"

# Verify category keys
wrangler d1 execute DB --local --command "SELECT key FROM categories ORDER BY key;"
```

**Expected Result**:

- Seed script executes without errors
- COUNT query returns 9
- All category keys present (news, deep-analysis, learning-path, etc.)

**Review Criteria**:

- [ ] All 9 canonical categories included in seed script
- [ ] Each category has all required fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- [ ] Icon names match Lucide React icon library (e.g., 'Newspaper', 'Microscope')
- [ ] Colors are valid hex codes (e.g., '#3B82F6', '#8B5CF6')
- [ ] `INSERT OR IGNORE` used for idempotency
- [ ] French and English names match specification (Actualités/News, etc.)
- [ ] Slugs are URL-safe (lowercase, hyphens)
- [ ] `db:seed` script added to package.json
- [ ] Seed script is re-runnable without errors

**Seed Data Reference**:

```sql
INSERT OR IGNORE INTO categories (id, key, nameFr, nameEn, slugFr, slugEn, icon, color) VALUES
  ('cat-1', 'news', 'Actualités', 'News', 'actualites', 'news', 'Newspaper', '#3B82F6'),
  ('cat-2', 'deep-analysis', 'Analyse Approfondie', 'Deep Analysis', 'analyse-approfondie', 'deep-analysis', 'Microscope', '#8B5CF6'),
  ('cat-3', 'learning-path', 'Parcours d''Apprentissage', 'Learning Path', 'parcours-apprentissage', 'learning-path', 'Route', '#10B981'),
  ('cat-4', 'retrospective', 'Rétrospective', 'Retrospective', 'retrospective', 'retrospective', 'Calendar', '#F97316'),
  ('cat-5', 'tutorial', 'Tutoriel', 'Tutorial', 'tutoriel', 'tutorial', 'BookOpen', '#14B8A6'),
  ('cat-6', 'case-study', 'Étude de Cas', 'Case Study', 'etude-de-cas', 'case-study', 'FileText', '#6366F1'),
  ('cat-7', 'quick-tips', 'Astuces Rapides', 'Quick Tips', 'astuces-rapides', 'quick-tips', 'Zap', '#EAB308'),
  ('cat-8', 'behind-scenes', 'Dans les Coulisses', 'Behind the Scenes', 'dans-les-coulisses', 'behind-scenes', 'Eye', '#EC4899'),
  ('cat-9', 'tool-test', 'Test d''Outil', 'Tool Test', 'test-outil', 'tool-test', 'Wrench', '#6B7280');
```

---

### Commit 5: Add integration tests for taxonomy operations

**Files**: `tests/integration/taxonomy-schema.test.ts` (new)
**Size**: ~150 lines
**Duration**: 60-90 min (implementation) + 30-45 min (review)

**Content**:

- Create integration test file `tests/integration/taxonomy-schema.test.ts`
- Test suite 1: Categories operations
  - Query all categories (expect 9 rows)
  - Query category by key (e.g., 'news')
  - Verify category structure (all fields present)
- Test suite 2: Tags operations
  - Insert tag (bilingual)
  - Query tag by ID
  - Update tag name
- Test suite 3: ArticleTags junction
  - Link article to tag (insert articleTag)
  - Query tags for article
  - Delete article (verify cascade deletes articleTags)
  - Test composite primary key constraint (duplicate pair fails)
- Use `beforeEach` to reset/seed test database
- Use `wrangler d1 execute` for seeding fixtures

**Why it's atomic**:

- Single responsibility: Validate taxonomy schema with integration tests
- Dependencies: Requires migration applied and seed data loaded
- Independent: Tests don't modify production code
- Complete validation: Covers all taxonomy tables and relationships

**Technical Validation**:

```bash
# Run integration tests
pnpm test:integration

# Run with coverage
pnpm test:coverage tests/integration/taxonomy-schema.test.ts
```

**Expected Result**:

- All tests pass
- Coverage >80% for taxonomy queries
- No errors or warnings

**Review Criteria**:

- [ ] Tests cover categories, tags, and articleTags tables
- [ ] Tests use local D1 database (not mocks)
- [ ] `beforeEach` hook seeds test data consistently
- [ ] Tests verify 9 canonical categories exist
- [ ] Tests verify foreign key relationships work
- [ ] Tests verify composite primary key constraint (duplicates fail)
- [ ] Tests verify ON DELETE CASCADE (deleting article removes articleTags)
- [ ] Tests use descriptive names (describe/it structure)
- [ ] No hardcoded IDs that might break (use fixtures)
- [ ] Tests are isolated (each test starts with known state)

**Test Structure Example**:

```typescript
describe('Categories Operations', () => {
  beforeEach(async () => {
    // Reset and seed test database
    execSync(
      'wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql',
    );
  });

  it('should retrieve all 9 canonical categories', async () => {
    const categories = await db.select().from(categoriesTable);
    expect(categories).toHaveLength(9);
  });

  it('should retrieve category by key', async () => {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.key, 'news'));
    expect(category.nameFr).toBe('Actualités');
    expect(category.nameEn).toBe('News');
  });
});
```

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review PHASES_PLAN.md Phase 3 section
2. **Setup environment**: Ensure Phase 2 completed, local D1 running
3. **Implement Commit 1**: Define categories table schema
4. **Validate Commit 1**: Run `pnpm tsc --noEmit` and `pnpm db:generate --check`
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message template
7. **Repeat for Commits 2-5**: Follow same validation pattern
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Type-check
pnpm tsc --noEmit

# Lint
pnpm lint

# For commits 3-5: Run tests
pnpm test:integration
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit               | Files | Lines    | Implementation | Review       | Total        |
| -------------------- | ----- | -------- | -------------- | ------------ | ------------ |
| 1. Categories schema | 1     | ~30      | 30-45 min      | 20-30 min    | 50-75 min    |
| 2. Tags + junction   | 1     | ~40      | 45-60 min      | 25-35 min    | 70-95 min    |
| 3. Migration         | 3     | ~80      | 20-30 min      | 15-20 min    | 35-50 min    |
| 4. Seed script       | 2     | ~60      | 45-60 min      | 20-30 min    | 65-90 min    |
| 5. Integration tests | 1     | ~150     | 60-90 min      | 30-45 min    | 90-135 min   |
| **TOTAL**            | **8** | **~360** | **3-5h**       | **1.5-2.5h** | **4.5-7.5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One table or operation at a time
- 🧪 **Testable**: Each schema validated independently
- 📝 **Documented**: Clear migration history in git

### For Reviewers

- ⚡ **Fast review**: 15-45 min per commit
- 🔍 **Focused**: Single table or SQL file to review
- ✅ **Quality**: Easier to spot schema issues early

### For the Project

- 🔄 **Rollback-safe**: Revert specific schema changes without breaking core tables
- 📚 **Historical**: Git history shows taxonomy evolution
- 🏗️ **Maintainable**: Seed data separate from schema for easy updates

---

## 📝 Best Practices

### Commit Messages

Format:

```
feat(db): add categories table schema

- Define 8 fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- Add unique constraint on key field
- Document non-deletable nature in JSDoc

Part of Phase 3 - Commit 1/5
```

Types: `feat`, `refactor`, `chore`, `test`

### Review Checklist

Before committing:

- [ ] Code follows Drizzle ORM best practices
- [ ] All type-checks pass
- [ ] Schema changes generate valid SQL
- [ ] No console.logs or debug code
- [ ] JSDoc comments added for tables

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (categories → tags/junction → migration → seed → tests)
- ✅ Validate schema with `pnpm db:generate --check` before committing
- ✅ Review generated migration SQL carefully before applying
- ✅ Make seed script idempotent with `INSERT OR IGNORE`
- ✅ Use consistent IDs for categories ('cat-1' to 'cat-9')

### Don'ts

- ❌ Skip migration review (SQL can have subtle issues)
- ❌ Hardcode category IDs in tests (use fixtures)
- ❌ Modify generated migration SQL (breaks drizzle-kit tracking)
- ❌ Add categories beyond the 9 canonical ones (expandable Post-V1)
- ❌ Use different icon names than Lucide React library

---

## ❓ FAQ

**Q: What if Phase 2 made categoryId non-nullable?**
A: You'll need to add a migration step to make it nullable first, then add the FK reference, then populate with default category before making non-nullable again. Document this in Commit 2.

**Q: Should I use UUIDs or sequential IDs for categories?**
A: Use simple string IDs like 'cat-1' to 'cat-9' for consistency and readability in seed script. UUIDs are overkill for 9 fixed categories.

**Q: What if the generated migration SQL looks wrong?**
A: Stop. Review the schema definition. If Drizzle generates incorrect SQL, there's likely an issue with the schema. Fix the schema and regenerate. Never manually edit migration SQL.

**Q: Can I change category colors/icons later?**
A: Yes, categories are modifiable. Create a new migration to UPDATE category metadata. They're just not deletable.

**Q: What if tests are slow with D1 local?**
A: This is expected. Use minimal test data and consider running integration tests only in CI. Unit tests should be fast.
