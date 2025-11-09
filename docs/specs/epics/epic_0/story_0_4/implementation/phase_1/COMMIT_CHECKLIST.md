# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Install Drizzle Dependencies

**Files**: `package.json`
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Add `drizzle-orm` to dependencies section
  - Version: Use latest stable (check npm registry)
  - Command: `pnpm add drizzle-orm`
- [ ] Add `drizzle-kit` to devDependencies
  - Version: Use latest stable
  - Command: `pnpm add -D drizzle-kit`
- [ ] Add `better-sqlite3` to devDependencies
  - Required for Drizzle Studio local preview
  - Command: `pnpm add -D better-sqlite3`
- [ ] Run installation
  - Command: `pnpm install`
  - Verify: Check that `pnpm-lock.yaml` is updated
- [ ] Verify packages are installed
  - Command: `pnpm list drizzle-orm drizzle-kit better-sqlite3`
  - All three should appear in output

### Validation

```bash
# Verify installation
pnpm list drizzle-orm drizzle-kit better-sqlite3

# Check for security vulnerabilities
pnpm audit

# Ensure no peer dependency warnings
pnpm install --loglevel warn
```

**Expected Result**: All packages installed, no errors, `package.json` and `pnpm-lock.yaml` updated

### Review Checklist

#### Dependencies

- [ ] `drizzle-orm` added to `dependencies` (not devDependencies)
- [ ] `drizzle-kit` added to `devDependencies`
- [ ] `better-sqlite3` added to `devDependencies`
- [ ] Versions are specific (not `*` or `latest`)
- [ ] No security vulnerabilities reported by `pnpm audit`

#### Code Quality

- [ ] `pnpm-lock.yaml` updated and committed
- [ ] No unnecessary packages added
- [ ] Package versions are compatible with project (Next.js 15, React 19)

### Commit Message

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(db): install Drizzle ORM dependencies

- Add drizzle-orm for type-safe database queries
- Add drizzle-kit for migration generation and management
- Add better-sqlite3 for local Drizzle Studio support

These packages establish the foundation for Cloudflare D1 integration
with type-safe ORM capabilities.

Part of Phase 1 - Commit 1/5"
```

---

## 📋 Commit 2: Create D1 Database and Configure Wrangler

**Files**: `wrangler.toml`, `.env.example`, `.gitignore`
**Estimated Duration**: 45 minutes - 1 hour

### Implementation Tasks

- [ ] Create D1 database using Wrangler CLI
  - Command: `wrangler d1 create sebc-dev-db`
  - Copy the database ID from output (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
  - Copy the suggested binding configuration
- [ ] Add D1 binding to `wrangler.toml`
  - Add this section:
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "sebc-dev-db"
    database_id = "<paste-id-from-previous-step>"
    ```
  - Place after `compatibility_flags` section
  - Ensure binding name is exactly `DB` (case-sensitive)
- [ ] Update `.env.example` with D1 environment variables
  - Add:
    ```env
    # Cloudflare D1 Database (for remote operations)
    CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
    CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
    CLOUDFLARE_DATABASE_ID=<paste-database-id-here>
    ```
  - Add comments explaining each variable
- [ ] Update `.gitignore` if needed
  - Ensure `.wrangler/state/d1/` is ignored
  - Ensure `.dev.vars` is ignored (for local secrets)

### Validation

```bash
# Verify D1 database exists
wrangler d1 list

# Should show sebc-dev-db in the list

# Check wrangler.toml syntax
wrangler dev --dry-run

# Verify binding configuration
grep -A3 "d1_databases" wrangler.toml
```

**Expected Result**: D1 database created, binding configured in wrangler.toml, env vars documented

### Review Checklist

#### D1 Database

- [ ] Database created successfully (visible in `wrangler d1 list`)
- [ ] Database name is `sebc-dev-db`
- [ ] Database ID copied correctly (UUID format)

#### Wrangler Configuration

- [ ] `[[d1_databases]]` section added to wrangler.toml
- [ ] Binding name is `DB` (will be accessed as `env.DB` in code)
- [ ] `database_name` matches created database
- [ ] `database_id` matches the UUID from creation command
- [ ] TOML syntax is valid (no linter errors)

#### Environment Variables

- [ ] `.env.example` updated with all required variables
- [ ] Comments explain what each variable is for
- [ ] Placeholder values are clear (e.g., `your_account_id_here`)
- [ ] Database ID in `.env.example` matches wrangler.toml

#### Git Ignore

- [ ] `.wrangler/state/d1/` in .gitignore
- [ ] `.dev.vars` in .gitignore
- [ ] `.env.local` in .gitignore (if not already)

### Commit Message

```bash
git add wrangler.toml .env.example .gitignore
git commit -m "chore(db): create D1 database and configure Wrangler

- Create sebc-dev-db D1 database via wrangler CLI
- Add D1 binding to wrangler.toml (binding name: DB)
- Document required environment variables in .env.example
- Update .gitignore for D1 local state

Database ID: <paste-id>
This establishes the Cloudflare D1 database for local and remote use.

Part of Phase 1 - Commit 2/5"
```

---

## 📋 Commit 3: Configure Drizzle for D1

**Files**: `drizzle.config.ts` (new), `package.json` (scripts)
**Estimated Duration**: 1 hour

### Implementation Tasks

- [ ] Create `drizzle.config.ts` at project root
  - Content:

    ```typescript
    import type { Config } from 'drizzle-kit';

    export default {
      schema: './src/lib/server/db/schema.ts',
      out: './drizzle/migrations',
      dialect: 'sqlite', // D1 is SQLite-based
      driver: 'd1-http',
      dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_API_TOKEN!,
      },
    } satisfies Config;
    ```

  - Use TypeScript for type safety
  - Point schema to future location (will be created in Phase 2)

- [ ] Add npm scripts to `package.json`
  - Add to `scripts` section:
    ```json
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply DB --local",
    "db:migrate:remote": "wrangler d1 migrations apply DB --remote",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
    ```
  - Place in logical grouping with other database scripts
- [ ] Create directory structure
  - Command: `mkdir -p src/lib/server/db`
  - Command: `mkdir -p drizzle/migrations`
  - These directories will be populated in later phases
- [ ] Create placeholder `.gitkeep` files
  - `touch drizzle/migrations/.gitkeep`
  - Ensures empty directories are tracked by git

### Validation

```bash
# Verify drizzle.config.ts syntax
pnpm db:studio --help

# Should show Drizzle Studio help without errors

# Verify TypeScript compilation
pnpm type-check

# Verify directory structure
ls -la src/lib/server/db
ls -la drizzle/migrations

# Test npm scripts (help mode, won't actually run without schema)
pnpm db:generate --help
pnpm db:migrate:local --help
```

**Expected Result**: Drizzle configured, npm scripts functional, directory structure ready

### Review Checklist

#### Drizzle Configuration

- [ ] `drizzle.config.ts` created at project root
- [ ] Uses `sqlite` dialect (correct for D1)
- [ ] Driver is `d1-http` (for remote D1 access)
- [ ] Schema path points to `./src/lib/server/db/schema.ts`
- [ ] Output path for migrations is `./drizzle/migrations`
- [ ] Environment variables read from `process.env`
- [ ] Config satisfies `Config` type from drizzle-kit
- [ ] No TypeScript errors

#### NPM Scripts

- [ ] `db:generate` script added (generates migrations from schema)
- [ ] `db:migrate:local` script added (applies migrations to local D1)
- [ ] `db:migrate:remote` script added (applies migrations to remote D1)
- [ ] `db:studio` script added (launches Drizzle Studio)
- [ ] `db:push` script added (push schema directly, for dev only)
- [ ] All scripts use correct commands and flags

#### Directory Structure

- [ ] `src/lib/server/db/` directory created
- [ ] `drizzle/migrations/` directory created
- [ ] `.gitkeep` files added to empty directories

### Commit Message

```bash
git add drizzle.config.ts package.json src/lib/server/db/.gitkeep drizzle/migrations/.gitkeep
git commit -m "chore(db): configure Drizzle ORM for Cloudflare D1

- Create drizzle.config.ts with SQLite dialect and D1 driver
- Add npm scripts for migration workflow (generate, migrate, studio)
- Set up directory structure for schema and migrations
- Configure schema path: src/lib/server/db/schema.ts
- Configure output path: drizzle/migrations/

The configuration uses d1-http driver for remote D1 access and
reads credentials from environment variables.

Part of Phase 1 - Commit 3/5"
```

---

## 📋 Commit 4: Create Database Connection Utility

**Files**: `src/lib/server/db/index.ts` (new)
**Estimated Duration**: 1 hour 15 minutes

### Implementation Tasks

- [ ] Create `src/lib/server/db/index.ts`
  - Content:

    ````typescript
    import { drizzle } from 'drizzle-orm/d1';
    import type { DrizzleD1Database } from 'drizzle-orm/d1';

    /**
     * Get Drizzle database instance for Cloudflare D1.
     *
     * This function should only be called from server-side code:
     * - React Server Components
     * - Server Actions
     * - Route Handlers (route.ts)
     *
     * @param env - Cloudflare environment bindings (contains DB binding)
     * @returns Drizzle database instance configured for D1
     * @throws Error if DB binding is not available
     *
     * @example
     * ```typescript
     * // In a Server Component
     * import { getDb } from '@/lib/server/db';
     *
     * export default async function Page() {
     *   const db = getDb(process.env);
     *   const articles = await db.select().from(articlesTable);
     *   // ...
     * }
     * ```
     */
    export function getDb(env: { DB: D1Database }): DrizzleD1Database {
      if (!env.DB) {
        throw new Error(
          'DB binding is not available. ' +
            'Ensure wrangler.toml is configured correctly and ' +
            'you are running in the Cloudflare Workers runtime.',
        );
      }

      return drizzle(env.DB);
    }

    /**
     * Type alias for Drizzle D1 database instance.
     * Use this type when passing the database instance around in your application.
     *
     * @example
     * ```typescript
     * import type { Db } from '@/lib/server/db';
     *
     * async function getArticles(db: Db) {
     *   return await db.select().from(articlesTable);
     * }
     * ```
     */
    export type Db = DrizzleD1Database;
    ````

  - Add comprehensive JSDoc comments
  - Include usage examples in comments
  - Add defensive error handling

- [ ] Verify TypeScript compilation
  - Command: `pnpm type-check`
  - Should compile without errors
- [ ] Update `tsconfig.json` path aliases if needed
  - Ensure `@/lib/server/db` resolves correctly

### Validation

```bash
# TypeScript compilation
pnpm type-check

# Verify imports resolve
pnpm build --dry-run

# Check that file is in correct location
ls -la src/lib/server/db/index.ts

# Verify JSDoc syntax (no warnings)
pnpm lint
```

**Expected Result**: Connection utility created, TypeScript compiles, ready to use

### Review Checklist

#### Function Implementation

- [ ] `getDb()` function exported
- [ ] Accepts `env` parameter with `DB: D1Database` type
- [ ] Returns `DrizzleD1Database` type
- [ ] Imports from correct package (`drizzle-orm/d1`)
- [ ] Error thrown if `env.DB` is undefined or null
- [ ] Error message is clear and actionable

#### Type Safety

- [ ] Function parameter types are correct
- [ ] Return type is explicit (`DrizzleD1Database`)
- [ ] No use of `any` types
- [ ] Type alias `Db` exported for convenience
- [ ] All imports have correct types

#### Documentation

- [ ] JSDoc comment on `getDb()` function
- [ ] JSDoc includes `@param` for env parameter
- [ ] JSDoc includes `@returns` for return value
- [ ] JSDoc includes `@throws` for error case
- [ ] JSDoc includes `@example` with usage code
- [ ] Type alias `Db` has JSDoc comment
- [ ] Comments explain server-side only restriction

#### Code Quality

- [ ] File location is `src/lib/server/db/` (server-only)
- [ ] No client-side code can import this (path restriction)
- [ ] Error messages are helpful for debugging
- [ ] Code follows project style guide

### Commit Message

```bash
git add src/lib/server/db/index.ts
git commit -m "feat(db): create database connection utility

- Add getDb() function to get Drizzle instance from D1 binding
- Export Db type alias for type-safe database usage
- Add defensive error handling for missing DB binding
- Include comprehensive JSDoc with usage examples

This utility will be used by Server Components, Server Actions,
and Route Handlers to access the D1 database with type safety.

Part of Phase 1 - Commit 4/5"
```

---

## 📋 Commit 5: Add Connection Test

**Files**: `tests/integration/db-connection.test.ts` (new)
**Estimated Duration**: 1 hour

### Implementation Tasks

- [ ] Create `tests/integration/` directory if not exists
  - Command: `mkdir -p tests/integration`
- [ ] Create `tests/integration/db-connection.test.ts`
  - Content:

    ```typescript
    import { describe, it, expect } from 'vitest';
    import { getDb } from '@/lib/server/db';
    import { sql } from 'drizzle-orm';

    describe('D1 Database Connection', () => {
      it('should create database instance without errors', () => {
        // Mock env with D1 binding
        const mockEnv = {
          DB: {} as D1Database, // Miniflare provides this in test env
        };

        expect(() => getDb(mockEnv)).not.toThrow();
      });

      it('should execute simple SELECT query', async () => {
        const mockEnv = {
          DB: global.DB, // D1 binding from Miniflare
        };

        const db = getDb(mockEnv);

        // Execute simple query to verify connection
        const result = await db.run(sql`SELECT 1 as result`);

        expect(result).toBeDefined();
        expect(result.results).toBeDefined();
        expect(result.results).toHaveLength(1);
        expect(result.results[0].result).toBe(1);
      });

      it('should throw error when DB binding is missing', () => {
        const emptyEnv = {} as any;

        expect(() => getDb(emptyEnv)).toThrow('DB binding is not available');
      });

      it('should throw error with helpful message', () => {
        const emptyEnv = {} as any;

        expect(() => getDb(emptyEnv)).toThrow(/wrangler\.toml/);
        expect(() => getDb(emptyEnv)).toThrow(/Cloudflare Workers runtime/);
      });
    });
    ```

- [ ] Configure Vitest for integration tests (if not done)
  - Update `vitest.config.ts` to include integration tests
  - Configure Miniflare for D1 simulation
- [ ] Run tests to verify they pass
  - Command: `pnpm test:integration`

### Validation

```bash
# Run integration tests
pnpm test:integration

# Should show all 4 tests passing

# Run tests with coverage
pnpm test:coverage

# Coverage for db/index.ts should be 100%

# Verify test file location
ls -la tests/integration/db-connection.test.ts
```

**Expected Result**: All tests pass, connection validated, Phase 1 complete

### Review Checklist

#### Test Implementation

- [ ] Test file created in `tests/integration/`
- [ ] Uses Vitest syntax (`describe`, `it`, `expect`)
- [ ] Imports `getDb` from correct path (`@/lib/server/db`)
- [ ] Imports `sql` from `drizzle-orm` for raw queries
- [ ] All test cases are meaningful and not trivial

#### Test Coverage

- [ ] Happy path tested (connection works)
- [ ] Query execution tested (SELECT 1)
- [ ] Error path tested (missing binding)
- [ ] Error message tested (helpful messages)
- [ ] All code paths in `getDb()` covered

#### Test Configuration

- [ ] Tests run successfully with `pnpm test:integration`
- [ ] Miniflare provides D1 binding in test environment
- [ ] Tests use `global.DB` or mock D1Database appropriately
- [ ] Tests are isolated (no shared state between tests)

#### Test Quality

- [ ] Assertions are specific (not just truthy checks)
- [ ] Test names describe what they validate
- [ ] Tests would catch regression if `getDb()` breaks
- [ ] No test flakiness (tests pass consistently)

### Commit Message

```bash
git add tests/integration/db-connection.test.ts
git commit -m "test(db): add D1 connection integration tests

- Test getDb() creates instance without errors
- Test SELECT 1 query executes successfully
- Test error handling for missing DB binding
- Test error messages are helpful

Tests use Miniflare's D1 simulation for local testing.
All tests pass, validating Phase 1 objectives are met.

Part of Phase 1 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed and pushed
- [ ] All TypeScript code compiles (`pnpm type-check`)
- [ ] All tests pass (`pnpm test:integration`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation is clear and complete
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Run all validations
pnpm install
pnpm type-check
pnpm lint
pnpm test:integration
pnpm build

# Verify D1 database exists
wrangler d1 list

# Verify npm scripts work
pnpm db:generate --help
pnpm db:studio --help
```

**Phase 1 is complete when all checkboxes are checked! 🎉**

---

## 🚀 Next Steps

After Phase 1 completion:

1. [ ] Update EPIC_TRACKING.md: Set Story 0.4 Phase 1 to ✅ COMPLETED
2. [ ] Update INDEX.md: Change status to ✅ COMPLETED
3. [ ] Review with team (if applicable)
4. [ ] Prepare for Phase 2: Core Database Schema
5. [ ] Read Phase 2 documentation (when available)
