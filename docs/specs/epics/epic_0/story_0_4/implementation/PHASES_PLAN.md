# Story 0.4 - Phases Implementation Plan

**Story**: Configurer Drizzle ORM + Cloudflare D1
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-08
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_0/story_0_4/story_0.4.md`

**Story Objective**:

This story establishes the complete database foundation for sebc.dev by configuring Drizzle ORM as the type-safe ORM layer for Cloudflare D1. It encompasses installing Drizzle, creating the initial database schema for all core V1 entities (articles, article_translations, categories, tags, articleTags), setting up the migration workflow for both local and remote environments, implementing the type-safe validation chain (Drizzle → drizzle-zod → Zod), creating seed data for the 9 canonical categories, and building the database access layer with comprehensive testing.

**Acceptance Criteria**:
- Drizzle ORM installed and configured with Cloudflare D1 adapter
- Complete database schema created for 5 tables (articles, article_translations, categories, tags, articleTags)
- Migration system working (generate → apply local → apply remote)
- Type-safe validation chain established (Drizzle Schema → drizzle-zod → Zod)
- Seed script created and tested for 9 canonical categories
- Database access layer utilities implemented in `src/lib/server/db/`
- Integration tests passing with local D1 fixtures

**User Value**:

For developers, this story provides a robust, type-safe database foundation that eliminates runtime errors through TypeScript inference and Zod validation. For the project, it establishes the data persistence layer required for all future features, with a clear migration strategy for schema evolution. The type-safe approach reduces debugging time and increases confidence when modifying database operations.

---

## 🎯 Phase Breakdown Strategy

### Why 5 Phases?

This story is decomposed into **5 atomic phases** based on:

✅ **Technical dependencies**: Database configuration must precede schema definition, core schema before taxonomy, schema before validation chain, all before access layer and testing

✅ **Risk mitigation**: Isolate high-risk D1 connection setup (Phase 1), separate core entities from taxonomy (Phases 2-3) to enable parallel work if needed, dedicate phase to validation chain complexity (Phase 4)

✅ **Incremental value**: Each phase delivers testable functionality - Phase 1 proves connectivity, Phase 2 enables article storage, Phase 3 adds taxonomy, Phase 4 adds validation, Phase 5 provides production-ready access layer

✅ **Team capacity**: Sized for solo developer with 2-3 days per phase, balancing focused work with reviewable scope

✅ **Testing strategy**: Progressive testing - connection tests (P1), schema tests (P2-3), validation tests (P4), integration tests (P5)

### Atomic Phase Principles

Each phase follows these principles:
- **Independent**: Can be implemented and tested separately
- **Deliverable**: Produces tangible, working functionality
- **Sized appropriately**: 2-3 days of work per phase
- **Low coupling**: Minimal dependencies on other phases
- **High cohesion**: All work in phase serves single objective

### Implementation Approach

```
[Phase 1] → [Phase 2] → [Phase 3] → [Phase 4] → [Phase 5]
    ↓           ↓           ↓           ↓           ↓
Foundation  Core Schema  Taxonomy    Validation  Access Layer
 (Config)   (Articles)  (Cat/Tags)    (Zod)      (Utils+Tests)
```

---

## 📦 Phases Summary

### Phase 1: Drizzle ORM Installation & D1 Configuration

**Objective**: Install Drizzle ORM, configure connection to Cloudflare D1, and validate basic connectivity

**Scope**:
- Install `drizzle-orm`, `drizzle-kit`, `@cloudflare/d1` dependencies
- Create `drizzle.config.ts` with D1 connection settings
- Create D1 database via `wrangler d1 create`
- Configure D1 binding in `wrangler.toml`
- Test basic connection (execute simple SELECT query)
- Set up npm scripts for migration workflow

**Dependencies**:
- Requires Story 0.1 ✅ COMPLETED (Next.js initialized)
- Requires Story 0.5 🚧 IN PROGRESS (wrangler.toml exists, will add D1 binding)

**Key Deliverables**:
- [ ] Drizzle packages installed and listed in `package.json`
- [ ] `drizzle.config.ts` created at project root
- [ ] D1 database created (local + remote via Wrangler)
- [ ] `wrangler.toml` updated with `[[d1_databases]]` binding
- [ ] npm scripts added: `db:generate`, `db:migrate:local`, `db:migrate:remote`, `db:studio`
- [ ] Connection test passing (simple query returns result)

**Files Affected** (~6 files):
- `package.json` (modified - add dependencies + scripts)
- `drizzle.config.ts` (new)
- `wrangler.toml` (modified - add D1 binding)
- `src/lib/server/db/index.ts` (new - basic connection)
- `tests/integration/db-connection.test.ts` (new - connection test)
- `.env.example` (modified - add D1 env vars for reference)

**Estimated Complexity**: Low

**Estimated Duration**: 2 days (4-6 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:
- D1 local setup with Wrangler/Miniflare can be tricky (HMR issues documented in Architecture doc)
- First time configuring Drizzle with D1 adapter (less common than PostgreSQL/MySQL)
- Environment variable configuration for local vs remote databases

**Mitigation Strategies**:
- Follow official Drizzle + Cloudflare D1 documentation closely
- Use bi-modal development strategy (Architecture doc recommendation)
- Test connection thoroughly before proceeding to schema definition
- Document any workarounds needed for local development

**Success Criteria**:
- [ ] `pnpm install` completes without errors
- [ ] `wrangler d1 create sebc-dev-db` creates database successfully
- [ ] `pnpm db:studio` launches Drizzle Studio (can be used for schema inspection later)
- [ ] Connection test executes `SELECT 1` and returns `{ "1": 1 }`
- [ ] npm scripts listed in README or dev docs

**Technical Notes**:
- Use `sqlite` dialect in drizzle.config.ts (D1 is SQLite-based)
- Local D1 database persists in `.wrangler/state/d1/` (add to .gitignore)
- Remote D1 requires `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` env vars
- Drizzle Studio may have limited D1 support - primarily use for schema visualization

---

### Phase 2: Core Database Schema (Articles & Translations)

**Objective**: Define and create the core database schema for articles and article_translations with foreign key relations

**Scope**:
- Create `src/lib/server/db/schema.ts` with Drizzle table definitions
- Define `articles` table schema (id, categoryId, complexity, status, publishedAt, coverImage, timestamps)
- Define `article_translations` table schema (id, articleId FK, language, title, slug, excerpt, seo fields, contentMdx, timestamps)
- Add unique constraints (e.g., slug per language)
- Generate first migration via `pnpm db:generate`
- Apply migration locally and test with sample inserts

**Dependencies**:
- Requires Phase 1 (Drizzle configured and connected)

**Key Deliverables**:
- [ ] `src/lib/server/db/schema.ts` created with table definitions
- [ ] `articles` table schema defined with all fields and types
- [ ] `article_translations` table schema defined with FK to articles
- [ ] Unique constraint on `(articleId, language)` in article_translations
- [ ] Unique constraint on `slug` per language in article_translations
- [ ] ENUM types defined for `complexity` and `status`
- [ ] Migration SQL generated in `drizzle/migrations/`
- [ ] Migration applied to local D1
- [ ] Sample data inserted successfully (at least 1 article with 2 translations)

**Files Affected** (~5 files):
- `src/lib/server/db/schema.ts` (new - table definitions)
- `drizzle/migrations/0001_initial_articles_schema.sql` (generated)
- `drizzle/migrations/meta/` (generated - migration metadata)
- `tests/integration/articles-schema.test.ts` (new - schema validation tests)
- `drizzle/seeds/sample-articles.sql` (new - test data)

**Estimated Complexity**: Medium

**Estimated Duration**: 3 days (6-8 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:
- Complex foreign key relations (article_translations → articles)
- ENUM types may need special handling in SQLite (D1)
- Unique constraints on composite keys need careful definition
- categoryId FK references categories table (not yet created - will use nullable or wait)

**Mitigation Strategies**:
- Start with articles table alone, then add article_translations
- Use TEXT type for ENUMs with CHECK constraints (SQLite best practice)
- Make categoryId nullable initially (will be populated after Phase 3)
- Test constraints with deliberate violations to ensure they work
- Document schema relationships clearly (consider ERD diagram)

**Success Criteria**:
- [ ] `pnpm db:generate` creates migration SQL without errors
- [ ] `pnpm db:migrate:local` applies migration successfully
- [ ] Can insert article with status 'draft' and complexity 'intermediate'
- [ ] Can insert 2 translations (FR + EN) for same article
- [ ] Cannot insert duplicate translation for same article + language (unique constraint works)
- [ ] TypeScript autocomplete works for table columns (type inference)
- [ ] Migration rollback documented (manual process)

**Technical Notes**:
- Use `sqliteTable()` from `drizzle-orm/sqlite-core`
- Define ENUMs as: `text('status', { enum: ['draft', 'published'] })`
- Use `uuid()` for primary keys or `text()` with UUID generation
- Foreign keys: `references(() => articles.id, { onDelete: 'cascade' })`
- Timestamps: `integer('createdAt', { mode: 'timestamp' }).notNull().defaultNow()`
- For categoryId FK: Make nullable initially with `.references(() => categories.id)` or wait until Phase 3

---

### Phase 3: Taxonomy Schemas (Categories, Tags, ArticleTags)

**Objective**: Define taxonomy tables (categories, tags, articleTags junction) and create seed script for 9 canonical categories

**Scope**:
- Define `categories` table schema (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
- Define `tags` table schema (id, nameFr, nameEn, createdAt)
- Define `articleTags` junction table (articleId FK, tagId FK, composite PK)
- Update `articles.categoryId` to reference categories (if nullable in Phase 2)
- Generate migration
- Create SQL seed script for 9 canonical categories
- Apply migration and seed data

**Dependencies**:
- Requires Phase 2 (articles and article_translations tables exist)

**Key Deliverables**:
- [ ] `categories` table schema defined
- [ ] `tags` table schema defined
- [ ] `articleTags` table schema defined with composite primary key
- [ ] Foreign key from articles.categoryId to categories.id established (or updated)
- [ ] Migration generated and applied
- [ ] `drizzle/seeds/categories.sql` created with 9 canonical categories:
  1. Actualités (news) - icon, color
  2. Analyse Approfondie (deep-analysis) - icon, color
  3. Parcours d'Apprentissage (learning-path) - icon, color
  4. Rétrospective (retrospective) - icon, color
  5. Tutoriel (tutorial) - icon, color
  6. Étude de Cas (case-study) - icon, color
  7. Astuces Rapides (quick-tips) - icon, color
  8. Dans les Coulisses (behind-scenes) - icon, color
  9. Test d'Outil (tool-test) - icon, color
- [ ] `pnpm db:seed` script executes seed successfully
- [ ] Can query categories and retrieve all 9 records

**Files Affected** (~6 files):
- `src/lib/server/db/schema.ts` (modified - add 3 new tables)
- `drizzle/migrations/0002_add_taxonomy_tables.sql` (generated)
- `drizzle/migrations/meta/` (updated metadata)
- `drizzle/seeds/categories.sql` (new - canonical categories)
- `package.json` (modified - add `db:seed` script)
- `tests/integration/taxonomy-schema.test.ts` (new)

**Estimated Complexity**: Low

**Estimated Duration**: 2 days (4-5 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:
- Minimal risk - straightforward table definitions
- Seed data requires accurate category metadata (icons, colors)

**Mitigation Strategies**:
- Use simple, clear table structures (no complex constraints)
- Reference UX_UI_Spec.md for category icon/color assignments
- Test seed script multiple times (should be idempotent or use INSERT OR IGNORE)

**Success Criteria**:
- [ ] All 3 tables created successfully
- [ ] `pnpm db:seed` populates 9 categories without errors
- [ ] Can query categories: `SELECT * FROM categories` returns 9 rows
- [ ] Can insert tag and link to article via articleTags junction table
- [ ] Composite primary key on articleTags prevents duplicate article-tag pairs
- [ ] ON DELETE CASCADE works (deleting article removes articleTags entries)

**Technical Notes**:
- Categories: `key` field is unique identifier (e.g., 'news', 'tutorial')
- Categories: Non-deletable (enforced at application level, not DB constraint)
- Junction table: `primaryKey: t => [t.articleId, t.tagId]`
- Seed script: Use `INSERT OR IGNORE` to make it re-runnable
- Icon: Reference to icon library (e.g., Lucide icon name)
- Color: Hex code (e.g., '#14B8A6' for teal accent)

**Seed Data Structure** (example):
```sql
INSERT OR IGNORE INTO categories (id, key, nameFr, nameEn, slugFr, slugEn, icon, color) VALUES
  ('cat-1', 'news', 'Actualités', 'News', 'actualites', 'news', 'Newspaper', '#3B82F6'),
  ('cat-2', 'deep-analysis', 'Analyse Approfondie', 'Deep Analysis', 'analyse-approfondie', 'deep-analysis', 'Microscope', '#8B5CF6'),
  -- ... 7 more
```

---

### Phase 4: Type-Safe Validation Chain (drizzle-zod Integration)

**Objective**: Set up drizzle-zod integration to auto-generate Zod schemas and implement validation helpers for Server Actions

**Scope**:
- Install `drizzle-zod` dependency
- Generate Zod schemas from Drizzle schemas using `createInsertSchema` and `createSelectSchema`
- Create validation helper utilities in `src/lib/server/db/validation.ts`
- Test Zod validation with valid and invalid data
- Document validation chain pattern for future Server Actions

**Dependencies**:
- Requires Phase 3 (all schemas defined)

**Key Deliverables**:
- [ ] `drizzle-zod` installed
- [ ] Zod insert schemas generated for all tables:
  - `insertArticleSchema`
  - `insertArticleTranslationSchema`
  - `insertCategorySchema`
  - `insertTagSchema`
  - `insertArticleTagSchema`
- [ ] Zod select schemas generated (for query results)
- [ ] Validation helpers created (e.g., `validateArticleData`, `validateTranslation`)
- [ ] Type inference working (TypeScript infers types from Zod schemas)
- [ ] Unit tests for validation (valid data passes, invalid data fails with clear errors)

**Files Affected** (~4 files):
- `package.json` (modified - add drizzle-zod dependency)
- `src/lib/server/db/validation.ts` (new - Zod schemas + helpers)
- `src/lib/server/db/schema.ts` (modified - export schemas for drizzle-zod)
- `tests/unit/validation.test.ts` (new - validation tests)

**Estimated Complexity**: Medium

**Estimated Duration**: 2 days (4-5 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:
- drizzle-zod auto-generation may not handle all edge cases (e.g., custom validations)
- Need to refine generated schemas (e.g., add custom regex for slugs, email formats)
- Type inference can be tricky with complex schemas

**Mitigation Strategies**:
- Start with basic auto-generated schemas, refine incrementally
- Use `.extend()` on generated schemas to add custom validations
- Test validation thoroughly with edge cases (empty strings, wrong types, etc.)
- Document any manual refinements to generated schemas

**Success Criteria**:
- [ ] `createInsertSchema(articles)` generates valid Zod schema
- [ ] Insert schema validates required fields (e.g., `title` cannot be empty)
- [ ] Insert schema rejects invalid enums (e.g., `status: 'invalid'` fails)
- [ ] Select schema infers correct TypeScript types for query results
- [ ] Custom validation works (e.g., slug format: lowercase, hyphens only)
- [ ] Validation errors are clear and actionable (Zod error messages)

**Technical Notes**:
- Auto-generate: `export const insertArticleSchema = createInsertSchema(articles)`
- Refine: `insertArticleSchema.extend({ slug: z.string().regex(/^[a-z0-9-]+$/) })`
- Use in Server Actions: `const validated = insertArticleSchema.parse(formData)`
- Type inference: `type Article = typeof articles.$inferSelect`
- Handle relations: Use `.pick()` or `.omit()` to exclude/include FK fields

**Validation Chain Example**:
1. Drizzle schema defines structure: `articles` table
2. drizzle-zod generates Zod schema: `insertArticleSchema`
3. Server Action validates: `insertArticleSchema.parse(data)`
4. react-hook-form uses schema: `zodResolver(insertArticleSchema)`
5. Single source of truth: Drizzle schema drives all validation

---

### Phase 5: Database Access Layer & Integration Testing

**Objective**: Create production-ready database access utilities, implement query helpers, and write comprehensive integration tests

**Scope**:
- Refactor `src/lib/server/db/index.ts` with connection pooling and error handling
- Create query helper functions (e.g., `getArticleById`, `listArticlesByCategory`)
- Implement mutation helpers (e.g., `createArticle`, `updateArticle`, `deleteArticle`)
- Add transaction support for complex operations
- Write integration tests using local D1 with fixtures (seed + reset)
- Document database access patterns and best practices

**Dependencies**:
- Requires Phase 4 (validation chain ready)
- Requires all previous phases (complete schema + validation)

**Key Deliverables**:
- [ ] `src/lib/server/db/index.ts` - connection utility with error handling
- [ ] `src/lib/server/db/queries/` - directory with query helpers:
  - `articles.ts` - article CRUD operations
  - `translations.ts` - translation CRUD operations
  - `categories.ts` - category queries
  - `tags.ts` - tag CRUD operations
- [ ] Transaction wrapper for multi-step operations
- [ ] Error handling for common DB errors (unique constraint violations, FK errors, etc.)
- [ ] Integration tests in `tests/integration/`:
  - `db-articles.test.ts` - test article operations
  - `db-translations.test.ts` - test translation operations
  - `db-taxonomy.test.ts` - test category/tag operations
- [ ] Test fixtures: seed script + reset script for test isolation
- [ ] Documentation: database access patterns in README or `docs/dev/database.md`

**Files Affected** (~12 files):
- `src/lib/server/db/index.ts` (modified - enhanced connection)
- `src/lib/server/db/queries/articles.ts` (new)
- `src/lib/server/db/queries/translations.ts` (new)
- `src/lib/server/db/queries/categories.ts` (new)
- `src/lib/server/db/queries/tags.ts` (new)
- `src/lib/server/db/transactions.ts` (new)
- `tests/integration/db-articles.test.ts` (new)
- `tests/integration/db-translations.test.ts` (new)
- `tests/integration/db-taxonomy.test.ts` (new)
- `tests/fixtures/seed-test-data.sql` (new)
- `tests/fixtures/reset-test-db.sql` (new)
- `docs/dev/database.md` (new - documentation)

**Estimated Complexity**: Medium

**Estimated Duration**: 2 days (5-7 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:
- Integration tests with D1 local database can be flaky
- Test isolation requires careful seeding/resetting between tests
- Transaction support may be limited in D1 (SQLite transactions)

**Mitigation Strategies**:
- Use Playwright test fixtures pattern for DB seeding (`beforeEach` with `wrangler d1 execute`)
- Keep test data minimal (only what's needed per test)
- Document any D1 transaction limitations
- Separate read-only tests from mutation tests

**Success Criteria**:
- [ ] Can execute `getArticleById('some-id')` and retrieve article
- [ ] Can list articles by category
- [ ] Can create article with translations in single transaction
- [ ] Unique constraint violation returns clear error (not generic DB error)
- [ ] Integration tests run via `pnpm test:integration` and all pass
- [ ] Tests are isolated (each test starts with clean/known state)
- [ ] Test coverage ≥ 70% for database access layer

**Technical Notes**:
- Use Drizzle's query builder API (type-safe): `db.select().from(articles).where(...)`
- Transactions: `db.transaction(async (tx) => { ... })`
- Error handling: Wrap DB calls in try-catch, parse D1 error codes
- Test seeding: `wrangler d1 execute DB --local --file=./tests/fixtures/seed-test-data.sql`
- Test reset: `DELETE FROM articles; DELETE FROM categories;` etc. (or drop/recreate tables)

**Query Helper Example**:
```typescript
// src/lib/server/db/queries/articles.ts
export async function getArticleById(db: D1Database, id: string) {
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .get();

  if (!result) {
    throw new Error(`Article with id ${id} not found`);
  }

  return result;
}
```

**Integration Test Example**:
```typescript
// tests/integration/db-articles.test.ts
import { describe, it, beforeEach, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Articles Database Operations', () => {
  beforeEach(() => {
    // Reset and seed test database
    execSync('wrangler d1 execute DB --local --file=./tests/fixtures/reset-test-db.sql');
    execSync('wrangler d1 execute DB --local --file=./tests/fixtures/seed-test-data.sql');
  });

  it('should retrieve article by id', async () => {
    const article = await getArticleById(db, 'test-article-1');
    expect(article.id).toBe('test-article-1');
    expect(article.status).toBe('published');
  });
});
```

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Drizzle Config & D1 Setup)
    ↓
Phase 2 (Articles + Translations Schema)
    ↓
Phase 3 (Taxonomy: Categories, Tags)
    ↓
Phase 4 (Validation Chain: drizzle-zod)
    ↓
Phase 5 (Access Layer + Integration Tests)
```

### Critical Path

**Must follow this order**:
1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (strictly sequential)

**Cannot be parallelized**: All phases depend on previous phases completing

### Blocking Dependencies

**Phase 1 blocks**:
- Phase 2: Cannot define schema without Drizzle installed
- Phase 3: Same
- Phase 4: Same
- Phase 5: Same

**Phase 2 blocks**:
- Phase 3: categories.id must exist before articles.categoryId can reference it (or nullable approach)
- Phase 4: Need base schemas before generating Zod
- Phase 5: Need tables before writing queries

**Phase 3 blocks**:
- Phase 4: Need complete schema before validation
- Phase 5: Need all tables for comprehensive tests

**Phase 4 blocks**:
- Phase 5: Validation helpers used in access layer functions

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric | Estimate | Notes |
|--------|----------|-------|
| **Total Phases** | 5 | Sequential, atomic phases |
| **Total Duration** | 11 days | Based on sequential implementation |
| **Parallel Duration** | N/A | Cannot parallelize (strict dependencies) |
| **Total Commits** | ~24-31 | Across all phases |
| **Total Files** | ~33 new, ~5 modified | Estimated |
| **Test Coverage Target** | >70% | Across database access layer |

### Per-Phase Timeline

| Phase | Duration | Commits | Start After | Blocks |
|-------|----------|---------|-------------|--------|
| 1. Drizzle Config | 2d | 4-6 | - | Phase 2, 3, 4, 5 |
| 2. Core Schema | 3d | 6-8 | Phase 1 | Phase 3, 4, 5 |
| 3. Taxonomy Schema | 2d | 4-5 | Phase 2 | Phase 4, 5 |
| 4. Validation Chain | 2d | 4-5 | Phase 3 | Phase 5 |
| 5. Access Layer + Tests | 2d | 5-7 | Phase 4 | - |

### Resource Requirements

**Team Composition**:
- 1 developer: Full-stack (TypeScript, SQL, Drizzle ORM, testing)
- 1 reviewer: Technical review of schema design and validation logic

**External Dependencies**:
- Cloudflare account with D1 access (already available)
- Wrangler CLI installed and configured (from Story 0.1)
- `wrangler.toml` with basic config (from Story 0.5)

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Phase 1: Drizzle Config & D1 Setup** 🟡
- **Risk**: D1 local development with Wrangler can be problematic (HMR issues, pnpm incompatibility)
- **Impact**: Could delay entire story if connection issues not resolved
- **Mitigation**: Follow bi-modal development strategy (Architecture doc), test thoroughly before proceeding
- **Contingency**: Use remote D1 for development if local issues persist (slower but functional)

**Phase 2: Core Schema** 🟡
- **Risk**: Complex foreign key relations, ENUM handling in SQLite
- **Impact**: Schema errors could require migration rollback (manual process)
- **Mitigation**: Review schema carefully, test constraints thoroughly, keep migrations small
- **Contingency**: Manual migration edits if auto-generated SQL has issues

**Phase 4: Validation Chain** 🟡
- **Risk**: drizzle-zod may not auto-generate perfect schemas, need manual refinement
- **Impact**: Could require more time than estimated to get validation right
- **Mitigation**: Start simple, iterate on validation rules, extensive testing
- **Contingency**: Fall back to manual Zod schemas if drizzle-zod insufficient (less ideal, two sources of truth)

### Overall Story Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| D1 local dev friction | High | Medium | Bi-modal development, test early |
| Migration failures | Medium | High | Small migrations, test locally first |
| Schema design errors | Low | High | Careful review, match Architecture doc models |
| drizzle-zod limitations | Medium | Medium | Manual schema refinement if needed |
| Test flakiness (D1 fixtures) | Medium | Low | Robust seeding/reset scripts |
| D1 10GB limit (long-term) | Low | Critical | Monitor usage, plan sharding/migration Post-V1 |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase | Unit Tests | Integration Tests | E2E Tests |
|-------|------------|-------------------|-----------|
| 1. Drizzle Config | - | 1 test (connection) | - |
| 2. Core Schema | - | 2 tests (articles, translations) | - |
| 3. Taxonomy Schema | - | 1 test (categories, tags) | - |
| 4. Validation Chain | 3 tests (validation logic) | - | - |
| 5. Access Layer | - | 3 tests (CRUD operations) | - |

**Total**: 3 unit tests, 7 integration tests, 0 E2E (E2E will use this DB setup in future stories)

### Test Milestones

- **After Phase 1**: Can connect to D1 local database and execute SELECT 1
- **After Phase 2**: Can insert article + 2 translations, query by id
- **After Phase 3**: Can query 9 categories, create tag, link article to tag
- **After Phase 4**: Validation rejects invalid data with clear errors
- **After Phase 5**: All CRUD operations tested, test isolation working

### Quality Gates

Each phase must pass:
- [ ] All unit tests (>80% coverage on new code)
- [ ] All integration tests (with D1 local database)
- [ ] Linter with no errors (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Code review approved (schema design, validation logic)
- [ ] Manual QA checklist (can execute migrations, query works)

### Testing Tools

- **Unit tests**: Vitest for validation logic
- **Integration tests**: Vitest + Wrangler (`wrangler d1 execute` for seeding)
- **Test isolation**: Seed + reset scripts executed in `beforeEach`
- **Assertions**: Vitest `expect()` + custom DB matchers if needed

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

For each phase, use the `phase-doc-generator` skill to create:
1. INDEX.md
2. IMPLEMENTATION_PLAN.md
3. COMMIT_CHECKLIST.md
4. ENVIRONMENT_SETUP.md
5. guides/REVIEW.md
6. guides/TESTING.md
7. validation/VALIDATION_CHECKLIST.md

**Estimated documentation**: ~3400 lines per phase × 5 phases = **~17,000 lines**

### Story-Level Documentation

**This document** (PHASES_PLAN.md):
- Strategic overview of all 5 phases
- Phase coordination and dependencies
- Cross-phase timeline and resource estimates
- Overall story success criteria

**Phase-level documentation** (generated separately for each phase):
- Tactical implementation details (what to code)
- Commit-by-commit checklists (atomic commits)
- Specific technical validations (tests to write)
- Environment setup (npm installs, wrangler commands)

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team (or solo developer self-review)
   - Validate phase breakdown makes sense
   - Adjust estimates if needed (e.g., if experienced with Drizzle + D1, reduce durations)
   - Identify any missing phases or dependencies

2. **Set up project structure**
   ```bash
   mkdir -p docs/specs/epics/epic_0/story_0_4/implementation/phase_1
   mkdir -p docs/specs/epics/epic_0/story_0_4/implementation/phase_2
   mkdir -p docs/specs/epics/epic_0/story_0_4/implementation/phase_3
   mkdir -p docs/specs/epics/epic_0/story_0_4/implementation/phase_4
   mkdir -p docs/specs/epics/epic_0/story_0_4/implementation/phase_5
   ```

3. **Generate detailed documentation for Phase 1**
   - Use command: `/generate-phase-doc Epic 0 Story 0.4 Phase 1`
   - Or request: "Generate implementation docs for Phase 1 of Story 0.4"
   - Provide this PHASES_PLAN.md as context

### Implementation Workflow

For each phase:

1. **Plan** (if not done):
   - Read PHASES_PLAN.md for phase overview
   - Generate detailed docs with `phase-doc-generator`

2. **Implement**:
   - Follow IMPLEMENTATION_PLAN.md
   - Use COMMIT_CHECKLIST.md for each commit
   - Validate after each commit

3. **Review**:
   - Use guides/REVIEW.md
   - Ensure all success criteria met

4. **Validate**:
   - Complete validation/VALIDATION_CHECKLIST.md
   - Update this plan with actual metrics (duration, commits, issues encountered)

5. **Move to next phase**:
   - Mark current phase complete in EPIC_TRACKING.md
   - Repeat process for next phase

### Progress Tracking

Update this document as phases complete:
- [ ] Phase 1: Drizzle Config & D1 Setup - Status, Actual duration, Notes
- [ ] Phase 2: Core Schema - Status, Actual duration, Notes
- [ ] Phase 3: Taxonomy Schema - Status, Actual duration, Notes
- [ ] Phase 4: Validation Chain - Status, Actual duration, Notes
- [ ] Phase 5: Access Layer + Tests - Status, Actual duration, Notes

**Update EPIC_TRACKING.md** after each phase:
- Increment "Progress" column (e.g., "1/5" → "2/5" → "3/5" → "4/5" → "5/5")
- Update "Status" to ✅ COMPLETED when all 5 phases done

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:
- [ ] All 5 phases implemented and validated
- [ ] All acceptance criteria from original spec met (AC1-AC7)
- [ ] Test coverage >70% achieved for database access layer
- [ ] No critical bugs remaining (can insert, query, update, delete all entities)
- [ ] Documentation complete and reviewed (schema ERD, migration workflow, validation patterns)
- [ ] Can deploy to staging environment (migrations apply remotely)
- [ ] Stakeholder demo completed (if applicable) or self-validation checklist passed

### Quality Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Test Coverage | >70% | - |
| Type Safety | 100% (TypeScript strict mode) | - |
| Code Review Approval | 100% (all commits reviewed) | - |
| Migration Success Rate | 100% (all migrations apply without errors) | - |
| Integration Tests Passing | 100% (all 7 tests pass) | - |
| Validation Accuracy | 100% (all invalid data rejected, all valid data accepted) | - |

### Performance Metrics (optional)

| Metric | Target | Actual |
|--------|--------|--------|
| Query Response Time | <100ms (local D1) | - |
| Migration Duration | <10s (for current schema) | - |
| Schema Generation Time | <5s (`pnpm db:generate`) | - |

---

## 📚 Reference Documents

### Story Specification
- Original spec: `docs/specs/epics/epic_0/story_0_4/story_0.4.md`

### Related Documentation
- Epic overview: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- PRD: `docs/specs/PRD.md` (EPIC 0.4, lines 591)
- Architecture: `docs/specs/Architecture_technique.md` (Data models, lines 152-166)
- Previous stories:
  - Story 0.1 (Next.js init) - ✅ COMPLETED
  - Story 0.5 (wrangler.toml config) - 🚧 IN PROGRESS (40%)

### Generated Phase Documentation
- Phase 1: `docs/specs/epics/epic_0/story_0_4/implementation/phase_1/INDEX.md` (to be generated)
- Phase 2: `docs/specs/epics/epic_0/story_0_4/implementation/phase_2/INDEX.md` (to be generated)
- Phase 3: `docs/specs/epics/epic_0/story_0_4/implementation/phase_3/INDEX.md` (to be generated)
- Phase 4: `docs/specs/epics/epic_0/story_0_4/implementation/phase_4/INDEX.md` (to be generated)
- Phase 5: `docs/specs/epics/epic_0/story_0_4/implementation/phase_5/INDEX.md` (to be generated)

### External Documentation
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle + Cloudflare D1 Guide](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [drizzle-zod Documentation](https://orm.drizzle.team/docs/zod)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)

---

**Plan Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING
