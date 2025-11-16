# Phase 1 - Testing Guide

Complete testing strategy for Phase 1: Message File Creation and French Translations.

---

## 🎯 Testing Strategy

Phase 1 uses a focused testing approach:

1. **Manual Validation**: Verify JSON files are well-formed
2. **Unit Tests**: Test message file loading and structure
3. **Integration Tests**: Verify i18n configuration works with messages

**Target Coverage**: >80%
**Test Framework**: Vitest
**Estimated Test Count**: 8-10 tests

---

## 🧪 Manual Validation Tests

### Before Writing Unit Tests

Run these manual checks:

#### Test 1: JSON Syntax Validation

```bash
# Test fr.json can be parsed
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "✓ fr.json is valid"

# Test en.json can be parsed
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))" && echo "✓ en.json is valid"
```

**Expected Result**: Both commands succeed with "✓" messages

#### Test 2: File Encoding Check

```bash
# Verify files are UTF-8
file -i messages/fr.json
file -i messages/en.json
# Should show: charset=utf-8
```

**Expected Result**: Both show UTF-8 encoding

#### Test 3: Content Inspection

```bash
# Show first 30 lines of French translations
head -30 messages/fr.json

# Should show namespace structure with French values
```

**Expected Result**: Properly formatted JSON with French text

---

## 🧪 Unit Tests

### Test File Structure

Create `/tests/messages.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Message Files', () => {
  // Test implementation goes here
});
```

### Test 1: JSON Parsing - French File

**Purpose**: Verify `messages/fr.json` can be loaded and parsed

```typescript
it('should load and parse messages/fr.json without errors', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const frenchContent = fs.readFileSync(frenchPath, 'utf8');

  // Should not throw
  const parsed = JSON.parse(frenchContent);

  expect(parsed).toBeDefined();
  expect(typeof parsed).toBe('object');
});
```

**Validation Command**: `pnpm test messages -- --reporter=verbose`

**Expected Result**: ✓ Test passes

### Test 2: JSON Parsing - English File

**Purpose**: Verify `messages/en.json` can be loaded and parsed

```typescript
it('should load and parse messages/en.json without errors', () => {
  const englishPath = path.join(process.cwd(), 'messages', 'en.json');
  const englishContent = fs.readFileSync(englishPath, 'utf8');

  // Should not throw
  const parsed = JSON.parse(englishContent);

  expect(parsed).toBeDefined();
  expect(typeof parsed).toBe('object');
});
```

**Expected Result**: ✓ Test passes

### Test 3: File Encoding

**Purpose**: Verify files are properly encoded as UTF-8

```typescript
it('should be encoded in UTF-8 (support French accents)', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const frenchContent = fs.readFileSync(frenchPath, 'utf8');

  // Check that accents are preserved
  expect(frenchContent).toContain('é');
  // Add more accent checks as appropriate
});
```

**Expected Result**: ✓ Test passes with accents present

### Test 4: Namespace Structure - French

**Purpose**: Verify all required namespaces exist

```typescript
it('should have all required namespaces in French', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const messages = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  const requiredNamespaces = [
    'common',
    'nav',
    'footer',
    'form',
    'article',
    'complexity',
    'search',
    'error',
  ];

  requiredNamespaces.forEach((ns) => {
    expect(messages).toHaveProperty(ns);
    expect(typeof messages[ns]).toBe('object');
  });
});
```

**Expected Result**: ✓ All namespaces present

### Test 5: Namespace Structure - English

**Purpose**: Verify all required namespaces exist in English file

```typescript
it('should have all required namespaces in English', () => {
  const englishPath = path.join(process.cwd(), 'messages', 'en.json');
  const messages = JSON.parse(fs.readFileSync(englishPath, 'utf8'));

  const requiredNamespaces = [
    'common',
    'nav',
    'footer',
    'form',
    'article',
    'complexity',
    'search',
    'error',
  ];

  requiredNamespaces.forEach((ns) => {
    expect(messages).toHaveProperty(ns);
  });
});
```

**Expected Result**: ✓ All namespaces present

### Test 6: No Empty Values - French

**Purpose**: Verify French translations are not empty

```typescript
it('should not have empty values in French translations', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const messages = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  Object.entries(messages).forEach(([namespace, keys]) => {
    Object.entries(keys as Record<string, any>).forEach(([key, value]) => {
      expect(value).not.toBe('');
      expect(typeof value).toBe('string');
    });
  });
});
```

**Expected Result**: ✓ All values are non-empty strings

### Test 7: Key Count - French

**Purpose**: Verify expected number of translation keys

```typescript
it('should have approximately 50 translation keys in French', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const messages = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  const totalKeys = Object.values(messages).reduce(
    (sum, ns: any) => sum + Object.keys(ns).length,
    0,
  );

  // Allow range: 48-52 keys
  expect(totalKeys).toBeGreaterThanOrEqual(48);
  expect(totalKeys).toBeLessThanOrEqual(52);
});
```

**Expected Result**: ✓ Key count in acceptable range

### Test 8: Parameterized Translation Format

**Purpose**: Verify parameterized translations use correct syntax

```typescript
it('should have parameterized translations with correct syntax', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const messages = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  // Check article namespace has parameterized values
  expect(messages.article.readingTime).toMatch(/\{[a-z]+\}/);
  expect(messages.article.publishedOn).toMatch(/\{[a-z]+\}/);
  expect(messages.article.updatedOn).toMatch(/\{[a-z]+\}/);
});
```

**Expected Result**: ✓ Parameterized syntax correct

### Test 9: Type Safety

**Purpose**: Verify all values are strings (type safety)

```typescript
it('should have all values as strings (no nested objects)', () => {
  const frenchPath = path.join(process.cwd(), 'messages', 'fr.json');
  const messages = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  Object.values(messages).forEach((namespace) => {
    Object.values(namespace as any).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });
});
```

**Expected Result**: ✓ All values are strings

---

## 🔗 Integration Tests

### Integration Test 1: Config Can Load Messages

**Purpose**: Verify i18n configuration successfully imports messages

```typescript
it('should load from i18n configuration without errors', async () => {
  // Import the config to verify it doesn't error
  const { config } = await import('../../i18n/config');

  expect(config).toBeDefined();
  // If config has a messages property
  expect(config.messages).toBeDefined();
});
```

**Note**: Adjust based on your actual config structure

**Expected Result**: ✓ Config loads without errors

---

## 📊 Running Tests

### Run All Message Tests

```bash
# Run all tests matching 'messages'
pnpm test messages
```

**Expected Result**: All tests pass ✓

### Run Tests in Watch Mode (During Development)

```bash
# Run with --watch flag for automatic re-runs
pnpm test messages --watch
```

**Expected Result**: Tests run and re-run on file changes

### Generate Coverage Report

```bash
# Generate coverage for message tests
pnpm test:coverage -- tests/messages.test.ts
```

**Expected Result**: Coverage report showing >80% coverage

### Run Specific Test

```bash
# Run only the JSON parsing test
pnpm test messages -- --grep "should load and parse"
```

**Expected Result**: Only specified tests run

---

## 📊 Coverage Report

### Understanding Coverage

Coverage metrics for message tests:

| Metric                 | Target | Meaning                          |
| ---------------------- | ------ | -------------------------------- |
| **Line Coverage**      | >80%   | % of code lines executed         |
| **Branch Coverage**    | >80%   | % of conditional branches tested |
| **Function Coverage**  | >80%   | % of functions called            |
| **Statement Coverage** | >80%   | % of statements executed         |

### View HTML Coverage Report

```bash
# Generate and open HTML report
pnpm test:coverage -- tests/messages.test.ts
open coverage/index.html  # macOS
# or
xdg-open coverage/index.html  # Linux
```

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: "Cannot find module 'messages/fr.json'"

**Solution**:

```bash
# Verify file exists
ls -la messages/fr.json

# Check current working directory
pwd
# Should be project root
```

#### Issue: "JSON parsing error"

**Solution**:

```bash
# Validate JSON syntax manually
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))"

# If error, check for:
# - Trailing commas
# - Unclosed braces
# - Unquoted keys
```

#### Issue: "UTF-8 encoding not found"

**Solution**:

```bash
# Check file encoding
file -i messages/fr.json

# If not UTF-8, convert it
iconv -f ISO-8859-1 -t UTF-8 messages/fr.json > messages/fr.json.tmp
mv messages/fr.json.tmp messages/fr.json
```

### Debug Mode

Run tests with verbose output:

```bash
# Run with detailed output
pnpm test messages -- --reporter=verbose

# Run with debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs messages
```

---

## 🤖 CI/CD Automation

### GitHub Actions

Tests run automatically on:

- [ ] Pull requests
- [ ] Push to main branch
- [ ] Manual trigger

### Required Checks

All PRs must:

- [ ] Pass all message tests
- [ ] Achieve >80% coverage
- [ ] Have no console warnings
- [ ] JSON files valid

### CI Test Configuration

Add to your CI/CD pipeline:

```yaml
- name: Run message tests
  run: pnpm test messages

- name: Check coverage
  run: pnpm test:coverage -- tests/messages.test.ts

- name: Validate JSON
  run: |
    node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))"
    node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"
```

---

## ✅ Testing Checklist

Before committing Commit 4:

- [ ] All unit tests written (8-10 tests)
- [ ] All tests pass locally
- [ ] Coverage >80%
- [ ] Manual validation tests pass
- [ ] Integration test passes
- [ ] No console errors or warnings
- [ ] Tests are meaningful (not just for coverage)
- [ ] Comments explain complex test logic

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test critical functionality (JSON parsing, structure)
- Use descriptive test names
- One assertion per test (where possible)
- Test edge cases (empty values, encoding)
- Comments for non-obvious logic

❌ **Don't**:

- Over-mock (test real files)
- Write flaky tests
- Skip failing tests
- Add tests just for coverage numbers

### Test Naming

Use clear, descriptive names:

```typescript
// ✓ Good
it('should load and parse messages/fr.json without errors', () => {});

// ✗ Bad
it('parses messages', () => {});
it('test 1', () => {});
```

---

## ❓ FAQ

**Q: Why test JSON files at all?**
A: Prevents syntax errors and encoding issues from reaching production.

**Q: Should I test file permissions?**
A: No, assume files are readable. Testing existence and content is sufficient.

**Q: Can I skip encoding tests?**
A: No, encoding is critical for French accents. Must be validated.

**Q: How many tests are enough?**
A: 8-10 tests for comprehensive coverage. Aim for >80% coverage target.

**Q: Should I test translation accuracy?**
A: No, that's code review responsibility. Tests validate structure and format.

---

## 🔗 Important Links

- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Commit 4 requirements
- [Vitest Documentation](https://vitest.dev/)
- [Node.js fs Module](https://nodejs.org/api/fs.html)
- [next-intl Testing](https://next-intl.dev/)
