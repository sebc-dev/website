# Git Hooks Guide

This project uses Git hooks via Husky to enforce code quality and prevent common mistakes before committing or pushing code.

## Table of Contents

1. [Overview](#overview)
2. [Pre-commit Hook](#pre-commit-hook)
3. [Pre-push Hook](#pre-push-hook)
4. [Validation Scripts](#validation-scripts)
5. [Skipping Hooks](#skipping-hooks)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Git hooks automatically run checks when you perform Git operations like `git commit` and `git push`. This helps:

- ✅ Catch errors before they reach the repository
- ✅ Maintain code quality standards
- ✅ Ensure configuration consistency
- ✅ Prevent broken builds in CI/CD

**Tools used:**

- [Husky](https://typicode.github.io/husky/) - Git hooks manager
- [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files only

---

## Pre-commit Hook

**Location**: `.husky/pre-commit`

**Runs before**: Every `git commit`

### What it does

1. **Environment Variables Validation** - Ensures all secrets are documented in `.env.example`
2. **Package Versions Validation** - Checks that all package versions exist on npm
3. **Lint-staged** - Formats and lints only staged files
4. **TypeScript Type Check** - Validates TypeScript compiles without errors

### Workflow

```bash
git add .
git commit -m "Your message"

# Output:
# 🔍 Running pre-commit validations...
# 📝 Validating environment variables...
# ✅ All environment variables are properly documented
#
# 📦 Validating package versions...
# ✅ All packages validated successfully
#
# 🎨 Running lint-staged...
# ✅ Formatting and linting complete
#
# 🔍 Type checking...
# ✅ TypeScript compiled successfully
#
# ✅ Pre-commit checks passed!
# [branch abc123] Your message
```

### What gets checked by lint-staged

| File Type              | Actions                           |
| ---------------------- | --------------------------------- |
| `*.{js,jsx,ts,tsx}`    | ESLint auto-fix + Prettier format |
| `*.{json,md,yml,yaml}` | Prettier format                   |
| `*.{css,scss}`         | Prettier format                   |

---

## Pre-push Hook

**Location**: `.husky/pre-push`

**Runs before**: Every `git push`

### What it does

1. **Unit Tests** - Runs all unit tests to ensure nothing is broken

### Workflow

```bash
git push

# Output:
# 🧪 Running pre-push tests...
# 🔬 Running unit tests...
# ✅ All tests passed (15 tests)
#
# ✅ Pre-push checks passed!
# Enumerating objects: 5, done.
# Counting objects: 100% (5/5), done.
```

### Optional E2E Tests

E2E tests are commented out by default (too slow for every push). To enable:

1. Edit `.husky/pre-push`
2. Uncomment lines 14-20
3. Save and commit

---

## Validation Scripts

You can run validation scripts manually at any time:

### Environment Variables

```bash
pnpm validate:env
```

**Checks:**

- Variables documented in `.env.example` vs used in workflows
- Secrets used in code vs documented
- Unused variables

**Example output:**

```
🔐 Environment Variables Validator

📝 Documented in .env.example: 5 variables
   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, ...

🔒 Used in GitHub workflows: 3 secrets
   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, ...

📊 Analysis
✅ All environment variables are properly documented
```

### Package Versions

```bash
pnpm validate:packages
```

**Checks:**

- Package versions exist on npm registry
- Detects non-existent versions (e.g., `dotenv-cli@^11.0.0`)
- Warns about outdated major versions

**Example output:**

```
📦 Package Version Validator

Checking @opennextjs/cloudflare@^1.3.0...
Checking class-variance-authority@^0.7.1...
...

📊 Summary
✅ Valid packages: 54
⚠️  Outdated major versions: 2
   - next@14.x (latest: 15.x)
```

### All Validations

```bash
pnpm validate:all
```

Runs all validation checks in sequence:

1. Environment variables
2. Package versions
3. TypeScript type check

---

## Skipping Hooks

### When to skip

⚠️ **Only skip hooks when absolutely necessary**, such as:

- Emergency hotfix (still must pass CI)
- WIP commit on feature branch
- Fixing hook configuration itself

### How to skip

#### Skip pre-commit

```bash
git commit --no-verify -m "WIP: testing something"
# or
git commit -n -m "WIP: testing something"
```

#### Skip pre-push

```bash
git push --no-verify
# or
git push --no-verify origin feature-branch
```

### ⚠️ Important

**Skipping hooks locally does NOT skip CI checks!** The GitHub Actions workflows will still run all validations.

---

## Troubleshooting

### Hook not running

**Problem**: Git hook doesn't execute

**Solution**:

```bash
# Ensure hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# Reinstall Husky
pnpm install
```

### TypeScript errors on commit

**Problem**: `pnpm tsc --noEmit` fails

**Solution**:

```bash
# Run TypeScript check manually to see errors
pnpm tsc --noEmit

# Fix the type errors
# Then commit again
```

### Package validation fails

**Problem**: `validate:packages` reports invalid version

**Solution**:

```bash
# Check the error message for the problematic package
pnpm validate:packages

# Fix in package.json (e.g., dotenv-cli: "^11.0.0" → "^10.0.0")
# Run validation again
pnpm validate:packages
```

### Environment variable mismatch

**Problem**: `validate:env` reports undocumented secret

**Solution**:

```bash
# Check which secret is missing
pnpm validate:env

# Add it to .env.example with documentation
# Example:
# CLOUDFLARE_WORKER_NAME=your-worker-name
```

### Lint-staged hangs

**Problem**: lint-staged takes too long or hangs

**Solution**:

```bash
# Check what files are staged
git status

# If too many files, unstage some
git reset HEAD <file>

# Or commit in smaller batches
```

### ESLint auto-fix breaks code

**Problem**: ESLint --fix makes unwanted changes

**Solution**:

```bash
# Revert the changes
git checkout -- <file>

# Fix ESLint errors manually
pnpm lint

# Stage and commit
git add <file>
git commit
```

---

## CI/CD Integration

All validation checks also run in GitHub Actions:

**Workflow**: `.github/workflows/validation.yml`

**Runs on:**

- Pull requests to `main`, `dev`, `develop`
- Pushes to `main`, `dev`, `develop`
- Manual trigger

**Jobs:**

1. `validate-packages` - Package version validation
2. `validate-env-vars` - Environment variables consistency
3. `validate-dependency-placement` - Runtime vs dev dependencies
4. `validate-typescript` - TypeScript compilation

Even if you skip hooks locally with `--no-verify`, CI will catch issues before merge.

---

## Best Practices

### ✅ Do

- Run validations before committing: `pnpm validate:all`
- Fix errors instead of skipping hooks
- Keep commits small and focused
- Stage files incrementally to speed up lint-staged

### ❌ Don't

- Don't skip hooks habitually
- Don't commit broken TypeScript
- Don't ignore validation errors
- Don't force-push after skipping hooks

---

## Configuration Files

| File                                    | Purpose                   |
| --------------------------------------- | ------------------------- |
| `.husky/pre-commit`                     | Pre-commit hook script    |
| `.husky/pre-push`                       | Pre-push hook script      |
| `package.json` → `lint-staged`          | Lint-staged configuration |
| `package.json` → `scripts.prepare`      | Husky installation script |
| `scripts/validate-env-vars.cjs`         | Env validation script     |
| `scripts/validate-package-versions.cjs` | Package validation script |

---

## Customization

### Modify lint-staged rules

Edit `package.json`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "vitest related --run"  // Add test check
  ]
}
```

### Add more pre-commit checks

Edit `.husky/pre-commit`:

```bash
# Add custom check
echo "🔐 Checking for secrets..."
pnpm exec secretlint "**/*" || exit 1
```

### Disable specific checks

Comment out sections in `.husky/pre-commit`:

```bash
# Disable package validation
# echo "📦 Validating package versions..."
# node scripts/validate-package-versions.cjs || exit 1
```

---

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Project TypeScript Best Practices](./typescript-best-practices.md)

---

## Summary

**Pre-commit checks (fast):**

1. ✅ Environment variables consistency
2. ✅ Package versions validity
3. ✅ Lint and format staged files
4. ✅ TypeScript compilation

**Pre-push checks (slower):**

1. ✅ Unit tests

**Can skip with**: `--no-verify` (not recommended)

**CI always runs**: All checks in GitHub Actions

Following these practices ensures code quality and prevents broken builds!
