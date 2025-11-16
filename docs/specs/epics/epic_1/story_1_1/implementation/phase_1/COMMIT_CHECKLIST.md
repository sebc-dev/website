# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Research and verify next-intl compatibility

**Files**: None (documentation commit)
**Estimated Duration**: 15-20 minutes

### Implementation Tasks

- [ ] Visit next-intl documentation: https://next-intl-docs.vercel.app/
- [ ] Check next-intl GitHub releases for latest stable version
- [ ] Review next-intl changelog for Next.js 15 compatibility notes
- [ ] Verify React 19 compatibility (check package.json peer dependencies)
- [ ] Confirm edge runtime support (Cloudflare Workers compatibility)
- [ ] Document findings in commit message template below

### Research Checklist

#### Version Information

- [ ] Identified latest stable version number (not beta/RC)
- [ ] Verified version has no known critical bugs
- [ ] Checked release date (prefer recent stable releases)

#### Compatibility Verification

- [ ] Next.js 15 compatibility confirmed
- [ ] React 19 compatibility confirmed
- [ ] Edge runtime support confirmed
- [ ] TypeScript support confirmed (built-in types)

#### Documentation Review

- [ ] Read "Getting Started" guide for Next.js App Router
- [ ] Reviewed installation instructions
- [ ] Noted any special configuration requirements for Phase 2

### Validation

No technical validation needed for this commit - validation is through commit message completeness.

**Expected Result**: Comprehensive commit message with all research findings documented.

### Review Checklist

#### Commit Message Quality

- [ ] Specific version number included (e.g., "next-intl@3.19.0")
- [ ] Next.js 15 compatibility explicitly stated
- [ ] React 19 compatibility explicitly stated
- [ ] Edge runtime support mentioned
- [ ] Link to documentation/changelog included

#### Accuracy

- [ ] Version number is current and stable
- [ ] Compatibility claims are verified (not assumed)
- [ ] Sources cited (documentation links)

### Commit Message

```bash
git commit --allow-empty -m "chore(i18n): research next-intl compatibility with Next.js 15

- Latest stable version: next-intl@X.Y.Z
- Next.js 15 compatibility: Confirmed (source: https://...)
- React 19 compatibility: Confirmed
- Edge runtime support: Yes (supports Cloudflare Workers)
- TypeScript: Built-in type definitions
- Documentation: https://next-intl-docs.vercel.app/docs/getting-started/app-router

Researched for Story 1.1 Phase 1 to ensure compatibility before installation.

Part of Phase 1 - Commit 1/4"
```

**Note**: `--allow-empty` flag allows commit without file changes (documentation commit).

---

## 📋 Commit 2: Install next-intl package

**Files**: `package.json`, `pnpm-lock.yaml`
**Estimated Duration**: 10-15 minutes

### Implementation Tasks

- [ ] Run `pnpm add next-intl` in project root
- [ ] Wait for installation to complete
- [ ] Check terminal output for warnings or errors
- [ ] Verify package added to `dependencies` section
- [ ] Confirm version matches researched version from Commit 1
- [ ] Check pnpm-lock.yaml was updated

### Validation

```bash
# Verify installation succeeded
pnpm install

# Confirm next-intl is in dependencies
grep "next-intl" package.json

# Check installed version
pnpm list next-intl

# Verify no peer dependency errors
echo "Check terminal output - should show no errors"
```

**Expected Result**:

- next-intl appears in dependencies
- pnpm-lock.yaml updated
- No peer dependency errors
- Installation completes successfully

### Review Checklist

#### package.json

- [ ] `next-intl` added to `dependencies` (not `devDependencies`)
- [ ] Version is the stable version from Commit 1 (or compatible range)
- [ ] No unexpected packages added
- [ ] File is valid JSON (proper formatting)

#### pnpm-lock.yaml

- [ ] File was modified (git diff shows changes)
- [ ] next-intl and its dependencies listed
- [ ] Lockfile integrity maintained

#### Installation Process

- [ ] No errors during `pnpm add`
- [ ] No peer dependency warnings or errors
- [ ] Terminal output clean

### Commit Message

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(i18n): install next-intl package

- Installed next-intl@X.Y.Z (latest stable)
- Added to dependencies (not devDependencies)
- No peer dependency warnings
- pnpm lockfile updated successfully

Installation verified with 'pnpm install' - no errors.

Part of Phase 1 - Commit 2/4"
```

---

## 📋 Commit 3: Verify TypeScript types and compilation

**Files**: None (validation commit, may create temporary test file)
**Estimated Duration**: 15-20 minutes

### Implementation Tasks

- [ ] Run `pnpm tsc --noEmit` to check TypeScript compilation
- [ ] Verify no errors related to next-intl
- [ ] (Optional) Create temporary test file to verify import
- [ ] Test import from `next-intl/server`
- [ ] Test import from `next-intl` (if needed)
- [ ] Delete temporary test file if created (or keep with justification)

### Optional: Create Test File

If you want to explicitly test the import (recommended for documentation):

```bash
# Create temporary test file
cat > src/test-next-intl-types.ts << 'EOF'
// Temporary file to verify next-intl TypeScript types
import {getRequestConfig} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// If TypeScript compiles this without errors, types are working
const testConfig = getRequestConfig;
const testHook = useTranslations;

export {}; // Make it a module
EOF

# Run TypeScript check on test file
pnpm tsc --noEmit src/test-next-intl-types.ts

# If successful, delete test file
rm src/test-next-intl-types.ts
```

### Validation

```bash
# Primary validation: TypeScript compilation
pnpm tsc --noEmit

# Check for any TypeScript errors
echo $?  # Should be 0 (success)

# Verify next-intl types are recognized
# (The above tsc command will fail if types are not found)
```

**Expected Result**:

- TypeScript compilation passes
- No errors related to missing types
- Import statements work correctly

### Review Checklist

#### TypeScript Compilation

- [ ] `pnpm tsc --noEmit` passes successfully
- [ ] No TypeScript errors in console output
- [ ] No warnings about missing type definitions

#### Type Definitions

- [ ] next-intl types are recognized by TypeScript
- [ ] Import from `next-intl/server` works
- [ ] Import from `next-intl` works (for client components)

#### Test File (if created)

- [ ] Test file successfully compiled (if created)
- [ ] Test file deleted if temporary
- [ ] Commit message documents test approach

### Commit Message

**Option A: Without test file**

```bash
git commit --allow-empty -m "test(i18n): verify next-intl TypeScript types

- TypeScript compilation: Pass (pnpm tsc --noEmit)
- next-intl types recognized by TypeScript
- Import from 'next-intl/server' validated
- Import from 'next-intl' validated
- No type definition errors or warnings

Types are built-in with next-intl package (no @types needed).

Part of Phase 1 - Commit 3/4"
```

**Option B: With test file (then deleted)**

```bash
git commit --allow-empty -m "test(i18n): verify next-intl TypeScript types

- Created temporary test file: src/test-next-intl-types.ts
- TypeScript compilation: Pass (pnpm tsc --noEmit)
- Validated imports: 'next-intl/server', 'next-intl'
- Test file deleted after successful validation
- No type definition errors or warnings

Types are built-in with next-intl package (no @types needed).

Part of Phase 1 - Commit 3/4"
```

---

## 📋 Commit 4: Document installation and validate edge compatibility

**Files**: May update `CLAUDE.md` or add documentation comments
**Estimated Duration**: 15-20 minutes

### Implementation Tasks

- [ ] Verify Next.js dev server starts with next-intl installed
- [ ] Check console for any warnings/errors on startup
- [ ] Confirm edge runtime compatibility (next-intl works with Cloudflare)
- [ ] (Optional) Add comment in package.json documenting next-intl
- [ ] (Optional) Update CLAUDE.md with installation notes
- [ ] Document Phase 1 completion

### Validation

```bash
# Start Next.js dev server
pnpm dev

# Check console output for:
# - No errors related to next-intl
# - Server starts successfully
# - No warnings about edge compatibility

# Press Ctrl+C to stop server after verification

# Validate package.json is still valid JSON
cat package.json | jq . > /dev/null && echo "✅ Valid JSON"
```

**Expected Result**:

- Dev server starts without errors
- No next-intl warnings in console
- Edge compatibility confirmed
- Documentation updated (if needed)

### Review Checklist

#### Server Startup

- [ ] `pnpm dev` starts successfully
- [ ] No errors in console output
- [ ] No warnings related to next-intl
- [ ] Server responds on localhost:3000

#### Edge Runtime Compatibility

- [ ] Confirmed next-intl supports edge runtime
- [ ] Documented Cloudflare Workers compatibility
- [ ] No runtime warnings about unsupported APIs

#### Documentation

- [ ] Installation documented (commit message or CLAUDE.md)
- [ ] Edge compatibility noted
- [ ] Phase 1 completion clearly stated

#### Optional: CLAUDE.md Update

If updating CLAUDE.md (recommended for team knowledge):

- [ ] Added section or note about next-intl installation
- [ ] Documented version installed
- [ ] Noted edge runtime compatibility
- [ ] Kept updates concise (1-2 sentences max)

### Commit Message

**Option A: No documentation file changes**

```bash
git commit --allow-empty -m "docs(i18n): validate next-intl edge compatibility

- Next.js dev server: Starts successfully
- Console output: No errors or warnings
- Edge runtime compatibility: Confirmed (next-intl supports Cloudflare Workers)
- Cloudflare Workers: Compatible (no Node.js-specific APIs used)

Phase 1 complete: next-intl@X.Y.Z installed and validated.
Ready for Phase 2 (configuration).

Part of Phase 1 - Commit 4/4"
```

**Option B: With CLAUDE.md update**

```bash
git add CLAUDE.md
git commit -m "docs(i18n): document next-intl installation and edge compatibility

- Updated CLAUDE.md with next-intl installation notes
- Next.js dev server: Starts successfully
- Console output: No errors or warnings
- Edge runtime compatibility: Confirmed (supports Cloudflare Workers)

Phase 1 complete: next-intl@X.Y.Z installed and validated.
Ready for Phase 2 (configuration).

Part of Phase 1 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all 4 commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] Commit messages follow template format
- [ ] Each commit validated before committing
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Next.js dev server starts successfully
- [ ] No console errors or warnings
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Verify all packages installed
pnpm install

# Check TypeScript
pnpm tsc --noEmit

# Run linter
pnpm lint

# Start dev server (check for errors)
pnpm dev
# Press Ctrl+C to stop

# Review git log
git log --oneline -4
```

**Expected git log**:

```
abcd123 docs(i18n): validate next-intl edge compatibility
def4567 test(i18n): verify next-intl TypeScript types
ghi8901 chore(i18n): install next-intl package
jkl2345 chore(i18n): research next-intl compatibility with Next.js 15
```

**Phase 1 is complete when all checkboxes are checked! 🎉**

---

## 📝 Additional Notes

### If Issues Arise

**Issue: Peer dependency warning**

- Document in commit message
- Check if it's a warning (can proceed) or error (must resolve)
- Investigate compatibility if error

**Issue: TypeScript errors**

- Verify next-intl version is correct
- Check TypeScript version compatibility
- Review next-intl documentation for type setup

**Issue: Dev server won't start**

- Check error message carefully
- Likely unrelated to next-intl (pre-existing issue)
- Resolve before completing Phase 1

### Best Practices

- **Commit early, commit often**: Don't wait to commit all 4 at once
- **Validate before committing**: Run checks after each commit
- **Clear commit messages**: Follow templates, document specifics
- **Ask for help**: If stuck, consult documentation or team

---

**Checklist Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Ready for Use**: ✅ Yes
