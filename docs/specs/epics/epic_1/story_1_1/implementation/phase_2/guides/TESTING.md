# Phase 2 - Testing Guide

Complete testing strategy for Phase 2 (Configuration File Creation and TypeScript Setup).

---

## 🎯 Testing Strategy

Phase 2 is a **configuration phase** - testing focuses on **validation** rather than traditional unit/integration tests:

1. **TypeScript Compilation** - Verify type safety and correct imports
2. **ESLint Validation** - Ensure code quality and style compliance
3. **Dev Server Startup** - Confirm configuration doesn't break Next.js
4. **Manual Validation** - Verify exports and IntelliSense work

**Why No Unit Tests?**
- Configuration files are static declarations
- TypeScript compilation validates types
- Dev server startup validates runtime behavior
- Message files (to be tested) don't exist yet (Story 1.2)

**Testing Approach**: Progressive validation after each commit

---

## 🧪 Validation Tests

### Test 1: TypeScript Compilation

**Purpose**: Verify all TypeScript types are correct and no compilation errors exist

**When to Run**: After every commit

**Command**:
```bash
pnpm tsc --noEmit
```

**Expected Output**:
```
# No output = success
# TypeScript compiler should complete silently
```

**What It Validates**:
- ✅ All imports are resolved correctly
- ✅ Type definitions are valid
- ✅ No type errors in configuration
- ✅ Export types are correct
- ✅ Dynamic import syntax is valid

**Failure Examples**:
```
❌ Cannot find module 'next-intl/server'
   → Fix: Verify next-intl is installed (Phase 1)

❌ Type 'string' is not assignable to type 'Locale'
   → Fix: Use explicit type annotation or const assertion

❌ Cannot find name 'getRequestConfig'
   → Fix: Check import statement
```

**Success Criteria**:
- [ ] Command exits with code 0
- [ ] No error messages printed
- [ ] All files type-check correctly

---

### Test 2: ESLint Validation

**Purpose**: Ensure code follows project style guidelines and best practices

**When to Run**: After every commit

**Command**:
```bash
# Lint specific files
pnpm lint src/i18n/

# Or lint entire project
pnpm lint
```

**Expected Output**:
```
# No output or:
✔ No ESLint errors found.
```

**What It Validates**:
- ✅ Code style matches project conventions
- ✅ No unused variables or imports
- ✅ Proper formatting (if ESLint includes Prettier)
- ✅ No console.log statements (in production code)
- ✅ Follows React/Next.js best practices

**Common ESLint Issues**:
```
❌ 'getRequestConfig' is defined but never used
   → Fix: Ensure it's exported

❌ Prefer default export
   → Fix: If project uses default exports, adjust

❌ Missing JSDoc comment
   → Fix: Add documentation
```

**Success Criteria**:
- [ ] No ESLint errors
- [ ] No ESLint warnings (or only pre-existing ones)
- [ ] Code passes style checks

---

### Test 3: Dev Server Startup

**Purpose**: Verify configuration doesn't break Next.js and server starts successfully

**When to Run**: After Commit 5 (final validation)

**Command**:
```bash
pnpm dev
```

**Expected Output**:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in Xs
```

**What It Validates**:
- ✅ Configuration is valid for Next.js
- ✅ No runtime errors on server startup
- ✅ Dynamic import syntax is accepted
- ✅ No i18n-related errors in console
- ✅ Server can compile and run

**Failure Examples**:
```
❌ Error: Cannot find module 'next-intl/server'
   → Fix: Reinstall next-intl

❌ SyntaxError in src/i18n/config.ts
   → Fix: Check syntax errors

❌ Error: Invalid configuration
   → Fix: Review getRequestConfig implementation
```

**Success Criteria**:
- [ ] Server starts without errors
- [ ] No console errors related to i18n
- [ ] No warnings about invalid configuration
- [ ] Server responds to requests (visit http://localhost:3000)

**How to Test**:
1. Start dev server: `pnpm dev`
2. Watch console output for errors
3. Open browser to http://localhost:3000
4. Check browser console for errors
5. Stop server: `Ctrl+C`

---

### Test 4: Import Validation

**Purpose**: Verify barrel exports work and imports are clean

**When to Run**: After Commit 4 (barrel exports created)

**Method**: Manual testing in IDE or test file

**Test Code**:
```typescript
// Create temporary test file: src/test-i18n.ts

import {
  type Locale,
  locales,
  defaultLocale,
  i18nConfig
} from '@/i18n';

// Test 1: Locale type
const myLocale: Locale = 'fr'; // Should work
// const invalid: Locale = 'es'; // Should show error

// Test 2: Locales array
console.log(locales); // Should be ['fr', 'en']

// Test 3: Default locale
console.log(defaultLocale); // Should be 'fr'

// Test 4: Config import
console.log(typeof i18nConfig); // Should be 'object' or 'function'
```

**Validation**:
- [ ] Imports autocomplete in IDE
- [ ] `Locale` type shows `'fr' | 'en'` on hover
- [ ] No TypeScript errors in test file
- [ ] Can access all exported values

**Clean up**:
```bash
# Delete test file after validation
rm src/test-i18n.ts
```

---

### Test 5: IntelliSense/Autocomplete

**Purpose**: Verify TypeScript IntelliSense provides helpful autocomplete

**When to Run**: After Commit 2 (types defined)

**Method**: Manual testing in IDE

**Test Scenarios**:

**Scenario 1: Locale type autocomplete**
```typescript
// Type this in any .ts file:
const locale: Locale = ''
//                     ^ Cursor here, should autocomplete 'fr' | 'en'
```

**Scenario 2: Import autocomplete**
```typescript
// Type this:
import { } from '@/i18n'
//      ^ Cursor here, should show: Locale, locales, defaultLocale, i18nConfig, etc.
```

**Scenario 3: Type hover**
```typescript
// Hover over these in IDE:
import { defaultLocale } from '@/i18n';
//       ^ Should show type: Locale (not string)
```

**Success Criteria**:
- [ ] Autocomplete shows correct locale values
- [ ] Import suggestions include all exports
- [ ] Type information is accurate
- [ ] IntelliSense works as expected

---

## 📊 Validation Checklist

Run all validations before marking Phase 2 complete:

### Per-Commit Validation

**After Commit 1**:
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] File exists at `src/i18n/config.ts`

**After Commit 2**:
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Locale types are correct (`'fr' | 'en'`)
- [ ] IntelliSense shows autocomplete

**After Commit 3**:
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Dynamic import syntax is valid
- [ ] Default export exists

**After Commit 4**:
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Barrel exports work (`import from '@/i18n'`)
- [ ] Import validation test passes

**After Commit 5**:
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Dev server starts successfully
- [ ] Documentation is complete
- [ ] No i18n-related errors

### Final Phase Validation

Run all tests together before completion:

```bash
# Full validation sequence
pnpm tsc --noEmit && \
pnpm lint && \
pnpm dev
# (Ctrl+C to stop dev server after verifying startup)
```

**Success Criteria**:
- [ ] All commands pass with no errors
- [ ] Dev server starts and runs
- [ ] Configuration is ready for Story 1.2

---

## 🐛 Debugging Validation Failures

### TypeScript Errors

**Error: Cannot find module 'next-intl/server'**

**Cause**: Package not installed or TypeScript can't resolve it

**Fix**:
```bash
# Verify installation
pnpm list next-intl

# Reinstall if needed
pnpm install

# Restart TypeScript server (VS Code)
# Command Palette: "TypeScript: Restart TS Server"
```

---

**Error: Type 'string' is not assignable to type 'Locale'**

**Cause**: Type widening - variable not explicitly typed

**Fix**:
```typescript
// ❌ Wrong (type widens to string)
export const defaultLocale = 'fr';

// ✅ Correct (explicitly typed)
export const defaultLocale: Locale = 'fr';
```

---

**Error: Property 'default' does not exist on type**

**Cause**: Dynamic import result not handled correctly

**Fix**:
```typescript
// ✅ Correct
return {
  messages: (await import(`../../messages/${locale}.json`)).default
};
```

---

### ESLint Errors

**Error: 'X' is defined but never used**

**Cause**: Variable/import not exported or used

**Fix**:
```typescript
// Ensure all types/constants are exported
export const locales = ['fr', 'en'] as const;
```

---

**Error: Missing JSDoc comment**

**Cause**: Export lacks documentation

**Fix**:
```typescript
/**
 * Default locale for the application
 */
export const defaultLocale: Locale = 'fr';
```

---

### Dev Server Errors

**Error: Module not found: Can't resolve 'next-intl/server'**

**Cause**: Package not installed or corrupted

**Fix**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

**Error: Invalid configuration in i18n/config.ts**

**Cause**: Syntax error or incorrect implementation

**Fix**:
- Check for syntax errors (missing brackets, semicolons)
- Verify `getRequestConfig` is called correctly
- Compare with implementation checklist

---

**Warning: Dynamic import may fail**

**Cause**: Message files don't exist yet (expected)

**Fix**:
- This is normal for Phase 2
- Message files created in Story 1.2
- Verify import path is correct for when files exist

---

## 🧪 Optional: Integration Preview

While message files don't exist yet, you can create **temporary test files** to preview the configuration:

### Create Test Message Files

```bash
# Create messages directory
mkdir -p messages

# Create temporary French messages
echo '{"test": "Bonjour"}' > messages/fr.json

# Create temporary English messages
echo '{"test": "Hello"}' > messages/en.json
```

### Test Configuration Load

**Note**: This requires middleware setup (Story 1.3) to fully work. For now, just verify no errors.

```bash
# Start dev server
pnpm dev

# Server should start without errors now that message files exist
```

### Clean Up

```bash
# Remove test message files
rm -rf messages/

# These will be properly created in Story 1.2
```

**Purpose**: This optional test verifies the dynamic import works when files exist. Not required for Phase 2 completion.

---

## ✅ Testing Completion Checklist

Before marking Phase 2 complete:

### Validation Commands
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm dev` starts successfully

### Configuration Validation
- [ ] All 5 commits implemented
- [ ] Files created: config.ts, types.ts, index.ts, README.md
- [ ] CLAUDE.md updated
- [ ] TypeScript types are correct
- [ ] Barrel exports work

### Manual Testing
- [ ] Imports autocomplete in IDE
- [ ] IntelliSense shows correct types
- [ ] No console errors on dev server
- [ ] Documentation is comprehensive

### Ready for Next Steps
- [ ] Configuration ready for Story 1.2 (message files)
- [ ] Ready for Phase 3 (integration validation)
- [ ] No blocking issues

---

## 📝 Testing Notes

### What We're NOT Testing

- ❌ **Message loading**: Files don't exist yet (Story 1.2)
- ❌ **Routing**: Middleware not implemented (Story 1.3)
- ❌ **URL structure**: Not configured yet (Story 1.4)
- ❌ **Component translations**: No translated components yet

### What We ARE Testing

- ✅ **Type safety**: TypeScript compilation
- ✅ **Code quality**: ESLint validation
- ✅ **Configuration validity**: Dev server startup
- ✅ **Export correctness**: Import validation
- ✅ **Developer experience**: IntelliSense/autocomplete

### Testing Philosophy

Configuration testing is about **preventing errors** rather than **proving functionality**:

1. **TypeScript** prevents type errors at compile time
2. **ESLint** prevents style/quality issues
3. **Dev server** prevents runtime configuration errors
4. **Manual validation** ensures good developer experience

---

## 📊 Test Results Template

Use this to document test results:

```markdown
## Phase 2 Test Results

**Tester**: [Name]
**Date**: [Date]
**Branch**: story_1_1

### Validation Tests

| Test | Status | Notes |
|------|--------|-------|
| TypeScript Compilation | ✅ Pass | No errors |
| ESLint Validation | ✅ Pass | No warnings |
| Dev Server Startup | ✅ Pass | Starts in Xs |
| Import Validation | ✅ Pass | All exports work |
| IntelliSense | ✅ Pass | Autocomplete works |

### Issues Found

- [List any issues, or "None"]

### Recommendations

- [Any recommendations for improvement, or "Ready for Phase 3"]

### Sign-Off

- [ ] ✅ All tests pass
- [ ] ✅ Ready for Phase 3
- [ ] ✅ Ready for Story 1.2
```

---

**Testing guide complete** - Use this to validate Phase 2 thoroughly! 🧪
