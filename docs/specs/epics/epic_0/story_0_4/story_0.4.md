# Story 0.4 - Configurer Drizzle ORM + Cloudflare D1

**Epic**: Epic 0 - Socle technique (V1)
**Story ID**: 0.4
**Status**: 📋 NOT STARTED
**Created**: 2025-11-08
**Priority**: High (Foundation)

---

## 📖 Story Description

**From PRD** (EPIC 0, lines 591):
> **0.4** Configurer Drizzle ORM + Cloudflare D1 (schéma initial + migrations)

This story establishes the database foundation for sebc.dev by configuring Drizzle ORM as the type-safe database access layer for Cloudflare D1. It includes creating the initial database schema for all core entities (articles, translations, categories, tags) and setting up the migration workflow for both local development and remote deployment.

---

## 🎯 Story Objectives

1. Install and configure Drizzle ORM with Cloudflare D1 adapter
2. Create comprehensive database schema covering all V1 entities
3. Establish migration workflow (drizzle-kit generate + wrangler d1 migrations)
4. Set up type-safe validation chain (Drizzle Schema → drizzle-zod → Zod)
5. Create seed data script for the 9 canonical categories
6. Implement database access layer utilities in `src/lib/server/db/`
7. Test database operations with local D1 (Miniflare)

---

## 📋 Acceptance Criteria

### AC1: Drizzle ORM Configured
- [ ] `drizzle-orm` and `@cloudflare/d1` dependencies installed
- [ ] `drizzle.config.ts` configured for Cloudflare D1 with local and remote connections
- [ ] Wrangler D1 database created (`wrangler d1 create DB`)
- [ ] Database binding configured in `wrangler.toml`
- [ ] Connection test successful (query returns expected result)

### AC2: Database Schema Created
- [ ] `articles` table schema defined with all required fields:
  - `id`, `categoryId`, `complexity`, `status`, `publishedAt`, `coverImage`, `createdAt`, `updatedAt`
- [ ] `article_translations` table schema defined with 1-N relation to articles:
  - `id`, `articleId` (FK), `language`, `title`, `slug`, `excerpt`, `seoTitle`, `seoDescription`, `contentMdx`
- [ ] `categories` table schema defined (9 canonical categories):
  - `id`, `key`, `nameFr`, `nameEn`, `slugFr`, `slugEn`, `icon`, `color`
- [ ] `tags` table schema defined:
  - `id`, `nameFr`, `nameEn`, `createdAt`
- [ ] `articleTags` junction table schema defined (Many-to-Many):
  - `articleId`, `tagId`, composite primary key
- [ ] All foreign key relations properly defined
- [ ] All field types match TypeScript types for type safety

### AC3: Migration System Working
- [ ] `pnpm db:generate` script creates migration SQL files
- [ ] `pnpm db:migrate:local` applies migrations to local D1 (Miniflare)
- [ ] `pnpm db:migrate:remote` applies migrations to remote D1 (production)
- [ ] Migrations are versioned and tracked properly
- [ ] Rollback strategy documented

### AC4: Type-Safe Validation Chain
- [ ] `drizzle-zod` installed and configured
- [ ] Zod schemas auto-generated from Drizzle schemas
- [ ] Validation helpers created for Server Actions
- [ ] Type inference working (TypeScript autocomplete for queries)
- [ ] Insert/update schemas validated with Zod

### AC5: Seed Data Created
- [ ] SQL seed script created for 9 canonical categories:
  1. Actualités (News)
  2. Analyse Approfondie (Deep Analysis)
  3. Parcours d'Apprentissage (Learning Path)
  4. Rétrospective (Retrospective)
  5. Tutoriel (Tutorial)
  6. Étude de Cas (Case Study)
  7. Astuces Rapides (Quick Tips)
  8. Dans les Coulisses (Behind the Scenes)
  9. Test d'Outil (Tool Test)
- [ ] Seed data includes: key, nameFr, nameEn, slugFr, slugEn, icon, color
- [ ] `pnpm db:seed` script executes seed successfully

### AC6: Database Access Layer
- [ ] Database connection utility created in `src/lib/server/db/index.ts`
- [ ] Type-safe query helpers created
- [ ] Error handling implemented
- [ ] Connection pooling configured (if applicable)
- [ ] Code restricted to server-side only (no client access)

### AC7: Testing & Documentation
- [ ] Integration tests created for database operations
- [ ] Tests use local D1 with fixtures (seeding + reset)
- [ ] Migration workflow documented in README or dev docs
- [ ] Schema relationships documented (ERD or description)
- [ ] npm scripts documented (`db:generate`, `db:migrate:local`, `db:migrate:remote`, `db:seed`)

---

## 🔗 Dependencies

### Blocked By (must complete first):
- **Story 0.1** ✅ COMPLETED - Next.js 15 initialized (provides project structure)
- **Story 0.5** 🚧 IN PROGRESS (40%) - wrangler.toml with D1 binding configured

### Blocks (cannot start until this completes):
- **Story 1.1** (EPIC 1) - Create schéma D1 for articles
  - *Note: Story 1.1 will extend this schema, not recreate it*
- **Story 1.2** (EPIC 1) - Seed script for 9 categories
  - *Note: Story 1.2 uses seed script created in Phase 3 of this story*

### Related Stories:
- **Story 0.7** (EPIC 0) - CI/CD with D1 migrations in pipeline

---

## 📊 Technical Details

### Database Models (from Architecture_technique.md)

#### 1. `articles` table
Central entity containing shared metadata across languages.

**Fields**:
- `id`: UUID primary key
- `categoryId`: Foreign key to `categories.id`
- `complexity`: ENUM ('beginner', 'intermediate', 'advanced')
- `status`: ENUM ('draft', 'published')
- `publishedAt`: TIMESTAMP (nullable, set when status becomes 'published')
- `coverImage`: TEXT (R2 path to cover image)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

#### 2. `article_translations` table
Language-specific content (1-N relation with articles).

**Fields**:
- `id`: UUID primary key
- `articleId`: Foreign key to `articles.id` (ON DELETE CASCADE)
- `language`: VARCHAR ('fr' | 'en')
- `title`: VARCHAR (required)
- `slug`: VARCHAR (unique per language, required)
- `excerpt`: TEXT (SEO description, required)
- `seoTitle`: VARCHAR (required)
- `seoDescription`: TEXT (required)
- `contentMdx`: TEXT (Markdown with React components)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

**Unique constraint**: `(articleId, language)` - one translation per language per article

#### 3. `categories` table
9 canonical, predefined categories (modifiable but not deletable).

**Fields**:
- `id`: UUID primary key
- `key`: VARCHAR (unique identifier, e.g., 'news', 'deep-analysis')
- `nameFr`: VARCHAR (French display name)
- `nameEn`: VARCHAR (English display name)
- `slugFr`: VARCHAR (French slug)
- `slugEn`: VARCHAR (English slug)
- `icon`: VARCHAR (icon identifier from icon library)
- `color`: VARCHAR (hex color code for UI)

#### 4. `tags` table
Flexible taxonomy managed by admin.

**Fields**:
- `id`: UUID primary key
- `nameFr`: VARCHAR (French tag name)
- `nameEn`: VARCHAR (English tag name)
- `createdAt`: TIMESTAMP

#### 5. `articleTags` table
Many-to-Many junction between articles and tags.

**Fields**:
- `articleId`: Foreign key to `articles.id` (ON DELETE CASCADE)
- `tagId`: Foreign key to `tags.id` (ON DELETE CASCADE)
- **Composite primary key**: `(articleId, tagId)`

### Technology Stack

| Component | Package | Version | Purpose |
|-----------|---------|---------|---------|
| **ORM** | `drizzle-orm` | latest | Type-safe database queries |
| **D1 Adapter** | `@cloudflare/d1` (included in Drizzle) | latest | Cloudflare D1 bindings |
| **Migrations** | `drizzle-kit` | latest | Migration generation & management |
| **Validation** | `drizzle-zod` | latest | Auto-generate Zod schemas from Drizzle |
| **Schema Validation** | `zod` | latest | Runtime validation for Server Actions |

### Configuration Files

1. **drizzle.config.ts** (root):
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
```

2. **wrangler.toml** (D1 binding):
```toml
[[d1_databases]]
binding = "DB"
database_name = "sebc-dev-db"
database_id = "..."  # Generated by `wrangler d1 create`
```

3. **package.json scripts**:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply DB --local",
    "db:migrate:remote": "wrangler d1 migrations apply DB --remote",
    "db:seed": "wrangler d1 execute DB --local --file=./drizzle/seed.sql",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Validation Chain Pattern

**Drizzle Schema → drizzle-zod → Zod → react-hook-form**

Example flow:
1. Define Drizzle schema: `export const articles = sqliteTable(...)`
2. Auto-generate Zod schema: `export const insertArticleSchema = createInsertSchema(articles)`
3. Use in Server Action: `const validated = insertArticleSchema.parse(formData)`
4. Use in forms: `zodResolver(insertArticleSchema)` with react-hook-form

---

## ⚠️ Risks & Mitigations

### Risk 1: D1 Storage Limit (10 GB)
**Level**: 🟡 Medium (long-term)

**Description**: Cloudflare D1 has a 10 GB storage limit per database, which may become a constraint with growth (articles, embeddings for semantic search).

**Mitigation**:
- Monitor database size proactively via Cloudflare dashboard
- Plan sharding strategy or migration to alternative (Turso, Neon) in Post-V1
- Document current database size in metrics

### Risk 2: Migration Failures
**Level**: 🟡 Medium

**Description**: Database migrations can fail if schema changes are incompatible or if remote D1 is out of sync with local.

**Mitigation**:
- Always test migrations locally first (`pnpm db:migrate:local`)
- Use transactions in migrations when possible
- Document rollback procedure
- Keep migrations small and incremental

### Risk 3: Type Safety Gaps
**Level**: 🟢 Low

**Description**: Potential for runtime errors if Zod validation doesn't match Drizzle schema (e.g., manual Zod schemas).

**Mitigation**:
- Always use `drizzle-zod` to auto-generate Zod schemas (single source of truth)
- Add integration tests to validate schema integrity
- Use TypeScript strict mode

---

## 📚 References

### PRD Sections
- **EPIC 0.4** (line 591): Story definition
- **Hypothèses techniques** (lines 570-571): Migration workflow with Drizzle
- **ENF20** (lines 445-453): Testing strategy with D1 fixtures

### Architecture Documentation
- **Architecture_technique.md**:
  - Lines 33-34: Cloudflare D1 + Drizzle ORM
  - Lines 152-166: Data models (articles, article_translations, categories, tags, articleTags)
  - Lines 119-120: ORM pattern and validation chain
  - Lines 315-319: Migration workflow (two-step process)

### Related Specs
- **wrangler.toml**: D1 binding configuration
- **Frontend_Specification.md** (if exists): Component data requirements

---

## 🚀 Implementation Notes

### Development Workflow

1. **Local Development**:
   - Use `wrangler dev` with Miniflare for local D1 database
   - Database persisted in `.wrangler/state/d1/` during local dev
   - Use Drizzle Studio (`pnpm db:studio`) for visual schema exploration

2. **Schema Changes**:
   - Modify Drizzle schema in `src/lib/server/db/schema.ts`
   - Run `pnpm db:generate` to create migration SQL
   - Review generated SQL in `drizzle/migrations/`
   - Apply locally: `pnpm db:migrate:local`
   - Test changes
   - Commit migration files to git

3. **Deployment**:
   - CI/CD pipeline runs `wrangler d1 migrations apply DB --remote` before code deployment
   - Never skip migrations in production

### Best Practices

- **Never edit generated migration SQL** unless absolutely necessary (breaks drizzle-kit tracking)
- **Always use Drizzle for queries** (no raw SQL except in migrations/seeds)
- **Keep migrations small** (one logical change per migration)
- **Test with real data** (seed script should include realistic sample data)
- **Document breaking changes** (especially for future schema evolutions)

---

**Story Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Created by**: Claude Code (story-phase-planner skill)
