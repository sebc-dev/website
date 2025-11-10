# Phase 1 - Atomic Implementation Plan

**Objective**: Install Drizzle ORM, configure connection to Cloudflare D1, and validate basic connectivity

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - Types validate at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Commit 1] → [Commit 2] → [Commit 3] → [Commit 4] → [Commit 5]
     ↓            ↓            ↓            ↓            ↓
Dependencies   Wrangler    Drizzle      Connection    Tests
  Installed    Configured   Config       Utility       Pass
```

---

## 📦 The 5 Atomic Commits

### Commit 1: Install Drizzle Dependencies

**Files**: `package.json`
**Size**: ~50 lines (dependencies section)
**Duration**: 30 min (implementation) + 15 min (review)

**Content**:

- Add `drizzle-orm` to dependencies (ORM core)
- Add `drizzle-kit` to devDependencies (CLI for migrations)
- Add `better-sqlite3` to devDependencies (local SQLite for Drizzle Studio)
- Run `pnpm install` to install packages
- Verify installation with `pnpm list drizzle-orm`

**Why it's atomic**:

- Single responsibility: Install dependencies
- No external dependencies (just package manager)
- Can be validated independently (check package.json and node_modules)

**Technical Validation**:

```bash
# Check packages installed
pnpm list drizzle-orm drizzle-kit better-sqlite3

# Verify no peer dependency conflicts
pnpm install
```

**Expected Result**: All 3 packages installed without errors, listed in package.json

**Review Criteria**:

- [ ] `drizzle-orm` added with correct version (latest stable)
- [ ] `drizzle-kit` added to devDependencies
- [ ] `better-sqlite3` added to devDependencies (required for Drizzle Studio)
- [ ] No security vulnerabilities (`pnpm audit`)
- [ ] pnpm-lock.yaml updated correctly

---

### Commit 2: Create D1 Database and Configure Wrangler

**Files**: `wrangler.toml`, `.env.example`
**Size**: ~30 lines
**Duration**: 45 min (implementation) + 20 min (review)

**Content**:

- Run `wrangler d1 create sebc-dev-db` to create D1 database
- Copy database ID from output
- Add `[[d1_databases]]` binding to `wrangler.toml`:
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "sebc-dev-db"
  database_id = "<paste-id-here>"
  ```
- Update `.env.example` with D1 environment variables for reference:
  ```env
  # Cloudflare D1 (for remote migrations)
  CLOUDFLARE_ACCOUNT_ID=your_account_id
  CLOUDFLARE_API_TOKEN=your_api_token
  CLOUDFLARE_DATABASE_ID=your_database_id
  ```
- Document the database ID in a comment for reference

**Why it's atomic**:

- Single responsibility: Configure Wrangler for D1
- Depends only on Wrangler CLI being installed (prerequisite)
- Can be validated independently (check wrangler.toml syntax)

**Technical Validation**:

```bash
# Verify D1 database exists
wrangler d1 list

# Check wrangler.toml syntax
wrangler dev --dry-run

# Verify binding name matches code expectations (DB)
grep "binding.*DB" wrangler.toml
```

**Expected Result**: D1 database created, binding configured in wrangler.toml, env vars documented

**Review Criteria**:

- [ ] Database created with correct name (`sebc-dev-db`)
- [ ] Database ID matches the one from `wrangler d1 create` output
- [ ] Binding name is `DB` (will be used in code as `env.DB`)
- [ ] `.env.example` updated with all required D1 variables
- [ ] Comments explain what each env var is for
- [ ] `.wrangler/state/d1/` added to `.gitignore` (if not already)

---

### Commit 3: Configure Drizzle for D1

**Files**: `drizzle.config.ts` (new), `package.json` (scripts)
**Size**: ~60 lines
**Duration**: 1h (implementation) + 30 min (review)

**Content**:

- Create `drizzle.config.ts` at project root:

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

- Add npm scripts to `package.json`:
  ```json
  {
    "scripts": {
      "db:generate": "drizzle-kit generate",
      "db:migrate:local": "wrangler d1 migrations apply DB --local",
      "db:migrate:remote": "wrangler d1 migrations apply DB --remote",
      "db:studio": "drizzle-kit studio",
      "db:push": "drizzle-kit push"
    }
  }
  ```
- Create placeholder directory structure:
  ```bash
  mkdir -p src/lib/server/db
  mkdir -p drizzle/migrations
  ```

**Why it's atomic**:

- Single responsibility: Configure Drizzle tooling
- Depends on Commit 1 (drizzle-kit installed) and Commit 2 (D1 created)
- Can be validated independently (run `pnpm db:studio --help`)

**Technical Validation**:

```bash
# Verify drizzle.config.ts syntax
pnpm db:studio --help

# Check that paths exist
ls -la drizzle/migrations
ls -la src/lib/server/db

# Verify npm scripts work
pnpm run db:generate --help
```

**Expected Result**: Drizzle config created, npm scripts functional, directory structure ready

**Review Criteria**:

- [ ] `drizzle.config.ts` uses correct dialect (`sqlite`)
- [ ] Schema path points to future schema file (`./src/lib/server/db/schema.ts`)
- [ ] Output directory for migrations is `./drizzle/migrations`
- [ ] All npm scripts are correctly named and functional
- [ ] Environment variables are read from `process.env`
- [ ] TypeScript satisfies `Config` type (no type errors)

---

### Commit 4: Create Database Connection Utility

**Files**: `src/lib/server/db/index.ts` (new)
**Size**: ~80 lines
**Duration**: 1h 15min (implementation) + 45 min (review)

**Content**:

- Create `src/lib/server/db/index.ts`:

  ```typescript
  import { drizzle } from 'drizzle-orm/d1';
  import type { DrizzleD1Database } from 'drizzle-orm/d1';

  /**
   * Get Drizzle database instance for Cloudflare D1.
   * This function should only be called from server-side code (Server Components, Server Actions, Route Handlers).
   *
   * @param env - Cloudflare environment bindings (contains DB binding)
   * @returns Drizzle database instance
   * @throws Error if DB binding is not available
   */
  export function getDb(env: { DB: D1Database }): DrizzleD1Database {
    if (!env.DB) {
      throw new Error(
        'DB binding is not available. Ensure wrangler.toml is configured correctly and you are using the Cloudflare Workers runtime.',
      );
    }

    return drizzle(env.DB);
  }

  /**
   * Type alias for Drizzle D1 database instance.
   * Use this type when passing the database instance around.
   */
  export type Db = DrizzleD1Database;
  ```

- Add JSDoc documentation explaining usage
- Add error handling for missing DB binding
- Export type alias for convenience

**Why it's atomic**:

- Single responsibility: Create connection utility
- Depends on Commit 1 (drizzle-orm installed) and Commit 2 (DB binding configured)
- Can be validated independently (TypeScript compilation)
- No schema required yet (schema will be added in Phase 2)

**Technical Validation**:

```bash
# TypeScript check
pnpm type-check

# Verify imports work
pnpm build
```

**Expected Result**: Connection utility created, TypeScript compiles, ready for use in Phase 2

**Review Criteria**:

- [ ] Function `getDb()` accepts env parameter with DB binding
- [ ] Returns correctly typed DrizzleD1Database
- [ ] Error thrown if DB binding missing (defensive programming)
- [ ] JSDoc comments explain usage and parameters
- [ ] Type alias `Db` exported for convenience
- [ ] File is in `src/lib/server/db/` (server-only code)
- [ ] No client-side imports (this is server-only)

---

### Commit 5: Add Connection Test

**Files**: `tests/integration/db-connection.test.ts` (new)
**Size**: ~100 lines
**Duration**: 1h (implementation) + 45 min (review)

**Content**:

- Create `tests/integration/db-connection.test.ts`:

  ```typescript
  import { describe, it, expect, beforeAll } from 'vitest';
  import { getDb } from '@/lib/server/db';

  describe('D1 Database Connection', () => {
    let env: { DB: D1Database };

    beforeAll(async () => {
      // Get D1 binding from Cloudflare Workers runtime
      // In tests, this will use Miniflare's local D1 simulation
      env = { DB: globalThis.DB };
    });

    it('should connect to D1 database', () => {
      expect(() => getDb(env)).not.toThrow();
    });

    it('should execute simple SELECT query', async () => {
      const db = getDb(env);
      const result = await db.run(sql`SELECT 1 as result`);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(1);
      expect(result.results[0].result).toBe(1);
    });

    it('should throw error if DB binding is missing', () => {
      expect(() => getDb({} as any)).toThrow('DB binding is not available');
    });
  });
  ```

- Configure Vitest to use Miniflare for D1 simulation
- Add test setup to load D1 binding into global scope
- Test basic connectivity with `SELECT 1`
- Test error handling when binding is missing

**Why it's atomic**:

- Single responsibility: Validate connection works
- Depends on all previous commits (needs everything set up)
- Can be validated independently (run tests)
- Completes Phase 1 objectives

**Technical Validation**:

```bash
# Run integration tests
pnpm test:integration

# Check test coverage
pnpm test:coverage
```

**Expected Result**: All tests pass, connection validated, Phase 1 complete

**Review Criteria**:

- [ ] Test imports `getDb` from correct path
- [ ] Test uses Vitest syntax (describe, it, expect)
- [ ] Tests cover happy path (SELECT 1 query works)
- [ ] Tests cover error path (missing binding throws error)
- [ ] Tests use D1 binding from Miniflare (local simulation)
- [ ] Test assertions are meaningful (check result structure)
- [ ] Tests run successfully in CI/CD environment

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand PHASES_PLAN.md for Phase 1
2. **Setup environment**: Ensure Wrangler CLI installed
3. **Implement Commit 1**: Install dependencies
4. **Validate Commit 1**: Check packages installed
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message format
7. **Repeat for commits 2-5**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Type-check (commits 3-5)
pnpm type-check

# Lint
pnpm lint

# Test (commit 5 only, earlier commits have no tests yet)
pnpm test:integration

# Build (optional, to verify no breaking changes)
pnpm build
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit                            | Files | Lines    | Implementation | Review       | Total        |
| --------------------------------- | ----- | -------- | -------------- | ------------ | ------------ |
| 1. Install Dependencies           | 1     | ~50      | 30 min         | 15 min       | 45 min       |
| 2. Create D1 & Configure Wrangler | 2     | ~30      | 45 min         | 20 min       | 1h 5min      |
| 3. Configure Drizzle              | 2     | ~60      | 1h             | 30 min       | 1h 30min     |
| 4. Create Connection Utility      | 1     | ~80      | 1h 15min       | 45 min       | 2h           |
| 5. Add Connection Test            | 1     | ~100     | 1h             | 45 min       | 1h 45min     |
| **TOTAL**                         | **7** | **~320** | **4h 30min**   | **2h 55min** | **7h 25min** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time (install, configure, test)
- 🧪 **Testable**: Each commit validated before moving on
- 📝 **Documented**: Clear commit messages explain what and why

### For Reviewers

- ⚡ **Fast review**: 15-45 min per commit (2.5-3h total)
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot issues in small diffs

### For the Project

- 🔄 **Rollback-safe**: Can revert any commit without breaking others
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand what changed when

---

## 📝 Best Practices

### Commit Messages

Format:

```
type(scope): short description (max 50 chars)

- Point 1: what was added/changed
- Point 2: why this change was made
- Point 3: any important notes

Part of Phase 1 - Commit X/5
```

Types: `feat`, `chore`, `test`, `docs`

Examples:

```
chore(db): install Drizzle ORM dependencies

- Add drizzle-orm for type-safe database queries
- Add drizzle-kit for migration management
- Add better-sqlite3 for local Drizzle Studio

Part of Phase 1 - Commit 1/5
```

### Review Checklist

Before committing:

- [ ] Code follows project style guide
- [ ] TypeScript compiles without errors
- [ ] All validation commands pass
- [ ] No console.logs or debug code
- [ ] Documentation/comments added where needed
- [ ] Commit message follows format

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (1 → 2 → 3 → 4 → 5)
- ✅ Validate after each commit (run commands listed above)
- ✅ Write tests alongside code (Commit 5)
- ✅ Use provided commit messages as template
- ✅ Test D1 connection thoroughly before moving to Phase 2

### Don'ts

- ❌ Skip commits or combine them (loses atomic benefits)
- ❌ Commit without running validations
- ❌ Create schema in this phase (that's Phase 2)
- ❌ Skip the connection test (critical validation)
- ❌ Use production D1 for testing (use local with Miniflare)

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Split it into smaller commits. For example, if Commit 3 feels too large, split into "Create drizzle.config.ts" and "Add npm scripts" separately.

**Q: What if I need to fix a previous commit?**
A: If not pushed yet, use `git commit --fixup <commit-hash>` then `git rebase -i --autosquash`. If already pushed, create a new commit with the fix.

**Q: Can I change the commit order?**
A: No. The order is based on dependencies. Commit 4 needs Commits 1-3 to work.

**Q: What if the connection test fails?**
A: Don't proceed to Phase 2. Debug the issue using ENVIRONMENT_SETUP.md troubleshooting section. The connection must work before defining schemas.

**Q: Do I need to configure remote D1 in this phase?**
A: No. Local D1 (Miniflare) is sufficient for Phase 1. Remote D1 will be needed for deployment in Story 0.7 (CI/CD).

**Q: What if Drizzle Studio doesn't work?**
A: Drizzle Studio support for D1 is limited. It's optional for this phase. Main validation is the connection test (Commit 5).
