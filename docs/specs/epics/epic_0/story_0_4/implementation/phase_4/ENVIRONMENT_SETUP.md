# Phase 4 - Environment Setup

This guide covers all environment setup needed for Phase 4.

---

## 📋 Prerequisites

### Previous Phases

- [x] Phase 1 completed and validated (Drizzle ORM installed and D1 configured)
- [x] Phase 2 completed and validated (Core schema: articles, article_translations)
- [x] Phase 3 completed and validated (Taxonomy schema: categories, tags, articleTags)

### Tools Required

- [x] Node.js (v18.0.0+)
- [x] pnpm (v8.0.0+)
- [x] TypeScript (v5.0.0+)
- [x] Drizzle ORM installed (from Phase 1)

### Services Required

- [x] None (Phase 4 is local-only - no external services)

---

## 📦 Dependencies Installation

### Install New Packages

Phase 4 requires installing **drizzle-zod** for auto-generating Zod schemas from Drizzle schemas.

```bash
# Install drizzle-zod
pnpm add drizzle-zod

# Verify installation
pnpm list drizzle-zod
```

**Package added**:

- `drizzle-zod` - Auto-generates Zod validation schemas from Drizzle ORM schemas

### Verify Installation

```bash
# Check package.json
cat package.json | grep drizzle-zod
# Should show: "drizzle-zod": "^0.5.x" (or latest version)

# Test import in Node.js
node -e "const { createInsertSchema } = require('drizzle-zod'); console.log('drizzle-zod loaded successfully')"
```

**Expected Output**:

```
drizzle-zod loaded successfully
```

---

## 🔧 Environment Variables

### No New Variables Required

Phase 4 does **not** require any new environment variables.

**Existing variables** (from previous phases):

- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID (Phase 1)
- `CLOUDFLARE_DATABASE_ID` - D1 database ID (Phase 1)
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token (Phase 1)

These are already configured in `.env.local` or your environment.

---

## 🗄️ Database Schema

### Required Schema (from Phase 3)

Phase 4 builds on the complete database schema created in Phases 2-3:

**Tables**:

1. `articles` - Core article metadata
2. `article_translations` - Localized article content
3. `categories` - Canonical categories (9 entries)
4. `tags` - Flexible taxonomy tags
5. `articleTags` - Many-to-Many junction table

**Schema Location**: `src/lib/server/db/schema.ts`

### Verify Schema Exists

```bash
# Check schema file exists
ls -lh src/lib/server/db/schema.ts

# Verify all tables exported
grep "export const" src/lib/server/db/schema.ts
```

**Expected Output**:

```
export const articles = sqliteTable(...)
export const articleTranslations = sqliteTable(...)
export const categories = sqliteTable(...)
export const tags = sqliteTable(...)
export const articleTags = sqliteTable(...)
```

---

## ✅ Pre-Implementation Validation

### Check Phases 1-3 Complete

Run these commands to verify previous phases are complete:

```bash
# 1. Drizzle ORM installed (Phase 1)
pnpm list drizzle-orm
# Should show: drizzle-orm@...

# 2. Schema file exists (Phase 2-3)
cat src/lib/server/db/schema.ts | grep "export const articles"
# Should output: export const articles = sqliteTable(...)

# 3. Migrations applied (Phase 2-3)
ls drizzle/migrations/
# Should show at least 2 migration files (0001_*.sql, 0002_*.sql)

# 4. TypeScript compiles
pnpm tsc --noEmit
# Should complete with no errors
```

**All checks must pass before starting Phase 4.**

---

## 🚨 Troubleshooting

### Issue: drizzle-zod Installation Fails

**Symptoms**:

- `pnpm add drizzle-zod` fails with error
- Peer dependency warnings

**Solutions**:

1. Update pnpm: `pnpm self-update`
2. Clear cache: `pnpm store prune`
3. Retry installation: `pnpm add drizzle-zod`
4. Check compatibility: Ensure `drizzle-orm` version is compatible

**Verify Fix**:

```bash
pnpm install
pnpm list drizzle-zod
```

---

### Issue: TypeScript Errors After Installation

**Symptoms**:

- `pnpm tsc --noEmit` shows errors
- Import errors for `drizzle-zod`

**Solutions**:

1. Restart TypeScript server in IDE (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Ensure `tsconfig.json` includes `src/**/*`
3. Clear TypeScript cache: `rm -rf node_modules/.cache`
4. Reinstall: `pnpm install`

**Verify Fix**:

```bash
pnpm tsc --noEmit
# Should complete with no errors
```

---

### Issue: Cannot Import from `schema.ts`

**Symptoms**:

- `validation.ts` cannot import from `schema.ts`
- Module not found errors

**Solutions**:

1. Verify `schema.ts` exists: `ls src/lib/server/db/schema.ts`
2. Check exports in `schema.ts`: `grep "export const" src/lib/server/db/schema.ts`
3. Verify TypeScript path aliases in `tsconfig.json`
4. Ensure relative import path is correct

**Verify Fix**:

```bash
# Test import
node -e "const { articles } = require('./src/lib/server/db/schema'); console.log(articles)"
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

- [x] All prerequisites met (Node.js, pnpm, TypeScript)
- [x] Phases 1-3 completed and validated
- [x] `drizzle-zod` installed successfully
- [x] `pnpm install` completes without errors
- [x] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [x] Schema file exists and exports all tables
- [x] No environment variable changes needed

**Environment is ready! 🚀**

---

## 🔗 Related Documentation

- [Phase 1 - Drizzle Config](../phase_1/INDEX.md) - Drizzle ORM setup
- [Phase 2 - Core Schema](../phase_2/INDEX.md) - Articles and translations
- [Phase 3 - Taxonomy Schema](../phase_3/INDEX.md) - Categories and tags
- [Drizzle-Zod Documentation](https://orm.drizzle.team/docs/zod) - Official docs
- [Zod Documentation](https://zod.dev) - Zod validation library

---

**Ready to implement! Proceed to [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) 🚀**
