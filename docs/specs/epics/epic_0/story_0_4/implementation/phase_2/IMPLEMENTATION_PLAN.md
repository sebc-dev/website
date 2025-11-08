# Phase 2 - Atomic Implementation Plan

**Objective**: Define and create core database schema for articles and article_translations tables with proper relations, constraints, and validation

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **6 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - Types validate at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Types/ENUMs] → [Articles Table] → [Translations Table] → [Migration] → [Test Data] → [Integration Tests]
       ↓                ↓                  ↓                   ↓             ↓                ↓
    100% typed      FK nullable        FK relations        Applied       Inserted         >80% coverage
```

---

## 📦 The 6 Atomic Commits

### Commit 1: Define ENUM types and base constants
**Files**: `src/lib/server/db/schema.ts` (new)
**Size**: ~80 lines
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:
- Create `src/lib/server/db/schema.ts` file
- Define `ComplexityEnum` type ('beginner', 'intermediate', 'advanced')
- Define `StatusEnum` type ('draft', 'published')
- Export types for use in application code
- Add JSDoc comments documenting each ENUM value

**Why it's atomic**:
- Single responsibility: Type definitions only
- No external dependencies beyond Drizzle ORM
- Can be validated independently (TypeScript compilation)
- Sets foundation for subsequent table definitions

**Technical Validation**:
```bash
pnpm tsc --noEmit
```

**Expected Result**: No TypeScript errors, ENUMs properly typed

**Review Criteria**:
- [ ] ENUM values match specification ('beginner', 'intermediate', 'advanced', 'draft', 'published')
- [ ] Types are exported for reuse
- [ ] JSDoc comments explain each ENUM value
- [ ] File follows project coding standards

---

### Commit 2: Create articles table schema
**Files**: `src/lib/server/db/schema.ts` (modified)
**Size**: ~120 lines
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:
- Define `articles` table using Drizzle's `sqliteTable()` helper
- Add all required fields:
  - `id`: text (UUID) primary key
  - `categoryId`: text (UUID) nullable (FK to categories - will be added in Phase 3)
  - `complexity`: text with ENUM ('beginner', 'intermediate', 'advanced')
  - `status`: text with ENUM ('draft', 'published')
  - `publishedAt`: integer timestamp nullable
  - `coverImage`: text nullable (R2 path)
  - `createdAt`: integer timestamp with default now
  - `updatedAt`: integer timestamp with default now
- Add indexes for performance (categoryId, status, publishedAt)
- Export table definition and infer types

**Why it's atomic**:
- Single responsibility: Articles table only
- FK to categories is nullable (no hard dependency on Phase 3)
- Complete and testable independently
- Provides foundation for article_translations relation

**Technical Validation**:
```bash
pnpm tsc --noEmit
```

**Expected Result**: TypeScript compiles, table definition is type-safe

**Review Criteria**:
- [ ] All 8 fields defined correctly
- [ ] Field types match SQLite/D1 requirements
- [ ] categoryId is nullable (allows Phase 2 to work before Phase 3)
- [ ] Timestamps use integer type with timestamp mode
- [ ] Primary key on `id`
- [ ] Indexes added for common query patterns
- [ ] Type inference works: `typeof articles.$inferSelect`

---

### Commit 3: Create article_translations table schema with FK relations
**Files**: `src/lib/server/db/schema.ts` (modified)
**Size**: ~150 lines
**Duration**: 60-75 min (implementation) + 25-35 min (review)

**Content**:
- Define `article_translations` table with all fields:
  - `id`: text (UUID) primary key
  - `articleId`: text (UUID) foreign key to `articles.id` with ON DELETE CASCADE
  - `language`: text ('fr' | 'en')
  - `title`: text required
  - `slug`: text required
  - `excerpt`: text required
  - `seoTitle`: text required
  - `seoDescription`: text required
  - `contentMdx`: text required (Markdown with React components)
  - `createdAt`: integer timestamp
  - `updatedAt`: integer timestamp
- Add unique constraints:
  - `(articleId, language)` - one translation per language per article
  - `slug` with additional unique index for URL generation
- Add foreign key relation to articles with cascade delete
- Add indexes for performance (articleId, language, slug)
- Export table and infer types

**Why it's atomic**:
- Single responsibility: Translations table with relations
- Depends on Commit 2 (articles table exists)
- Complete FK relation with cascade
- All constraints properly defined

**Technical Validation**:
```bash
pnpm tsc --noEmit
```

**Expected Result**: TypeScript compiles, relations are type-safe

**Review Criteria**:
- [ ] All 10 fields defined correctly
- [ ] Foreign key to articles.id with ON DELETE CASCADE
- [ ] Unique constraint on (articleId, language)
- [ ] Unique constraint on slug
- [ ] Language field restricted to 'fr' | 'en'
- [ ] All required fields are non-nullable
- [ ] Indexes for common queries
- [ ] Type inference includes relations

---

### Commit 4: Generate and apply first migration
**Files**: `drizzle/migrations/0001_***.sql` (generated), `drizzle/migrations/meta/*` (generated)
**Size**: ~60 lines (SQL)
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:
- Run `pnpm db:generate` to create migration SQL
- Review generated migration for correctness
- Apply migration locally with `pnpm db:migrate:local`
- Verify tables created in local D1 database
- Document migration in git (commit generated files)

**Why it's atomic**:
- Single responsibility: Migration generation and application
- Depends on Commits 2-3 (schemas defined)
- Testable independently (migration succeeds or fails)
- Creates actual database tables

**Technical Validation**:
```bash
# Generate migration
pnpm db:generate

# Apply locally
pnpm db:migrate:local

# Verify tables exist
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected Result**:
- Migration SQL generated in `drizzle/migrations/`
- Tables `articles` and `article_translations` created in local D1
- Foreign key constraints active
- Unique constraints active

**Review Criteria**:
- [ ] Migration SQL creates both tables
- [ ] Foreign key constraint defined in SQL
- [ ] Unique constraints defined in SQL
- [ ] Migration applies without errors
- [ ] Tables queryable in local D1
- [ ] Migration metadata generated correctly

---

### Commit 5: Create sample insert test data
**Files**: `drizzle/seeds/sample-articles.sql` (new), `package.json` (modified)
**Size**: ~100 lines
**Duration**: 45-60 min (implementation) + 20-25 min (review)

**Content**:
- Create `drizzle/seeds/sample-articles.sql` with INSERT statements
- Add 1 sample article with:
  - id: 'test-article-1'
  - complexity: 'intermediate'
  - status: 'published'
  - publishedAt: current timestamp
  - coverImage: '/images/test-cover.jpg'
- Add 2 translations for the article:
  - French translation (language: 'fr', slug: 'article-test-fr')
  - English translation (language: 'en', slug: 'test-article-en')
- Add npm script `db:seed:articles` to execute seed
- Test seed script execution

**Why it's atomic**:
- Single responsibility: Test data only
- Depends on Commit 4 (tables exist)
- Provides data for manual testing and integration tests
- Reusable for development

**Technical Validation**:
```bash
# Run seed
pnpm db:seed:articles

# Verify data
wrangler d1 execute DB --local --command="SELECT * FROM articles;"
wrangler d1 execute DB --local --command="SELECT * FROM article_translations;"
```

**Expected Result**:
- 1 article inserted
- 2 translations inserted (FR + EN)
- Foreign key relation works
- Unique constraints validated (can't insert duplicate)

**Review Criteria**:
- [ ] Article has all required fields populated
- [ ] Translations link to article via articleId FK
- [ ] Slugs are unique and URL-friendly
- [ ] Content is realistic (not just placeholder text)
- [ ] npm script works without errors
- [ ] Seed is idempotent or uses INSERT OR IGNORE

---

### Commit 6: Add schema validation integration tests
**Files**: `tests/integration/articles-schema.test.ts` (new)
**Size**: ~180 lines
**Duration**: 60-90 min (implementation) + 30-40 min (review)

**Content**:
- Create integration test file for schema validation
- Test suite 1: Articles table
  - Insert article with valid data
  - Query article by id
  - Verify all fields are correct
- Test suite 2: Article translations table
  - Insert 2 translations for article
  - Query translations by articleId
  - Verify language and content fields
- Test suite 3: Unique constraints
  - Attempt duplicate (articleId, language) - should fail
  - Attempt duplicate slug - should fail
  - Verify error messages
- Test suite 4: Foreign key cascade
  - Delete article
  - Verify translations are auto-deleted (CASCADE)
- Test suite 5: Status and complexity ENUMs
  - Insert with invalid complexity - should fail
  - Insert with invalid status - should fail
- Use `beforeEach` to reset database state

**Why it's atomic**:
- Single responsibility: Schema validation tests
- Depends on Commits 4-5 (tables and seed data)
- Comprehensive validation of all schema features
- Ensures constraints work as expected

**Technical Validation**:
```bash
pnpm test tests/integration/articles-schema.test.ts
```

**Expected Result**:
- All tests pass
- Coverage >80% for schema functionality
- Constraints properly enforced

**Review Criteria**:
- [ ] All 5 test suites implemented
- [ ] Tests use local D1 database
- [ ] Database reset between tests (isolation)
- [ ] Positive tests (valid data succeeds)
- [ ] Negative tests (invalid data fails)
- [ ] Clear test descriptions
- [ ] Assertions are meaningful
- [ ] No flaky tests

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review story_0.4.md and PHASES_PLAN.md fully
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md (Phase 1 must be complete)
3. **Implement Commit 1**: Define ENUMs following COMMIT_CHECKLIST.md
4. **Validate Commit 1**: Run `pnpm tsc --noEmit`
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message template
7. **Repeat for commits 2-6**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:
```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests (after Commit 6)
pnpm test

# Build (optional, to verify no build errors)
pnpm build
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit | Files | Lines | Implementation | Review | Total |
|--------|-------|-------|----------------|--------|-------|
| 1. ENUM types | 1 | ~80 | 30-45 min | 15-20 min | 45-65 min |
| 2. Articles table | 1 | ~120 | 45-60 min | 20-30 min | 65-90 min |
| 3. Translations table | 1 | ~150 | 60-75 min | 25-35 min | 85-110 min |
| 4. Generate migration | 2-3 | ~60 | 30-45 min | 15-20 min | 45-65 min |
| 5. Sample test data | 2 | ~100 | 45-60 min | 20-25 min | 65-85 min |
| 6. Integration tests | 1 | ~180 | 60-90 min | 30-40 min | 90-130 min |
| **TOTAL** | **8-9** | **~690** | **4.5-6h** | **2-3h** | **6.5-9h** |

---

## ✅ Atomic Approach Benefits

### For Developers
- 🎯 **Clear focus**: One thing at a time (types → tables → migration → tests)
- 🧪 **Testable**: Each commit validated independently
- 📝 **Documented**: Clear progression in git history

### For Reviewers
- ⚡ **Fast review**: 15-40 min per commit (not 3h all at once)
- 🔍 **Focused**: Single responsibility to check per commit
- ✅ **Quality**: Easier to spot issues in small chunks

### For the Project
- 🔄 **Rollback-safe**: Revert individual commits without breaking everything
- 📚 **Historical**: Clear schema evolution in git log
- 🏗️ **Maintainable**: Easy to understand later ("why was it done this way?")

---

## 📝 Best Practices

### Commit Messages

Format:
```
feat(db): short description (max 50 chars)

- Point 1: detail about what was added
- Point 2: detail about constraints/relations
- Point 3: justification if needed

Part of Phase 2 - Commit X/6
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Examples:
```
feat(db): define complexity and status ENUM types

- Add ComplexityEnum: beginner, intermediate, advanced
- Add StatusEnum: draft, published
- Export types for application use

Part of Phase 2 - Commit 1/6
```

```
feat(db): create articles table schema

- Define articles table with 8 fields
- Add nullable categoryId FK (Phase 3 dependency)
- Add indexes for performance (categoryId, status)
- Export type inference for TypeScript

Part of Phase 2 - Commit 2/6
```

### Review Checklist

Before committing:
- [ ] Code follows project style guide (ESLint passes)
- [ ] All tests pass (if applicable)
- [ ] TypeScript compiles with no errors
- [ ] No console.logs or debug code
- [ ] Documentation updated if needed (JSDoc, comments)

---

## ⚠️ Important Points

### Do's
- ✅ Follow the commit order (1 → 2 → 3 → 4 → 5 → 6)
- ✅ Validate after each commit (tsc, lint, test)
- ✅ Write tests in Commit 6 (don't skip)
- ✅ Use provided commit messages as template
- ✅ Make categoryId nullable (Phase 3 will update)

### Don'ts
- ❌ Skip commits or combine them (breaks atomic approach)
- ❌ Commit without running validations
- ❌ Create categories table (that's Phase 3)
- ❌ Add features not in the spec
- ❌ Use raw SQL (use Drizzle schema only)

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Split it into smaller commits (update this plan). For example, if Commit 3 is too complex, split into "translations table structure" and "add constraints/indexes".

**Q: What if I need to fix a previous commit?**
A: If not pushed yet, use `git commit --amend` or `git rebase -i`. If pushed, create a fixup commit and note it in the message.

**Q: Can I change the commit order?**
A: Only if dependencies allow. For this phase, order is strict: ENUMs → Articles → Translations → Migration → Data → Tests.

**Q: What if tests fail?**
A: Don't commit until they pass. Fix the code or update tests. Never commit broken tests.

**Q: Why is categoryId nullable?**
A: The categories table is created in Phase 3. Making it nullable allows Phase 2 to work independently. It will be updated after Phase 3 completes.

**Q: How do I handle migration conflicts?**
A: Always pull latest before generating migrations. If conflicts occur, regenerate the migration after resolving schema conflicts.

---

## 🔗 Dependencies

### Previous Phases Required
- **Phase 1**: Drizzle ORM installed, drizzle.config.ts configured, D1 database created

### External Dependencies
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- Cloudflare D1 binding configured
- Wrangler CLI for local development

### Blocks Next Phases
- **Phase 3**: Needs articles table to add categoryId FK properly
- **Phase 4**: Needs base schemas for drizzle-zod generation
- **Phase 5**: Needs all tables for comprehensive access layer

---

**Phase 2 implementation plan ready! Follow COMMIT_CHECKLIST.md for detailed steps.**
