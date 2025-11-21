# Phase 1 - Testing Guide

Complete testing strategy for Phase 1.

---

## 🎯 Testing Strategy

Phase 1 focuses on **structural changes** to the i18n setup. Testing priorities:

1. **TypeScript Compilation**: Ensure all types resolve correctly
2. **Existing Tests**: Verify no regressions
3. **Unit Tests**: Validate new routing and request config (if desired)

**Target Coverage**: Maintain existing coverage (no regression)
**New Test Files**: Optional for this phase

---

## 🧪 Type Checking as Tests

### Primary Validation

For Phase 1, TypeScript compilation is the primary test:

```bash
# Full type check
pnpm tsc --noEmit
```

**Expected Result**: No errors

### What TypeScript Validates

- ✅ `defineRouting` receives correct configuration
- ✅ `createNavigation` exports match expected types
- ✅ `getRequestConfig` returns correct shape
- ✅ All imports resolve correctly
- ✅ `Locale` type properly inferred

---

## 🧪 Running Existing Tests

### Run All Tests

```bash
pnpm test
```

**Expected Result**: All existing tests pass

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Specific Test File

```bash
pnpm test messages.test.ts
```

**Note**: The message parity tests should still pass since we're not modifying messages.

---

## 🧪 Optional Unit Tests

If you want to add unit tests for the new i18n structure:

### Test File Location

```
src/i18n/__tests__/
├── routing.test.ts
└── request.test.ts
```

### Example: routing.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { routing } from '../routing';

describe('i18n routing', () => {
  it('should have correct locales', () => {
    expect(routing.locales).toEqual(['fr', 'en']);
  });

  it('should have fr as default locale', () => {
    expect(routing.defaultLocale).toBe('fr');
  });

  it('should always use locale prefix', () => {
    expect(routing.localePrefix).toBe('always');
  });
});
```

### Example: index.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, Locale } from '../index';

describe('i18n exports', () => {
  it('should export locales array', () => {
    expect(locales).toEqual(['fr', 'en']);
  });

  it('should export defaultLocale', () => {
    expect(defaultLocale).toBe('fr');
  });

  it('should have correct Locale type', () => {
    const testLocale: Locale = 'fr';
    expect(['fr', 'en']).toContain(testLocale);
  });
});
```

---

## 🔗 Integration Testing

### Manual Integration Tests

Phase 1 doesn't require automated integration tests, but verify manually:

1. **Middleware works**:
   - Start dev server
   - Visit `/` - should redirect to `/fr/`
   - Visit `/en/` - should work
   - Visit `/invalid/` - should redirect to default

2. **Imports resolve**:
   - All files compile
   - No runtime import errors

---

## 📊 Coverage Report

### Generate Coverage

```bash
pnpm test:coverage
```

### Coverage Goals

| Area      | Target        | Notes            |
| --------- | ------------- | ---------------- |
| src/i18n/ | >80%          | If tests added   |
| Overall   | No regression | Maintain current |

**Note**: Phase 1 is primarily structural. Coverage targets apply if you add unit tests.

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Import errors in tests

**Symptoms**:

- `Cannot find module '@/src/i18n'`

**Solutions**:

1. Check `vitest.config.ts` has correct path aliases
2. Ensure `tsconfig.json` paths match

#### Issue: Type errors in tests

**Symptoms**:

- Type mismatches for `Locale`

**Solutions**:

1. Import types from new location
2. Update test imports to `@/src/i18n`

### Debug Commands

```bash
# Run single test with verbose output
pnpm test routing.test.ts --reporter=verbose

# Run with debugging
pnpm test --inspect-brk
```

---

## ✅ Testing Checklist

Before marking Phase 1 complete:

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (all existing tests)
- [ ] No import errors at runtime
- [ ] Optional: Unit tests for routing/request added
- [ ] `pnpm build` succeeds

---

## 📝 Best Practices

### For Phase 1

✅ **Do**:

- Run full test suite after each commit
- Verify TypeScript compilation
- Check existing tests pass

❌ **Don't**:

- Skip type checking
- Assume imports work without testing
- Modify existing tests unless necessary

### Test Naming

```typescript
describe('routing', () => {
  it('should have correct default locale', () => {
    // ...
  });
});
```

---

## ❓ FAQ

**Q: Do I need to write new tests for Phase 1?**
A: Optional. TypeScript compilation validates most of the structure. Unit tests are nice-to-have.

**Q: Should I update existing tests?**
A: Only if they import from old `@/i18n` path. Update imports to `@/src/i18n`.

**Q: What about E2E tests?**
A: E2E tests are in Phase 5. For Phase 1, existing tests are sufficient.

**Q: Tests fail after commit 4, what to do?**
A: Check that all imports were updated. Search for any remaining `@/i18n` imports.

---

## 🔗 Related Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [TESTING.md Guide](./TESTING.md)
