# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1: Drizzle ORM Installation & D1 Configuration.

---

## 📋 Prerequisites

### Previous Phases/Stories

- [x] Story 0.1 - Next.js 15 initialized and working
- [ ] Story 0.5 - `wrangler.toml` exists (will be modified in Commit 2)

### Tools Required

- [ ] Node.js 18+ installed
  - Check: `node --version`
  - Should output: `v18.x.x` or higher
- [ ] pnpm package manager installed
  - Check: `pnpm --version`
  - Install if needed: `npm install -g pnpm`
- [ ] Wrangler CLI installed
  - Check: `wrangler --version`
  - Should output: `3.x.x` or higher
  - Install if needed: `npm install -g wrangler`
- [ ] Git installed and configured
  - Check: `git --version`

### Cloudflare Account

- [ ] Cloudflare account created ([sign up](https://dash.cloudflare.com/sign-up))
- [ ] Wrangler authenticated
  - Command: `wrangler login`
  - Opens browser for authentication
  - Verify: `wrangler whoami`

### Local Development Environment

- [ ] Project cloned and dependencies installed
  - `cd /home/negus/dev/website`
  - `pnpm install`
- [ ] Next.js development server works
  - Test: `pnpm dev`
  - Should start without errors

---

## 📦 Dependencies Installation

Phase 1 will install these packages (handled in Commit 1):

### Runtime Dependencies

- `drizzle-orm` - ORM for type-safe database queries
  - Will be added to `dependencies` section
  - Version: Latest stable (check [npm](https://www.npmjs.com/package/drizzle-orm))

### Development Dependencies

- `drizzle-kit` - CLI tool for migration generation
  - Will be added to `devDependencies` section
  - Version: Latest stable
- `better-sqlite3` - Local SQLite support for Drizzle Studio
  - Will be added to `devDependencies` section
  - Required for `pnpm db:studio` to work locally

### Installation (Commit 1)

```bash
# These commands will be executed in Commit 1
pnpm add drizzle-orm
pnpm add -D drizzle-kit better-sqlite3

# Verify installation
pnpm list drizzle-orm drizzle-kit better-sqlite3
```

---

## 🔧 Environment Variables

### Required for Remote Operations

Create `.env.local` (or `.dev.vars` for Wrangler) with these variables:

```env
# Cloudflare Account Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# D1 Database Configuration
CLOUDFLARE_DATABASE_ID=will_be_set_in_commit_2
```

### How to Get These Values

#### 1. Cloudflare Account ID

**Option A: From Dashboard**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any website (or Workers & Pages)
3. Find Account ID in the right sidebar
4. Copy the value

**Option B: From Wrangler**

```bash
wrangler whoami
# Account ID is displayed in the output
```

#### 2. Cloudflare API Token

**Create API Token**:

1. Go to [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Or create custom token with these permissions:
   - Account > Cloudflare D1 > Edit
   - Account > Workers Scripts > Edit
5. Copy the token immediately (shown only once)
6. Store in `.env.local`

**Permissions Required**:

- `D1:edit` - To create and manage D1 databases
- `Workers:edit` - To deploy and manage Workers

#### 3. Database ID

This will be generated in Commit 2 when running `wrangler d1 create sebc-dev-db`.

The output will look like:

```
✅ Successfully created DB 'sebc-dev-db'

[[d1_databases]]
binding = "DB"
database_name = "sebc-dev-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` value and add it to `.env.local`.

---

## 🗄️ Cloudflare D1 Setup

### Create D1 Database (Commit 2)

**Command**:

```bash
wrangler d1 create sebc-dev-db
```

**Expected Output**:

```
✅ Successfully created DB 'sebc-dev-db'

[[d1_databases]]
binding = "DB"
database_name = "sebc-dev-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

Add the above to your wrangler.toml to connect to your D1 database.
```

**What This Does**:

- Creates a new D1 database named `sebc-dev-db`
- Allocates a UUID as the database ID
- Sets up both local (Miniflare) and remote (Cloudflare) instances

### Configure Wrangler Binding (Commit 2)

Add the D1 binding to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sebc-dev-db"
database_id = "<paste-id-from-create-command>"
```

**Binding Details**:

- `binding = "DB"` - How you access the database in code (`env.DB`)
- `database_name` - Human-readable name
- `database_id` - Unique identifier (UUID)

---

## 📊 Drizzle Configuration (Commit 3)

### Create drizzle.config.ts

File location: Project root
Content created in Commit 3

**Configuration Details**:

- **Dialect**: `sqlite` (D1 is SQLite-based)
- **Driver**: `d1-http` (for remote D1 access via HTTP API)
- **Schema path**: `./src/lib/server/db/schema.ts` (will be created in Phase 2)
- **Migrations path**: `./drizzle/migrations` (created in Commit 3)

### NPM Scripts

Added to `package.json` in Commit 3:

| Script              | Purpose                            | Usage                  |
| ------------------- | ---------------------------------- | ---------------------- |
| `db:generate`       | Generate migration SQL from schema | After changing schema  |
| `db:migrate:local`  | Apply migrations to local D1       | Development            |
| `db:migrate:remote` | Apply migrations to remote D1      | Production deployment  |
| `db:studio`         | Launch Drizzle Studio              | Visual schema explorer |
| `db:push`           | Push schema directly (dev only)    | Quick prototyping      |

---

## ✅ Connection Tests

### Test Wrangler D1 Access

```bash
# List all D1 databases
wrangler d1 list

# Should show sebc-dev-db

# Execute query against local D1
wrangler d1 execute DB --local --command "SELECT 1"

# Expected output: {"results":[{"1":1}],"success":true}
```

### Test Drizzle Configuration

```bash
# After Commit 3, test Drizzle Kit
pnpm db:studio --help

# Should show Drizzle Studio help

# After Commit 5, test connection via integration test
pnpm test:integration

# Should show all tests passing
```

---

## 🚨 Troubleshooting

### Issue 1: Wrangler Not Authenticated

**Symptoms**:

- `wrangler d1 create` fails with authentication error
- Error: "Not logged in"

**Solutions**:

1. Run `wrangler login`
2. Browser opens for authentication
3. Authorize Wrangler
4. Verify with `wrangler whoami`

**Verify Fix**:

```bash
wrangler whoami
# Should show your account email and ID
```

---

### Issue 2: pnpm Install Fails for better-sqlite3

**Symptoms**:

- `pnpm add -D better-sqlite3` fails
- Error about Python or build tools

**Cause**: `better-sqlite3` is a native module requiring build tools

**Solutions**:

**On macOS**:

```bash
xcode-select --install
pnpm add -D better-sqlite3
```

**On Ubuntu/Debian**:

```bash
sudo apt-get install build-essential python3
pnpm add -D better-sqlite3
```

**On Windows (WSL recommended)**:

```bash
# Use WSL2 with Ubuntu
# Then follow Ubuntu instructions above
```

**Alternative**: Skip Drizzle Studio for now

- Drizzle Studio is optional
- Main validation is the integration test (Commit 5)
- You can still use `wrangler d1 execute` for manual queries

**Verify Fix**:

```bash
pnpm list better-sqlite3
# Should show package installed
```

---

### Issue 3: D1 Local Database Not Found

**Symptoms**:

- Integration tests fail with "database not found"
- `wrangler d1 execute DB --local` fails

**Cause**: Local D1 database not initialized

**Solutions**:

1. Ensure `wrangler d1 create` was run successfully
2. Check `.wrangler/state/d1/` directory exists
3. Re-run `wrangler d1 execute DB --local --command "SELECT 1"`

**Verify Fix**:

```bash
ls -la .wrangler/state/d1/
# Should show database files

wrangler d1 execute DB --local --command "SELECT 1"
# Should return {"results":[{"1":1}],"success":true}
```

---

### Issue 4: Type Errors with D1Database

**Symptoms**:

- TypeScript errors: `Cannot find name 'D1Database'`
- Happens in `src/lib/server/db/index.ts` or tests

**Cause**: Missing Cloudflare Workers types

**Solutions**:

1. Ensure `@cloudflare/workers-types` is installed
   ```bash
   pnpm add -D @cloudflare/workers-types
   ```
2. Update `tsconfig.json` to include types:
   ```json
   {
     "compilerOptions": {
       "types": ["@cloudflare/workers-types"]
     }
   }
   ```

**Verify Fix**:

```bash
pnpm type-check
# Should compile without D1Database errors
```

---

### Issue 5: Drizzle Studio Doesn't Work with D1

**Symptoms**:

- `pnpm db:studio` launches but can't connect to database
- Error: "Unsupported driver"

**Cause**: Drizzle Studio has limited D1 support

**Solutions**:

1. **Expected behavior**: D1 support in Studio is experimental
2. **Alternative**: Use `wrangler d1 execute` for queries
3. **Workaround**: Studio can visualize schema definition, but won't connect to actual D1 database

**Not a blocker**: Drizzle Studio is optional. Main validation is the integration test.

**Verify Alternative**:

```bash
# Query D1 directly via Wrangler
wrangler d1 execute DB --local --command "SELECT * FROM sqlite_master"

# Shows schema (will be empty until Phase 2)
```

---

### Issue 6: Environment Variables Not Loaded

**Symptoms**:

- `drizzle-kit generate` fails with "Cannot read property 'CLOUDFLARE_ACCOUNT_ID' of undefined"
- Environment variables are undefined

**Cause**: `.env.local` not loaded or wrong file name

**Solutions**:

1. Ensure file is named exactly `.env.local` (or `.dev.vars` for Wrangler)
2. Check file is in project root
3. For Drizzle Kit, use `.env.local` (Next.js convention)
4. For Wrangler, use `.dev.vars` or command-line flags

**Verify Fix**:

```bash
# Check file exists
ls -la .env.local

# Test env var loading (Next.js)
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.CLOUDFLARE_ACCOUNT_ID)"
```

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 1 implementation:

### Prerequisites

- [ ] Node.js 18+ installed and verified
- [ ] pnpm installed and verified
- [ ] Wrangler CLI installed and verified
- [ ] Cloudflare account created
- [ ] Wrangler authenticated (`wrangler login`)

### Environment Files

- [ ] `.env.local` created (or `.dev.vars`)
- [ ] `CLOUDFLARE_ACCOUNT_ID` set in env file
- [ ] `CLOUDFLARE_API_TOKEN` created and set
- [ ] `.gitignore` includes `.env.local` and `.dev.vars`

### Project State

- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts Next.js successfully
- [ ] `wrangler whoami` shows correct account
- [ ] Ready to begin Commit 1

**Environment is ready! 🚀**

---

## 🔗 Reference Links

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle + Cloudflare D1 Guide](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Project Architecture](../../../../../Architecture_technique.md)
