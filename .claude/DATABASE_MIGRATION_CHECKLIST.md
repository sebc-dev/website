# Cloudflare D1 Database Migration Checklist

## Purpose

This checklist ensures database migrations are safe and don't cause data loss, especially on Cloudflare D1 where certain PostgreSQL features are not supported.

## Before Creating a Migration

### Schema Changes

- [ ] **Identify all foreign key relationships**
  - List all tables that reference the table being modified
  - Check `ON DELETE CASCADE` behavior
  - Plan data preservation strategy

- [ ] **Test on local D1 instance first**

  ```bash
  wrangler d1 execute DB --local --file=drizzle/migrations/XXXX_name.sql
  ```

- [ ] **Review Cloudflare D1 limitations**
  - No support for `PRAGMA foreign_keys=ON/OFF` behavior like SQLite
  - Migrations must not rely on disabling foreign keys
  - `ON DELETE CASCADE` works but may cause unexpected data loss

### Data Preservation

- [ ] **Backup dependent tables BEFORE modifications**

  ```sql
  CREATE TABLE __tmp_table_name AS SELECT * FROM table_name;
  ```

- [ ] **Never use `DROP TABLE` on a table referenced by foreign keys without data backup**
  - Even with careful CASCADE handling, always backup first
  - Example: When restructuring articles table, backup article_translations

- [ ] **Restore data after restructuring**
  ```sql
  INSERT INTO table_name SELECT * FROM __tmp_table_name;
  DROP TABLE __tmp_table_name;
  ```

### Migration Complexity Assessment

| Risk Level  | Condition                               | Action                            |
| ----------- | --------------------------------------- | --------------------------------- |
| 🟢 Low      | Adding new columns with default values  | Direct ALTER TABLE                |
| 🟡 Medium   | Modifying column types or constraints   | Use CREATE+INSERT+DROP pattern    |
| 🔴 High     | Restructuring tables with foreign keys  | Backup all dependent tables first |
| 🔴 Critical | Dropping tables with CASCADE references | Implement full backup/restore     |

## Common Migration Patterns

### Pattern 1: Add Column (Safe)

```sql
ALTER TABLE articles ADD COLUMN new_field TEXT;
```

✅ Safe - no data loss risk

---

### Pattern 2: Modify Table with Foreign Keys (Requires Backup)

```sql
-- Step 1: Backup dependent tables
CREATE TABLE __tmp_article_translations AS SELECT * FROM article_translations;

-- Step 2: Drop dependent table to avoid CASCADE issues
DROP TABLE article_translations;

-- Step 3: Create new articles structure
CREATE TABLE __new_articles (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT,
  -- ... other columns
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action
);

-- Step 4: Copy data
INSERT INTO __new_articles SELECT ...;

-- Step 5: Replace old table
DROP TABLE articles;
ALTER TABLE __new_articles RENAME TO articles;

-- Step 6: Recreate dependent table
CREATE TABLE article_translations (
  -- ... schema
  FOREIGN KEY (article_id) REFERENCES articles(id) ON UPDATE no action ON DELETE cascade
);

-- Step 7: Restore data
INSERT INTO article_translations SELECT * FROM __tmp_article_translations;
DROP TABLE __tmp_article_translations;
```

✅ Safe - all data is preserved

---

### Pattern 3: Adding Foreign Key to Existing Table

```sql
-- Always backup first
CREATE TABLE __tmp_articles AS SELECT * FROM articles;

-- Create new table with foreign key
CREATE TABLE __new_articles (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT,
  -- ... other columns
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Copy data with NULL for new foreign key if not populated
INSERT INTO __new_articles(id, category_id, ...)
SELECT id, NULL, ...
FROM articles;

-- Replace
DROP TABLE articles;
ALTER TABLE __new_articles RENAME TO articles;
```

✅ Safe - old data preserved, new FK set to NULL

---

## Running Migrations

### Local Testing

```bash
# Test migration locally
wrangler d1 execute DB --local --file=drizzle/migrations/XXXX_name.sql

# Verify schema
wrangler d1 execute DB --local "SELECT sql FROM sqlite_master WHERE type='table';"

# Check data integrity
wrangler d1 execute DB --local "SELECT COUNT(*) FROM article_translations;"
```

### Remote Deployment

```bash
# List pending migrations
wrangler d1 migrations list DB --remote

# Apply migrations
wrangler d1 migrations apply DB --remote --skip-migrations-already-applied

# Verify post-deployment
wrangler d1 execute DB --remote "SELECT COUNT(*) FROM article_translations;"
```

## Rollback Procedure

If a migration fails and data is lost:

1. **Check available backups**

   ```bash
   # List all D1 backups
   wrangler d1 backup list DB
   ```

2. **Restore from backup (if available)**

   ```bash
   wrangler d1 restore DB <BACKUP_ID>
   ```

3. **Create corrective migration**
   - Write a migration that addresses the issue
   - Test locally first
   - Deploy with careful monitoring

## Migration Checklist Template

For each migration, use this template:

```sql
-- Migration: [DESCRIPTION]
-- Affected tables: [LIST]
-- Risk level: [LOW/MEDIUM/HIGH/CRITICAL]
-- Backup required: [YES/NO]

-- Dependencies backed up: [YES/NO]
-- Data preservation: [YES/NO]
-- Tested locally: [YES/NO]

-- Your migration SQL here
```

## Best Practices Summary

1. **Always test locally first** - Use `wrangler d1 execute DB --local`
2. **Backup before destructive operations** - Even if you think it's safe
3. **Verify data after migration** - Run row count checks
4. **Document complex migrations** - Include comments explaining the pattern used
5. **Never rely on foreign key PRAGMA behavior** - Cloudflare D1 doesn't support disabling FKs
6. **Keep migrations simple** - One logical change per migration file
7. **Use meaningful migration names** - `0002_add_category_to_articles` not `0002_fix`

## Cloudflare D1 Specific Notes

### Supported Features

- ✅ Foreign keys with ON DELETE/UPDATE actions
- ✅ Indexes (regular and unique)
- ✅ Triggers
- ✅ Views
- ✅ PRAGMA statements (limited)

### Unsupported/Limited Features

- ❌ PRAGMA foreign_keys=OFF/ON (foreign keys always on, can't disable)
- ❌ Some ATTACH DATABASE operations
- ❌ Very large migrations (>4MB)
- ⚠️ VACUUM command (not needed, space automatically managed)

### Recommendations

- Test CASCADE behavior before deploying
- Use explicit backup/restore for complex schema changes
- Keep individual migration files under 1MB
- Document any platform-specific workarounds

## Reference

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/kit-overview)
- [SQLite Foreign Keys](https://www.sqlite.org/foreignkeys.html)
