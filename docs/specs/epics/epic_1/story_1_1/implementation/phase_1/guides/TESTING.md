# Phase 1 - Testing Guide

Complete testing strategy for Phase 1.

---

## 🎯 Testing Strategy

Phase 1 is a **package installation phase**, so traditional unit/integration tests are not applicable. Instead, testing focuses on **validation-based verification**:

1. **Installation Validation**: Package installed correctly
2. **Type Safety Validation**: TypeScript recognizes types
3. **Compatibility Validation**: Works with Next.js 15, React 19, edge runtime
4. **Server Startup Validation**: Dev server starts without errors

**No Unit Tests Required**: This phase only installs a dependency.
**No Integration Tests Required**: No code to integrate yet.
**Validation Tests Only**: Command-based verification.

---

## ✅ Validation Tests

### Purpose

Verify that next-intl package is installed correctly and compatible with the project stack.

### Running Validation Tests

```bash
# 1. Verify package installation
pnpm install
# Expected: Completes without errors

# 2. Check next-intl is in dependencies
pnpm list next-intl
# Expected: Shows next-intl@X.Y.Z

# 3. Verify TypeScript compilation
pnpm tsc --noEmit
# Expected: Exit code 0 (no errors)

# 4. Verify linter passes
pnpm lint
# Expected: No errors

# 5. Verify dev server starts
pnpm dev
# Expected: Server starts on http://localhost:3000, no console errors
# Press Ctrl+C to stop server

# 6. Verify build succeeds (optional, but recommended)
pnpm build
# Expected: Build completes successfully
```

### Expected Results

All validation commands should complete successfully:

```
✅ pnpm install - No errors
✅ pnpm list next-intl - Shows correct version
✅ pnpm tsc --noEmit - No TypeScript errors
✅ pnpm lint - No linter errors
✅ pnpm dev - Server starts successfully
✅ pnpm build - Build completes (optional)
```

---

## 🔍 Validation Checklist

### 1. Package Installation Validation

```bash
# Install all packages
pnpm install

# Verify no errors
echo $?  # Should be 0

# Check next-intl is installed
pnpm list next-intl | grep next-intl
# Expected output: next-intl@X.Y.Z
```

**Pass Criteria**:
- [ ] `pnpm install` exits with code 0
- [ ] next-intl appears in dependency tree
- [ ] No peer dependency errors
- [ ] No warnings (or warnings documented)

---

### 2. TypeScript Type Safety Validation

```bash
# Run TypeScript compiler in check mode
pnpm tsc --noEmit

# Check exit code
echo $?  # Should be 0 (no errors)

# Verify no errors in output
# Expected: Empty output (or only "✓ No errors found")
```

**Pass Criteria**:
- [ ] TypeScript compilation succeeds
- [ ] No errors related to next-intl types
- [ ] Exit code is 0

**Optional: Test Type Import**

Create a temporary test file to verify type imports:

```bash
# Create test file
cat > /tmp/test-next-intl-import.ts << 'EOF'
import {getRequestConfig} from 'next-intl/server';
import {useTranslations} from 'next-intl';

// Test types are recognized
const config = getRequestConfig;
const hook = useTranslations;

export {};
EOF

# Test compilation
pnpm tsc --noEmit /tmp/test-next-intl-import.ts

# Should compile without errors
# Clean up
rm /tmp/test-next-intl-import.ts
```

---

### 3. Linter Validation

```bash
# Run linter
pnpm lint

# Check exit code
echo $?  # Should be 0

# Expected: No errors (warnings are OK if pre-existing)
```

**Pass Criteria**:
- [ ] Linter passes
- [ ] No new errors introduced
- [ ] Exit code is 0

---

### 4. Development Server Validation

```bash
# Start development server
pnpm dev

# Wait for server to start (usually 2-5 seconds)
# Check console output:
# - Should see "Ready" message
# - Should see "Local: http://localhost:3000"
# - No errors in console
# - No warnings related to next-intl

# Press Ctrl+C to stop server
```

**Pass Criteria**:
- [ ] Server starts successfully
- [ ] Ready message appears
- [ ] No errors in console output
- [ ] No next-intl related warnings
- [ ] Can access http://localhost:3000 (optional manual check)

---

### 5. Build Validation (Optional but Recommended)

```bash
# Run production build
pnpm build

# Check exit code
echo $?  # Should be 0

# Expected: Build completes successfully
# No errors related to next-intl
```

**Pass Criteria**:
- [ ] Build completes without errors
- [ ] No next-intl build errors
- [ ] Exit code is 0
- [ ] Build output looks normal

---

## 📊 Validation Test Results Table

| Validation Test         | Command               | Expected Exit Code | Pass/Fail |
| ----------------------- | --------------------- | ------------------ | --------- |
| Package Installation    | `pnpm install`        | 0                  | -         |
| TypeScript Compilation  | `pnpm tsc --noEmit`   | 0                  | -         |
| Linter                  | `pnpm lint`           | 0                  | -         |
| Dev Server Startup      | `pnpm dev`            | Server starts      | -         |
| Build (Optional)        | `pnpm build`          | 0                  | -         |

**Fill in Pass/Fail after running each validation.**

---

## 🐛 Debugging Validation Failures

### Failure: pnpm install errors

**Symptoms**:
- Installation fails
- Peer dependency errors
- Network errors

**Debug Steps**:

1. **Check error message**:
   ```bash
   pnpm install 2>&1 | tee install-error.log
   # Review install-error.log for specific error
   ```

2. **Verify package exists**:
   ```bash
   pnpm info next-intl
   # Should show package information
   ```

3. **Check network**:
   ```bash
   pnpm ping
   # Should output: PONG
   ```

4. **Clear cache and retry**:
   ```bash
   pnpm store prune
   pnpm install
   ```

---

### Failure: TypeScript compilation errors

**Symptoms**:
- `pnpm tsc --noEmit` fails
- Type errors in output

**Debug Steps**:

1. **Check error details**:
   ```bash
   pnpm tsc --noEmit 2>&1 | head -20
   # Review first 20 lines of errors
   ```

2. **Verify next-intl types**:
   ```bash
   ls node_modules/next-intl/dist/*.d.ts
   # Should list type definition files
   ```

3. **Check TypeScript version**:
   ```bash
   pnpm list typescript
   # Ensure TypeScript version is compatible
   ```

4. **Verify tsconfig.json is valid**:
   ```bash
   cat tsconfig.json | jq .
   # Should parse without errors
   ```

---

### Failure: Dev server won't start

**Symptoms**:
- `pnpm dev` fails
- Server crashes on startup
- Port already in use

**Debug Steps**:

1. **Check error message**:
   ```bash
   pnpm dev 2>&1 | tee dev-error.log
   # Review dev-error.log
   ```

2. **Check if port 3000 is busy**:
   ```bash
   lsof -i :3000
   # If output shows a process, kill it or use different port
   ```

3. **Try different port**:
   ```bash
   PORT=3001 pnpm dev
   ```

4. **Check for pre-existing errors**:
   ```bash
   # If dev server fails, it's likely a pre-existing issue
   # Resolve non-next-intl errors first
   ```

---

## 🤖 CI/CD Validation

### Automated Validation in CI

Phase 1 validation can be automated in CI/CD:

```yaml
# .github/workflows/phase-1-validation.yml (example)
name: Phase 1 Validation

on:
  pull_request:
    paths:
      - 'package.json'
      - 'pnpm-lock.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: TypeScript Check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
```

**Note**: This is optional for Phase 1, but recommended for production projects.

---

## ✅ Validation Checklist

Before marking Phase 1 as complete:

### Installation Validation

- [ ] `pnpm install` completes successfully
- [ ] next-intl listed in package.json dependencies
- [ ] next-intl present in node_modules
- [ ] No peer dependency errors

### Type Safety Validation

- [ ] `pnpm tsc --noEmit` passes
- [ ] No TypeScript errors related to next-intl
- [ ] next-intl types recognized by TypeScript
- [ ] Type imports work correctly

### Quality Validation

- [ ] `pnpm lint` passes
- [ ] No new linter errors introduced
- [ ] Code follows project standards

### Runtime Validation

- [ ] `pnpm dev` starts successfully
- [ ] No console errors on startup
- [ ] No next-intl related warnings
- [ ] Server responds normally

### Build Validation (Optional)

- [ ] `pnpm build` completes successfully
- [ ] No build errors related to next-intl
- [ ] Build output is normal

---

## 📝 Best Practices

### Validation Workflow

✅ **Do**:
- Run all validations after each commit
- Document any warnings or errors
- Verify exit codes (should be 0)
- Check console output for issues
- Test server startup

❌ **Don't**:
- Skip validation steps
- Ignore warnings (document them)
- Proceed if validations fail
- Assume success without checking

### Debugging Approach

1. **Read error messages carefully**: They usually indicate the issue
2. **Check one thing at a time**: Isolate the problem
3. **Verify environment first**: Ensure Node.js, pnpm, etc. are correct
4. **Check for pre-existing issues**: Phase 1 doesn't introduce code
5. **Consult documentation**: next-intl docs, Next.js docs

---

## ❓ FAQ

**Q: Do I need to write unit tests for Phase 1?**
A: No. Phase 1 only installs a package. Validation tests (TypeScript, server startup) are sufficient.

**Q: What if validation tests fail?**
A: Investigate the failure. Phase 1 should not introduce errors. If tests fail, there's likely a compatibility or environment issue.

**Q: Should I run tests in watch mode?**
A: Not needed for Phase 1. Run validations once after each commit.

**Q: How often should I run validations?**
A: After each of the 4 commits in Phase 1. Final validation before marking phase complete.

**Q: Can I skip the build validation?**
A: It's optional but recommended. It verifies next-intl doesn't break the build process.

**Q: What if there are pre-existing linter errors?**
A: Document them. Phase 1 shouldn't introduce new errors. Existing errors are separate issues.

---

**Testing Guide Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Testing Type**: Validation-based (no unit/integration tests)
