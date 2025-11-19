# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1 - Configuration Locale.

---

## 📋 Prerequisites

### Previous Phases

- [x] **Phase 0 completed and validated** (Nettoyage et Préparation)
  - ADR 002 created (wrangler dev local approach)
  - Git status clean
  - Configuration commentée supprimée
  - Documentation à jour

### Tools Required

- [x] **Git** 2.30+ - Version control
- [x] **Node.js** 20+ - JavaScript runtime
- [x] **pnpm** 9.15+ - Package manager
- [x] **wrangler CLI** 3.95+ - Cloudflare Workers CLI (**CRITICAL for Phase 1**)
- [x] **tsx** (dev dependency) - TypeScript execution for testing global-setup

### Verify Tool Versions

```bash
# Git version
git --version
# Expected: git version 2.30.0 or higher

# Node.js version
node --version
# Expected: v20.x.x or higher

# pnpm version
pnpm --version
# Expected: 9.15.0 or higher

# wrangler version (CRITICAL CHECK)
pnpm wrangler --version
# Expected: ⛅️ wrangler 3.95.0 or higher

# tsx (should be in devDependencies)
pnpm exec tsx --version
# Expected: prints version number
```

---

## 📦 Dependencies Installation

### Verify Existing Dependencies

Phase 1 uses **existing dependencies** from package.json:

```bash
# Check that wrangler is installed
grep -A 2 '"wrangler"' package.json
# Expected: Shows wrangler version in dependencies or devDependencies

# Check that @opennextjs/cloudflare is installed
grep -A 2 '"@opennextjs/cloudflare"' package.json
# Expected: Shows OpenNext version

# Check that tsx is available (for testing global-setup)
grep -A 2 '"tsx"' package.json
# Expected: Shows tsx in devDependencies
```

### Install Dependencies (if needed)

```bash
# Install all project dependencies
pnpm install --frozen-lockfile

# Verify installation
pnpm list wrangler
pnpm list @opennextjs/cloudflare
pnpm list tsx
# Expected: Each shows installed version
```

**No new packages are added in Phase 1** - all required tools are already in package.json.

---

## 🔧 Wrangler Configuration

### Verify wrangler.jsonc

Phase 1 relies on existing `wrangler.jsonc` configuration:

```bash
# Check that wrangler.jsonc exists
test -f wrangler.jsonc && echo "✅ wrangler.jsonc exists"

# Verify D1 database binding
grep -A 5 'database_id' wrangler.jsonc
# Expected: Shows DB binding configuration
```

**Key configuration to verify in wrangler.jsonc**:

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "website-db",
      "database_id": "...", // UUID for production
    },
  ],
  // ... other configuration
}
```

**Critical checks**:

- [ ] `binding: "DB"` - Must match the binding name used in code and global-setup
- [ ] `compatibility_flags` includes `"nodejs_compat"` - Required for Node.js APIs
- [ ] `d1_databases` array is properly configured

### Test Wrangler Authentication

```bash
# Check wrangler authentication status
pnpm wrangler whoami

# Expected output:
# 👋 You are logged in with an OAuth Token, associated with the email '...@...'!
# ┌──────────────────┬──────────────────────────────┐
# │ Account Name     │ Account ID                   │
# ├──────────────────┼──────────────────────────────┤
# │ Your Account     │ abc123...                    │
# └──────────────────┴──────────────────────────────┘
```

**If not authenticated**:

```bash
# Login to Cloudflare
pnpm wrangler login

# Follow browser prompts to authorize
```

---

## 🗄️ D1 Database Setup

### Verify D1 Database Exists

```bash
# List D1 databases
pnpm wrangler d1 list

# Expected output should include:
# ┌──────────────┬─────────────────────────┬─────────────┬────────────┐
# │ name         │ database_id             │ created_at  │ version    │
# ├──────────────┼─────────────────────────┼─────────────┼────────────┤
# │ website-db   │ xxx-xxx-xxx-xxx         │ 2024-XX-XX  │ prod       │
# └──────────────┴─────────────────────────┴─────────────┴────────────┘
```

**If database doesn't exist** (unlikely in existing project):

```bash
# Create D1 database
pnpm wrangler d1 create website-db

# Copy the database_id to wrangler.jsonc
```

### Verify Migrations Exist

```bash
# Check that migration files exist
ls -la drizzle/migrations/

# Expected: Lists SQL migration files
# Example:
# 0001_create_categories.sql
# 0002_create_articles.sql
# etc.

# Verify migrations are valid SQL
head -20 drizzle/migrations/*.sql
# Expected: Shows CREATE TABLE statements
```

### Verify Seed Files Exist

```bash
# Check that seed files exist
ls -la drizzle/seeds/

# Expected output:
# categories.sql
# sample-articles.sql

# Verify seeds are valid SQL
head -10 drizzle/seeds/categories.sql
# Expected: Shows INSERT statements for categories

head -10 drizzle/seeds/sample-articles.sql
# Expected: Shows INSERT statements for articles
```

### Test D1 Local Development

```bash
# Apply migrations to local D1 (test run)
pnpm wrangler d1 migrations apply DB --local

# Expected output:
# 🌀 Mapping SQL input into an array of statements
# 🌀 Executing on local database DB (xxxx-xxxx-...) from .wrangler/state/v3/d1:
# 🌀 To execute on your remote database, add a --remote flag to your wrangler command.
# ✅ Applying migration 0001_create_categories.sql
# ✅ Applying migration 0002_create_articles.sql
# ✅ Migrations applied successfully

# Verify tables were created
pnpm wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# Expected output shows tables:
# categories
# articles
# etc.

# Test seeding (dry run)
pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql

# Expected: Rows written: X

# Verify data
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories"
# Expected: Returns count > 0
```

---

## 🌐 Environment Variables

### Required Variables

Phase 1 uses **local development only**, so most environment variables are **NOT required** yet.

The following are needed for CI (Phase 3), but **not for Phase 1 local development**:

- `CLOUDFLARE_API_TOKEN` - CI only (Phase 3)
- `CLOUDFLARE_ACCOUNT_ID` - CI only (Phase 3)

### Optional: Create .env.local (for documentation)

```bash
# Create .env.local (optional for Phase 1)
cat > .env.local << 'EOF'
# Cloudflare Configuration (NOT USED in Phase 1 local development)
# These will be needed for Phase 3 (CI integration)

# CLOUDFLARE_API_TOKEN=your_token_here  # Set in GitHub Secrets for CI
# CLOUDFLARE_ACCOUNT_ID=your_account_id  # Set in GitHub Secrets for CI

# Local Development (wrangler dev)
# No additional environment variables needed for Phase 1
# Wrangler reads configuration from wrangler.jsonc
EOF
```

**Note**: `.env.local` is already in `.gitignore` - never commit it.

---

## 🧪 Connection Tests

### Test wrangler dev Startup

```bash
# Start wrangler dev server
pnpm preview

# Expected output:
# Building .open-next...
# ✓ Build completed in XX.Xs
#
# ⛅️ wrangler 3.95.0
# -------------------
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://127.0.0.1:8788
# ⎔ Listening on http://127.0.0.1:8788
#
# ╭─────────────────────────────────────────────────────────╮
# │  [b] open a browser, [d] open Devtools, [l] turn on     │
# │  local mode, [c] clear console, [x] to exit             │
# ╰─────────────────────────────────────────────────────────╯

# In another terminal, test the server
curl http://127.0.0.1:8788

# Expected: HTML response (Next.js homepage)

# Stop server (Ctrl+C in original terminal)
```

**Key checks**:

- [ ] Server starts successfully
- [ ] Listens on `127.0.0.1:8788` (IPv4, not localhost or ::1)
- [ ] Application responds to HTTP requests
- [ ] No binding errors (D1, R2, etc.)

### Test D1 Access from wrangler dev

```bash
# Start wrangler dev
pnpm preview

# In another terminal, check D1 database while server is running
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"

# Expected: Returns count of categories (should be > 0 if seeded)

# Stop wrangler dev (Ctrl+C)
```

---

## 🚨 Troubleshooting

### Issue: wrangler command not found

**Symptoms**:

- `pnpm wrangler --version` returns error
- "command not found: wrangler"

**Solutions**:

1. Install dependencies: `pnpm install`
2. Verify wrangler is in package.json: `grep wrangler package.json`
3. Try global install (not recommended): `npm install -g wrangler`

**Verify Fix**:

```bash
pnpm wrangler --version
# Expected: ⛅️ wrangler 3.95.0
```

---

### Issue: wrangler not authenticated

**Symptoms**:

- `pnpm wrangler whoami` shows "You are not authenticated"
- Commands fail with authentication errors

**Solutions**:

1. Login: `pnpm wrangler login`
2. Follow browser OAuth flow
3. Verify: `pnpm wrangler whoami`

**Verify Fix**:

```bash
pnpm wrangler whoami
# Expected: Shows your email and account
```

---

### Issue: D1 database not found

**Symptoms**:

- `wrangler d1` commands fail with "database not found"
- Binding errors when starting wrangler dev

**Solutions**:

1. List databases: `pnpm wrangler d1 list`
2. Verify `database_id` in `wrangler.jsonc` matches
3. If missing, create database: `pnpm wrangler d1 create website-db`
4. Update `wrangler.jsonc` with new database_id

**Verify Fix**:

```bash
pnpm wrangler d1 list
# Expected: Shows website-db database
```

---

### Issue: wrangler dev timeout or hangs

**Symptoms**:

- `pnpm preview` hangs at "Starting local server..."
- Never shows "Ready on http://127.0.0.1:8788"

**Solutions**:

1. Kill existing wrangler processes: `pkill -f wrangler`
2. Clear wrangler cache: `rm -rf .wrangler/state/`
3. Rebuild: `rm -rf .next .open-next && pnpm run build`
4. Check port availability: `lsof -i :8788` (should be empty)
5. Try different port: `wrangler dev --port 8789 --ip 127.0.0.1`

**Verify Fix**:

```bash
pnpm preview
# Expected: Server starts within 60-90 seconds
```

---

### Issue: IPv6 connection errors

**Symptoms**:

- Playwright tests fail with ECONNREFUSED
- Server logs show `::1` instead of `127.0.0.1`

**Solutions**:

1. Verify `--ip 127.0.0.1` in package.json preview script
2. Verify `127.0.0.1` (not localhost) in playwright.config.ts
3. Check hosts file: `cat /etc/hosts | grep localhost`
4. Ensure Node.js resolves correctly: `node -e "require('dns').lookup('localhost', console.log)"`

**Verify Fix**:

```bash
pnpm preview
# Expected: Logs show "127.0.0.1:8788" (not localhost or ::1)
```

---

### Issue: Migration or seed SQL errors

**Symptoms**:

- `wrangler d1 migrations apply` fails
- `wrangler d1 execute` fails with SQL syntax errors

**Solutions**:

1. Verify SQL files exist and are valid
2. Check for syntax errors in migration files
3. Ensure foreign key dependencies are ordered correctly
4. Test SQL manually: `pnpm wrangler d1 execute DB --local --command "SELECT 1"`

**Verify Fix**:

```bash
pnpm wrangler d1 migrations apply DB --local
# Expected: ✅ Migrations applied successfully
```

---

### Issue: tsx not found when testing global-setup

**Symptoms**:

- `pnpm exec tsx tests/global-setup.ts` fails
- "command not found: tsx"

**Solutions**:

1. Install dev dependencies: `pnpm install`
2. Verify tsx in package.json: `grep tsx package.json`
3. If missing, install: `pnpm add -D tsx`

**Verify Fix**:

```bash
pnpm exec tsx --version
# Expected: Prints version number
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

### Tool Verification

- [ ] Git 2.30+ installed and working
- [ ] Node.js 20+ installed and working
- [ ] pnpm 9.15+ installed and working
- [ ] wrangler 3.95+ installed (`pnpm wrangler --version`)
- [ ] tsx available for testing (`pnpm exec tsx --version`)

### Wrangler Configuration

- [ ] wrangler.jsonc exists and is valid
- [ ] D1 database binding configured (binding: "DB")
- [ ] Wrangler authenticated (`pnpm wrangler whoami` succeeds)
- [ ] nodejs_compat flag enabled in wrangler.jsonc

### D1 Database

- [ ] D1 database exists (`pnpm wrangler d1 list`)
- [ ] Migration files exist in `drizzle/migrations/`
- [ ] Seed files exist in `drizzle/seeds/`
- [ ] Migrations can be applied (`pnpm wrangler d1 migrations apply DB --local`)
- [ ] Seeds can be executed (`pnpm wrangler d1 execute DB --local --file=...`)

### Local Development

- [ ] wrangler dev starts successfully (`pnpm preview`)
- [ ] Server listens on 127.0.0.1:8788
- [ ] Application responds to HTTP requests (`curl http://127.0.0.1:8788`)
- [ ] D1 database accessible from wrangler dev
- [ ] No binding errors

### Environment Variables

- [ ] No additional env vars needed for Phase 1 local development
- [ ] .env.local created (optional, for documentation)
- [ ] CI env vars documented for Phase 3 (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

### Dependencies

- [ ] All project dependencies installed (`pnpm install`)
- [ ] wrangler in package.json
- [ ] @opennextjs/cloudflare in package.json
- [ ] tsx in devDependencies

**Environment is ready! 🚀**

---

## 🔗 Additional Resources

### Cloudflare Wrangler Docs

- [Wrangler Commands Reference](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Local Development Guide](https://developers.cloudflare.com/workers/wrangler/commands/#dev)
- [D1 Local Development](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/)
- [Authentication](https://developers.cloudflare.com/workers/wrangler/commands/#login)

### Project-Specific Docs

- [Guide Cloudflare Playwright](/docs/guide_cloudflare_playwright.md) - Comprehensive E2E testing guide
- [ADR 002](/docs/decisions/002-e2e-local-wrangler-dev.md) - Architecture decision for wrangler dev approach
- [wrangler.jsonc](/wrangler.jsonc) - Cloudflare Workers configuration

### Troubleshooting

- [Wrangler GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)
- [Cloudflare Community](https://community.cloudflare.com/)
- [D1 Status](https://www.cloudflarestatus.com/)

---

## 📞 Getting Help

### Need assistance?

1. **Check troubleshooting section above** - Common issues and solutions
2. **Review Cloudflare docs** - Official wrangler and D1 documentation
3. **Check project docs** - `/docs/guide_cloudflare_playwright.md`
4. **Ask the team** - Ping in project chat with error logs

### Reporting Issues

When reporting setup issues, include:

1. Tool versions (`wrangler --version`, `node --version`, etc.)
2. Full error message and stack trace
3. Command that failed
4. Operating system and environment (local/CI)
5. Steps to reproduce

---

**Setup complete? Proceed to [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)!**
