# Worker Configuration Scripts

This directory contains scripts for managing Cloudflare Worker configuration and deployment.

## Scripts

### build-worker-url.sh

**Purpose**: Centralized script to construct and validate the Cloudflare Worker URL.

**Features**:

- ✅ Validates `CLOUDFLARE_WORKER_NAME` is configured
- ✅ Extracts worker name from `wrangler.jsonc`
- ✅ Performs strict validation (compares GitHub Secret vs wrangler.jsonc)
- ✅ Constructs the full Worker URL
- ✅ Provides clear error messages for troubleshooting
- ✅ Outputs in GitHub Actions format

**Usage**:

```bash
# Local development
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/build-worker-url.sh

# In GitHub Actions workflow
bash scripts/build-worker-url.sh
```

**Output**:

```
✅ Worker URL constructed: https://website.chauveau-sebastien.workers.dev
https://website.chauveau-sebastien.workers.dev
```

**Exit Codes**:

- `0` = Success
- `1` = Validation failed (see error message)

**Used By**:

- `.github/workflows/deploy.yml` - Constructs URL for health checks
- Deployment logging - Provides URL for summaries

**Related Documentation**: [Environment Variables Guide](../docs/deployment/ENVIRONMENT_VARIABLES.md)

---

### validate-worker-config.sh

**Purpose**: Local validation script for worker configuration consistency.

**Features**:

- ✅ Checks `wrangler.jsonc` exists
- ✅ Extracts worker name from configuration
- ✅ Validates name format (alphanumeric + hyphens)
- ✅ Optional: Compares with `CLOUDFLARE_WORKER_NAME` env variable
- ✅ Clear error messages and resolution steps

**Usage**:

```bash
# Basic validation (checks wrangler.jsonc only)
bash scripts/validate-worker-config.sh

# With environment variable validation
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/validate-worker-config.sh

# From .env file (if using local env file)
source .env
bash scripts/validate-worker-config.sh
```

**Output - Success**:

```
✅ Found wrangler.jsonc
✅ Worker name in wrangler.jsonc: website
✅ Worker name format is valid
✅ CLOUDFLARE_WORKER_NAME matches wrangler.jsonc

═════════════════════════════════════════════════════════════════
Worker Configuration Validation PASSED ✅
═════════════════════════════════════════════════════════════════

Ready for deployment!
```

**Output - Failure**:

```
❌ ERROR: Worker name mismatch!

CLOUDFLARE_WORKER_NAME (environment): website-staging
Worker name in wrangler.jsonc:        website

These must match...
```

**Exit Codes**:

- `0` = All validations passed
- `1` = Validation failed

**When to Run**:

- Before pushing changes
- As part of local git hooks
- During setup verification
- When troubleshooting deployment issues

**Related Documentation**: [Environment Variables Guide](../docs/deployment/ENVIRONMENT_VARIABLES.md)

---

## Validation Workflow

### For Developers

Before pushing or creating a PR:

```bash
# 1. Validate configuration
bash scripts/validate-worker-config.sh

# 2. Optionally test URL generation
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/build-worker-url.sh
```

### In CI/CD Pipeline

The deployment workflow automatically:

1. Runs `build-worker-url.sh` in the `verify-deployment` job
2. Validates strict worker name consistency
3. Constructs the Worker URL for health checks
4. Uses the URL for post-deployment verification

### For Staging/Multi-Environment Setup

```bash
# Test configuration for staging environment
export CLOUDFLARE_WORKER_NAME="website-staging"
bash scripts/validate-worker-config.sh

# Or update wrangler.jsonc temporarily to match your env
# Then run validation
bash scripts/validate-worker-config.sh
```

---

## Environment Variables

### Required for Scripts

- **`CLOUDFLARE_WORKER_NAME`** (Optional for `validate-worker-config.sh`, Required for `build-worker-url.sh`)
  - The name of the Cloudflare Worker
  - Should match the `"name"` field in `wrangler.jsonc`
  - Set via: GitHub Environment Secret or `export` command

### Optional

- **`CLOUDFLARE_ACCOUNT_SUBDOMAIN`** (Default: `chauveau-sebastien`)
  - Your Cloudflare account subdomain
  - Used in `build-worker-url.sh` to construct full URL
  - Change only if using different Cloudflare account

---

## Common Scenarios

### Scenario 1: First-time Setup

```bash
# 1. Verify configuration is valid
bash scripts/validate-worker-config.sh

# 2. Test URL generation
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/build-worker-url.sh

# 3. Setup GitHub Environment Secret
#    (Follow instructions in docs/deployment/ENVIRONMENT_VARIABLES.md)
```

### Scenario 2: Deploying to Staging

```bash
# Update wrangler.jsonc for staging
# Then validate
export CLOUDFLARE_WORKER_NAME="website-staging"
bash scripts/validate-worker-config.sh

# Or setup separate GitHub environment with different secret
```

### Scenario 3: Troubleshooting Deployment

```bash
# Check if configuration is consistent
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/validate-worker-config.sh

# Test URL construction
bash scripts/build-worker-url.sh

# Review logs for detailed error messages
```

---

## Error Handling

All scripts provide detailed error messages with actionable solutions:

### Missing CLOUDFLARE_WORKER_NAME

**Error**:

```
❌ ERROR: CLOUDFLARE_WORKER_NAME not configured
```

**Solution**:

- Set environment variable: `export CLOUDFLARE_WORKER_NAME="website"`
- Or configure GitHub Environment Secret (see deployment guide)

### Worker Name Mismatch

**Error**:

```
❌ ERROR: Worker name mismatch!
CLOUDFLARE_WORKER_NAME (GitHub Secret): website-staging
Worker name in wrangler.jsonc:          website
```

**Solutions**:

1. Update GitHub Secret to match wrangler.jsonc
2. Or update wrangler.jsonc to match GitHub Secret

### Invalid Worker Name Format

**Error**:

```
❌ ERROR: Invalid worker name format: website_staging
```

**Solution**:

- Use alphanumeric characters and hyphens only
- Valid: `website`, `website-staging`, `prod-worker`
- Invalid: `website_staging`, `website.staging`, `website@prod`

---

## Integration with Git Hooks

These scripts can be integrated into git hooks for automatic validation:

### Pre-commit Hook Example

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
bash scripts/validate-worker-config.sh || exit 1
```

### Pre-push Hook Example

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
export CLOUDFLARE_WORKER_NAME="website"
bash scripts/validate-worker-config.sh || exit 1
```

---

## Related Documentation

- [Environment Variables Guide](../docs/deployment/ENVIRONMENT_VARIABLES.md)
- [Deployment Guide](../docs/deployment/DEPLOYMENT.md)
- [GitHub Actions Workflow](.github/workflows/deploy.yml)
- [Wrangler Configuration](../wrangler.jsonc)

---

## Maintenance

### Adding New Scripts

When adding new worker configuration scripts:

1. Follow the naming convention: `*-worker-*.sh`
2. Add comprehensive comments explaining purpose
3. Include helpful error messages
4. Document in this README
5. Test with various inputs/conditions

### Updating Existing Scripts

When modifying scripts:

1. Test with valid and invalid inputs
2. Update this README if behavior changes
3. Verify GitHub Actions integration still works
4. Check error messages are clear and actionable

---

Last Updated: 2025-11-11
