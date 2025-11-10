# Phase 3 - Environment Setup

This guide covers all environment setup needed for Phase 3: Taxonomy Schemas.

---

## 📋 Prerequisites

### Previous Phases

- [ ] **Phase 1** completed and validated (Drizzle ORM installed, D1 configured)
- [ ] **Phase 2** completed and validated (Articles and article_translations tables exist)
- [ ] Local D1 database running and accessible
- [ ] Migration 0001 (or equivalent from Phase 2) applied successfully

### Tools Required

- [ ] Node.js v20+ installed
- [ ] pnpm installed (package manager)
- [ ] Wrangler CLI installed and configured
- [ ] Drizzle Kit installed (dev dependency)

### Services Required

- [ ] Cloudflare D1 local database running (via Miniflare in `wrangler dev` or standalone)
- [ ] Database binding `DB` configured in `wrangler.toml`

---

## 📦 Dependencies Installation

### Verify Existing Packages

Phase 3 uses packages already installed in Phase 1. Verify they're present:

```bash
# Check package.json for required dependencies
pnpm list drizzle-orm
pnpm list drizzle-kit
pnpm list wrangler
```

**Expected packages** (from Phase 1):

- `drizzle-orm` - ORM for database queries
- `drizzle-kit` - Migration generation and management
- `wrangler` - Cloudflare CLI for D1 operations

**No new packages required for Phase 3.**

### Verify npm Scripts

Check that Phase 1 created these scripts in `package.json`:

```json
{
  "scripts": {
    "db:generate": "npm run db:check && dotenv -e .env -- drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply DB --local",
    "db:migrate:remote": "npm run db:check && dotenv -e .env -- wrangler d1 migrations apply DB --remote",
    "db:studio": "dotenv -e .env -- drizzle-kit studio"
  }
}
```

**New script added in Phase 3 Commit 4**:

```json
{
  "scripts": {
    "db:seed": "wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql"
  }
}
```

---

## 🔧 Environment Variables

### Required Variables

Phase 3 uses the same environment variables configured in Phase 1. Verify they're set in `.env`:

```env
# Cloudflare Account Configuration (for remote D1)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_DATABASE_ID=your_database_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

**Note**: These variables are **only required for remote operations** (production migrations). For local development and this phase, they're optional.

### Variable Descriptions

| Variable                 | Description                                | Example           | Required                  |
| ------------------------ | ------------------------------------------ | ----------------- | ------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account ID                 | `a1b2c3d4e5f6...` | No (local) / Yes (remote) |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID (from `wrangler d1 create`) | `db-uuid-here`    | No (local) / Yes (remote) |
| `CLOUDFLARE_API_TOKEN`   | Cloudflare API token with D1 permissions   | `token-here`      | No (local) / Yes (remote) |

**For Phase 3**: All operations use `--local` flag, so these variables are **not required**.

---

## 🗄️ Database Setup

### Verify D1 Database Exists

Check that the D1 database was created in Phase 1:

```bash
# List local D1 databases
wrangler d1 list

# Verify binding in wrangler.toml
cat wrangler.toml | grep -A 3 "d1_databases"
```

**Expected output** in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sebc-dev-db"
database_id = "your-database-id"
```

### Verify Phase 2 Migration Applied

Check that Phase 2's migration (articles + article_translations tables) was applied:

```bash
# List tables in local D1
wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected tables** (from Phase 2):

- `articles`
- `article_translations`
- `_drizzle_migrations` (or equivalent tracking table)

**If tables are missing**: Go back to Phase 2 and apply its migration first.

---

## 🏗️ Directory Structure

### Verify Drizzle Directory Exists

Phase 1 should have created these directories:

```bash
# Check directory structure
ls -la drizzle/
```

**Expected structure** (from Phase 1):

```
drizzle/
├── migrations/          # Generated migration SQL files
│   ├── 0001_*.sql      # Phase 2 migration
│   └── meta/           # Migration metadata
└── seeds/              # Created in Phase 3 Commit 4
```

**If `drizzle/` doesn't exist**: Phase 1 was not completed. Run `pnpm db:generate` once to create it.

### Create Seeds Directory

Phase 3 Commit 4 will create the seeds directory:

```bash
mkdir -p drizzle/seeds
```

---

## ✅ Connection Tests

### Test Local D1 Connection

Verify you can connect to and query the local D1 database:

```bash
# Test basic query
wrangler d1 execute DB --local --command "SELECT 1 as test;"
```

**Expected Output**:

```json
[
  {
    "test": 1
  }
]
```

### Test Drizzle Configuration

Verify Drizzle can read your schema and generate migrations:

```bash
# Dry-run migration generation (doesn't create files)
pnpm db:generate --check
```

**Expected Output**:

- No errors
- Message indicating schema is valid
- No new migrations generated (unless you've modified schema)

### Test Migration System

Verify the migration system works by checking migration history:

```bash
# Query migration tracking table
wrangler d1 execute DB --local --command "SELECT * FROM _drizzle_migrations;"
```

**Expected Output**:

- At least 1 migration record (from Phase 2)
- `hash` and `created_at` fields populated

---

## 🚨 Troubleshooting

### Issue: `wrangler d1 execute` fails with "Database not found"

**Symptoms**:

- Error: `Error: Database with ID/name 'DB' not found`
- `wrangler d1 list` shows no databases

**Solutions**:

1. Verify `wrangler.toml` has `[[d1_databases]]` binding:
   ```bash
   cat wrangler.toml | grep -A 3 "d1_databases"
   ```
2. Re-create D1 database if missing:
   ```bash
   wrangler d1 create sebc-dev-db
   ```
3. Update `database_id` in `wrangler.toml` with output from create command

**Verify Fix**:

```bash
wrangler d1 execute DB --local --command "SELECT 1;"
```

---

### Issue: Phase 2 migration not applied

**Symptoms**:

- `articles` or `article_translations` tables don't exist
- Error when querying tables

**Solutions**:

1. Check migration status:
   ```bash
   wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   ```
2. Apply Phase 2 migration:
   ```bash
   pnpm db:migrate:local
   ```
3. Verify tables created:
   ```bash
   wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   ```

**Verify Fix**:

- Tables `articles` and `article_translations` should be listed

---

### Issue: `pnpm db:generate` fails with schema errors

**Symptoms**:

- Error: `TypeError: Cannot read property 'name' of undefined`
- Error: `Invalid table definition`

**Solutions**:

1. Verify `drizzle.config.ts` exists at project root:
   ```bash
   cat drizzle.config.ts
   ```
2. Check schema file path is correct in config:
   ```typescript
   schema: './src/lib/server/db/schema.ts';
   ```
3. Verify schema file exists:
   ```bash
   cat src/lib/server/db/schema.ts
   ```
4. Check for TypeScript errors in schema:
   ```bash
   pnpm tsc --noEmit
   ```

**Verify Fix**:

```bash
pnpm db:generate --check
# Should show no errors
```

---

### Issue: Local D1 database is empty after restart

**Symptoms**:

- Tables exist during `wrangler dev` session
- Tables disappear after stopping and restarting
- Need to re-apply migrations each time

**Solutions**:

1. This is **expected behavior** with Miniflare (Wrangler's local simulator)
2. Local D1 data is stored in `.wrangler/state/d1/`
3. Check if `.wrangler/` is in `.gitignore` (it should be)
4. Re-apply migrations and seed data after each restart:
   ```bash
   pnpm db:migrate:local
   pnpm db:seed  # After Phase 3 Commit 4
   ```

**Recommended Workflow**:

- Keep a terminal with `wrangler dev` running during development
- Don't stop/restart unless necessary
- Use bi-modal development (Architecture doc recommendation) if HMR issues persist

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 3 implementation:

- [ ] Phase 1 completed (Drizzle installed, D1 configured)
- [ ] Phase 2 completed (articles, article_translations tables exist)
- [ ] Local D1 connection test passes (`SELECT 1`)
- [ ] Drizzle config test passes (`pnpm db:generate --check`)
- [ ] Migration history queryable
- [ ] `drizzle/` directory exists
- [ ] npm scripts available (`db:generate`, `db:migrate:local`)
- [ ] No TypeScript errors in existing schema
- [ ] No environment variable errors (for local operations)

**Environment is ready for Phase 3! 🚀**

---

## 🔗 Additional Resources

### Documentation

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle + D1 Guide](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)

### Project Documentation

- [PHASES_PLAN.md](../PHASES_PLAN.md) - Overview of all phases
- [Phase 1 Docs](../phase_1/INDEX.md) - Initial setup reference
- [Phase 2 Docs](../phase_2/INDEX.md) - Core schema reference
- [Story Spec](../../story_0.4.md) - Story objectives and acceptance criteria

### Helpful Commands

```bash
# Quick reference
pnpm db:generate          # Generate migration from schema changes
pnpm db:migrate:local     # Apply migrations to local D1
pnpm db:studio            # Open Drizzle Studio (visual DB explorer)
wrangler d1 execute DB --local --command "SQL"  # Run SQL query

# After Phase 3 Commit 4
pnpm db:seed              # Load 9 canonical categories
```
