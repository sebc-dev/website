# Phase 2 - Testing Guide

Complete testing strategy for Phase 2.

---

## 🎯 Testing Strategy

Phase 2 uses a multi-layered testing approach:

1. **Unit Tests**: Individual components and utilities
2. **Integration Tests**: Provider and routing integration
3. **Manual Tests**: Visual verification in browser

**Target Coverage**: >80%
**Estimated Test Count**: 10+ tests

---

## 🧪 Unit Tests

### Purpose

Test individual components and functions in isolation.

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test app/[locale]/__tests__/layout.test.tsx

# Watch mode (during development)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Expected Results

```
✓ LocaleLayout renders with correct lang attribute
✓ LocaleLayout includes NextIntlClientProvider
✓ NotFound displays localized content
✓ NotFound link navigates to home
...
Test Suites: X passed, X total
Tests: X passed, X total
```

**Coverage Goal**: >80% for new code

### Test Files Structure

```
app/
└── [locale]/
    ├── __tests__/
    │   ├── layout.test.tsx
    │   └── not-found.test.tsx
    └── (test)/
        └── messages-test/
            └── __tests__/
                └── page.test.tsx
```

### Adding New Unit Tests

1. Create test file: `__tests__/component.test.tsx`
2. Import component and testing utilities
3. Write test cases:

```typescript
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import NotFound from '../not-found';

const messages = {
  error: {
    notFound: 'Page not found',
    notFoundDescription: 'The page does not exist.',
    backHome: 'Back home'
  }
};

describe('NotFound', () => {
  it('renders localized content', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <NotFound />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
});
```

---

## 🔗 Integration Tests

### Purpose

Test that the layout, provider, and routing work together correctly.

### Prerequisites

- [ ] `pnpm dev` server running (or use test server)
- [ ] Both message files present

### Running Integration Tests

```bash
# Run integration tests
pnpm test --testPathPattern=integration

# Or run all tests
pnpm test
```

### Integration Test Examples

```typescript
// Test Provider integration
describe('LocaleLayout Integration', () => {
  it('provides translations to child components', async () => {
    // Render layout with test component using useTranslations
    // Verify translations are accessible
  });

  it('sets correct html lang attribute', async () => {
    // Render with locale="fr"
    // Check document.documentElement.lang === "fr"
  });
});
```

### Expected Results

```
✓ Provider transmits messages to children
✓ Locale is correctly set in html
✓ Middleware redirects work
```

---

## 🌐 Manual Browser Tests

### Purpose

Verify visual appearance and user experience.

### Test URLs

After running `pnpm dev`:

| URL | Expected Result |
|-----|-----------------|
| `http://localhost:3000/fr` | French layout renders |
| `http://localhost:3000/en` | English layout renders |
| `http://localhost:3000/` | Redirects to /fr or /en |
| `http://localhost:3000/fr/messages-test` | French translations displayed |
| `http://localhost:3000/en/messages-test` | English translations displayed |
| `http://localhost:3000/fr/nonexistent` | French 404 page |
| `http://localhost:3000/en/nonexistent` | English 404 page |

### View Source Checks

1. Visit `/fr` and view page source
2. Verify `<html lang="fr">`
3. Visit `/en` and view page source
4. Verify `<html lang="en">`

### Console Checks

- [ ] No errors in browser console
- [ ] No warnings about missing translations
- [ ] No hydration mismatches

---

## 🎭 Mocking

### Mock Messages

```typescript
const mockMessages = {
  common: {
    appName: 'Test App'
  },
  error: {
    notFound: 'Not Found',
    notFoundDescription: 'Page does not exist',
    backHome: 'Go Home'
  }
};
```

### Mock Provider Wrapper

```typescript
import { NextIntlClientProvider } from 'next-intl';

const TestWrapper = ({ children, locale = 'en' }) => (
  <NextIntlClientProvider locale={locale} messages={mockMessages}>
    {children}
  </NextIntlClientProvider>
);

// Usage
render(<NotFound />, { wrapper: TestWrapper });
```

### When to Mock

- ✅ Unit tests (always mock messages)
- ✅ Integration tests (can use real messages)
- ❌ Manual tests (use real messages)

---

## 📊 Coverage Report

### Generate Coverage

```bash
pnpm test:coverage
```

### View Coverage

```bash
# Terminal report is shown automatically

# HTML report
open coverage/lcov-report/index.html
```

### Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| `app/[locale]/layout.tsx` | >80% | - |
| `app/[locale]/not-found.tsx` | >90% | - |
| Overall Phase 2 | >80% | - |

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests fail with "useTranslations" error

**Cause**: Component not wrapped in Provider

**Solution**:
```typescript
// Wrap component in Provider
render(
  <NextIntlClientProvider locale="en" messages={mockMessages}>
    <ComponentToTest />
  </NextIntlClientProvider>
);
```

#### Issue: "Cannot find module '@/src/i18n'"

**Cause**: Path alias not configured in test environment

**Solution**: Check `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './')
  }
}
```

#### Issue: Hydration mismatch warnings

**Cause**: Server/client render difference

**Solution**: Ensure locale is consistent between server and client

### Debug Commands

```bash
# Run single test in verbose mode
pnpm test --verbose not-found.test.tsx

# Run with console output
pnpm test --silent=false
```

---

## 🤖 CI/CD Automation

### GitHub Actions

Tests run automatically on:
- [ ] Pull requests
- [ ] Push to main branch

### CI Test Command

```yaml
- name: Run tests
  run: |
    pnpm test
    pnpm test:coverage
```

### Required Checks

All PRs must:
- [ ] Pass all unit tests
- [ ] Pass all integration tests
- [ ] Meet coverage threshold (>80%)
- [ ] Pass TypeScript check
- [ ] Pass linter

---

## ✅ Testing Checklist

Before merging Phase 2:

### Unit Tests
- [ ] Layout test file created
- [ ] NotFound test file created
- [ ] All tests pass
- [ ] Coverage >80%

### Integration Tests
- [ ] Provider integration tested
- [ ] Routing integration tested
- [ ] Message loading tested

### Manual Tests
- [ ] /fr renders correctly
- [ ] /en renders correctly
- [ ] 404 pages work in both locales
- [ ] Test page shows all translations
- [ ] No console errors
- [ ] html lang attribute correct

### CI Tests
- [ ] Tests run in CI
- [ ] Coverage reported
- [ ] All checks pass

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:
- Test behavior, not implementation
- Use descriptive test names
- One assertion per test (when possible)
- Test edge cases (invalid locale, missing keys)

❌ **Don't**:
- Test Next.js or next-intl internals
- Over-mock (test real integration)
- Write flaky tests
- Ignore failing tests

### Test Naming

```typescript
describe('NotFound', () => {
  it('displays localized 404 title', () => { ... });
  it('displays localized description', () => { ... });
  it('renders link to homepage', () => { ... });
  it('uses correct translation namespace', () => { ... });
});
```

---

## 🔧 Test Utilities

### Custom Render Function

```typescript
// test-utils.tsx
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
```

### Usage

```typescript
import { render, screen } from './test-utils';
import NotFound from '../not-found';

it('renders correctly', () => {
  render(<NotFound />);
  expect(screen.getByText('Page not found')).toBeInTheDocument();
});
```

---

## ❓ FAQ

**Q: How much should I test?**
A: Focus on Provider setup, locale handling, and translation loading. >80% coverage.

**Q: Should I test the middleware?**
A: Manual testing is sufficient for middleware. Focus unit tests on components.

**Q: Tests are slow, what to do?**
A: Run only affected tests during dev, full suite before commit.

**Q: Can I skip tests?**
A: No. Tests ensure i18n works correctly across the app.

**Q: How do I test locale switching?**
A: That's covered in Phase 7 (Language Selector). Phase 2 tests single locale rendering.
