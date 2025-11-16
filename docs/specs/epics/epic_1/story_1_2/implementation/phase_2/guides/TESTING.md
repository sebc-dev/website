# Phase 2 - Testing Guide

Complete testing strategy for Phase 2.

---

## 🎯 Testing Strategy

Phase 2 uses a multi-layered testing approach:

1. **File Validation Tests**: JSON syntax and structure validation
2. **Parity Tests**: Ensure 100% key coverage between languages
3. **Integration Tests**: Verify translations work with next-intl
4. **Manual Testing**: Verify translations render correctly in UI

**Target Coverage**: >80%
**Estimated Test Count**: 15+ tests

---

## 🧪 Unit Tests - File Validation

### Purpose

Validate that message files are properly formatted and structured.

### Test 1: French file is valid JSON

```typescript
import fs from "fs";

describe("Message Files - Structure", () => {
  it("French file is valid JSON", () => {
    const frenchContent = fs.readFileSync(
      "messages/fr.json",
      "utf-8"
    );
    expect(() => JSON.parse(frenchContent)).not.toThrow();
    const parsed = JSON.parse(frenchContent);
    expect(typeof parsed).toBe("object");
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
  });
});
```

**Expected Result**: JSON parses without errors, has top-level keys

### Test 2: English file is valid JSON

```typescript
it("English file is valid JSON", () => {
  const englishContent = fs.readFileSync(
    "messages/en.json",
    "utf-8"
  );
  expect(() => JSON.parse(englishContent)).not.toThrow();
  const parsed = JSON.parse(englishContent);
  expect(typeof parsed).toBe("object");
  expect(Object.keys(parsed).length).toBeGreaterThan(0);
});
```

**Expected Result**: JSON parses without errors, has top-level keys

### Test 3: Required namespaces exist in French

```typescript
it("French file has all required namespaces", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const requiredNamespaces = [
    "common",
    "nav",
    "footer",
    "form",
    "article",
    "complexity",
    "search",
    "error",
  ];

  requiredNamespaces.forEach((namespace) => {
    expect(fr).toHaveProperty(namespace);
    expect(typeof fr[namespace]).toBe("object");
  });
});
```

**Expected Result**: All 8 namespaces exist and are objects

### Test 4: Required namespaces exist in English

```typescript
it("English file has all required namespaces", () => {
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );
  const requiredNamespaces = [
    "common",
    "nav",
    "footer",
    "form",
    "article",
    "complexity",
    "search",
    "error",
  ];

  requiredNamespaces.forEach((namespace) => {
    expect(en).toHaveProperty(namespace);
    expect(typeof en[namespace]).toBe("object");
  });
});
```

**Expected Result**: All 8 namespaces exist and are objects

---

## 🧪 Parity Tests

### Purpose

Ensure 100% key coverage between French and English. No missing translations.

### Helper Function: Get All Keys

```typescript
// Helper: Extract all nested keys from an object
function getNestedKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      keys.push(...getNestedKeys(value, fullKey));
    } else if (typeof value === "string") {
      keys.push(fullKey);
    }
  }

  return keys.sort();
}
```

### Test 5: Forward Parity (French → English)

```typescript
it("All French keys exist in English", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  const frKeys = getNestedKeys(fr);
  const enKeys = getNestedKeys(en);

  const missingInEnglish = frKeys.filter((key) => !enKeys.includes(key));

  expect(missingInEnglish).toEqual([]);

  if (missingInEnglish.length > 0) {
    console.error("Missing English keys:", missingInEnglish);
  }
});
```

**Expected Result**: No keys missing from English file

**Error Message Example**:
```
Expected: []
Received: ["article.byAuthor", "search.sort"]

Missing English keys: ["article.byAuthor", "search.sort"]
```

### Test 6: Reverse Parity (English → French)

```typescript
it("All English keys exist in French", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  const frKeys = getNestedKeys(fr);
  const enKeys = getNestedKeys(en);

  const missingInFrench = enKeys.filter((key) => !frKeys.includes(key));

  expect(missingInFrench).toEqual([]);

  if (missingInFrench.length > 0) {
    console.error("Missing French keys:", missingInFrench);
  }
});
```

**Expected Result**: No extra keys in English

---

## 🧪 Structure Validation Tests

### Test 7: Namespace structure is consistent

```typescript
it("Namespace structure is identical in both files", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  // Check each namespace has same keys
  for (const namespace in fr) {
    expect(en).toHaveProperty(namespace);
    const frKeys = Object.keys(fr[namespace]).sort();
    const enKeys = Object.keys(en[namespace]).sort();
    expect(enKeys).toEqual(frKeys);
  }
});
```

**Expected Result**: Each namespace has identical structure

### Test 8: No undefined or null values

```typescript
it("No undefined or null values in message files", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  const checkValues = (obj: any, path = "") => {
    for (const key in obj) {
      const value = obj[key];
      const fullPath = path ? `${path}.${key}` : key;

      if (value === null || value === undefined) {
        throw new Error(`Null/undefined value at: ${fullPath}`);
      }

      if (typeof value === "object") {
        checkValues(value, fullPath);
      }
    }
  };

  expect(() => checkValues(fr)).not.toThrow();
  expect(() => checkValues(en)).not.toThrow();
});
```

**Expected Result**: All values are strings, no null or undefined

---

## 🧪 Parameterized Translation Tests

### Test 9: Parameterized translations use consistent syntax

```typescript
it("Parameterized translations use correct {variable} syntax", () => {
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf-8")
  );
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  // Extract all strings with {placeholder}
  const getParameterizedKeys = (obj: any) => {
    const params: { [key: string]: string } = {};
    const findParams = (o: any, path = "") => {
      for (const key in o) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof o[key] === "string") {
          const matches = o[key].match(/\{(\w+)\}/g);
          if (matches) {
            params[fullPath] = o[key];
          }
        } else if (typeof o[key] === "object") {
          findParams(o[key], fullPath);
        }
      }
    };
    findParams(obj);
    return params;
  };

  const frParams = getParameterizedKeys(fr);
  const enParams = getParameterizedKeys(en);

  // Check same keys have parameters
  for (const key in frParams) {
    expect(enParams).toHaveProperty(key);
  }

  // Check variable names match
  for (const key in frParams) {
    const frVars = frParams[key].match(/\{(\w+)\}/g) || [];
    const enVars = enParams[key].match(/\{(\w+)\}/g) || [];
    expect(enVars.sort()).toEqual(frVars.sort());
  }
});
```

**Expected Result**: All parameterized translations have matching variables

### Test 10: Parameterized examples work correctly

```typescript
it("Example parameterized translations render correctly", () => {
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf-8")
  );

  // Test examples
  const examples = [
    {
      template: en.article.readingTime,
      params: { minutes: 5 },
      expected: "5 min read",
    },
    {
      template: en.article.publishedOn,
      params: { date: "November 16, 2025" },
      expected: "Published on November 16, 2025",
    },
    {
      template: en.article.byAuthor,
      params: { author: "John Doe" },
      expected: "By John Doe",
    },
  ];

  examples.forEach(({ template, params, expected }) => {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, String(value));
    }
    expect(result).toBe(expected);
  });
});
```

**Expected Result**: Parameter substitution works as expected

---

## 🎭 Integration Tests

### Test 11: Configuration loads messages correctly

```typescript
it("next-intl config loads both message files", async () => {
  // This test depends on your i18n/config.ts implementation
  const config = require("../../../i18n/config");

  expect(config.messages).toBeDefined();
  expect(config.messages.fr).toBeDefined();
  expect(config.messages.en).toBeDefined();

  // Check namespace structure
  ["common", "nav", "footer", "form", "article", "complexity", "search", "error"]
    .forEach((namespace) => {
      expect(config.messages.fr).toHaveProperty(namespace);
      expect(config.messages.en).toHaveProperty(namespace);
    });
});
```

**Expected Result**: Configuration loads messages successfully

---

## 🧪 Running Tests

### Run All Message Tests

```bash
# Run message tests
pnpm test tests/messages.test.ts

# Run with watch mode (during development)
pnpm test:watch tests/messages.test.ts

# Run with verbose output
pnpm test tests/messages.test.ts -- --reporter=verbose

# Run specific test
pnpm test tests/messages.test.ts -t "Forward Parity"
```

### Coverage Report

```bash
# Generate coverage for message tests
pnpm test:coverage tests/messages.test.ts

# Generate full project coverage
pnpm test:coverage

# View HTML coverage report
open coverage/index.html  # Mac
# or
xdg-open coverage/index.html  # Linux
```

**Target**: >80% coverage for message handling code

---

## 🧪 Test Output Examples

### Successful Test Run

```
 ✓ Message Files - Structure (8 tests) 45ms
   ✓ French file is valid JSON
   ✓ English file is valid JSON
   ✓ Required namespaces exist in French
   ✓ Required namespaces exist in English
   ✓ Namespace structure is identical in both files
   ✓ No undefined or null values in message files
 ✓ Message Parity (2 tests) 32ms
   ✓ All French keys exist in English
   ✓ All English keys exist in French
 ✓ Parameterized Translations (2 tests) 18ms
   ✓ Parameterized translations use consistent syntax
   ✓ Example parameterized translations work correctly

Test Files  1 passed (1)
     Tests  12 passed (12)
  Start at  12:34:56
  Duration  95ms
```

### Failed Parity Test

```
✗ Message Parity › All English keys exist in French
  Expected: []
  Received: ["form.confirmPassword", "search.sort"]

  Missing French keys: ["form.confirmPassword", "search.sort"]

  This usually means:
  - You added new English keys that don't exist in French
  - You need to add these keys to messages/fr.json

Suggested action:
  1. Add keys to messages/fr.json
  2. Run tests again
```

---

## 🐛 Debugging Tests

### Debug Commands

```bash
# Run single test with detailed output
pnpm test tests/messages.test.ts -t "Forward Parity" -- --reporter=verbose

# Run tests in debug mode (if using Node debugger)
node --inspect-brk ./node_modules/vitest/vitest.mjs run tests/messages.test.ts

# Print message file structure
node -e "console.log(JSON.stringify(require('./messages/fr.json'), null, 2))" | head -50
```

### Common Issues

**Issue**: "Cannot find module 'messages/fr.json'"
- **Solution**: Ensure `messages/fr.json` exists from Phase 1
- **Check**: `ls -la messages/fr.json`

**Issue**: Test fails with "Unexpected end of JSON input"
- **Solution**: JSON file has syntax error
- **Check**: `jq empty messages/en.json`

**Issue**: Parity test fails with missing keys
- **Solution**: Manually add missing keys to the other file
- **Check**: Compare with `jq 'keys' messages/fr.json` and `jq 'keys' messages/en.json`

---

## 📋 Test Checklist

Before committing tests (Commit 3):

- [ ] All tests pass locally
- [ ] No console.log statements in test output
- [ ] Error messages are clear and helpful
- [ ] Tests cover:
  - [ ] JSON validity
  - [ ] Namespace structure
  - [ ] Key parity (both directions)
  - [ ] Parameterized translations
  - [ ] Edge cases
- [ ] Coverage > 80%
- [ ] Tests are independent (can run in any order)
- [ ] Helper functions are documented

---

## 🤖 CI/CD Automation

### GitHub Actions (if configured)

Tests should run automatically on:
- Pull requests
- Push to main branch

### CI Test Command

```yaml
# In .github/workflows/test.yml or similar
- name: Run message validation tests
  run: pnpm test tests/messages.test.ts

- name: Check message parity
  run: pnpm test tests/messages.test.ts -t "Parity"
```

### Required Checks

All PRs must:
- [ ] Pass all message tests
- [ ] Pass parity validation specifically
- [ ] Achieve >80% coverage
- [ ] Have no console errors

---

## ✅ Testing Summary

| Test Name | Purpose | Critical | Time |
|-----------|---------|----------|------|
| JSON Validity | Ensure files parse correctly | Yes | 1s |
| Namespace Existence | Verify all 8 namespaces present | Yes | 1s |
| Forward Parity | All French keys in English | Yes | 1s |
| Reverse Parity | All English keys in French | Yes | 1s |
| Structure Consistency | Same structure in both files | Yes | 1s |
| No Null Values | No undefined/null entries | Yes | 1s |
| Parameterized Syntax | Correct `{variable}` usage | High | 1s |
| Parameter Examples | Variables substitute correctly | High | 1s |
| Config Loading | next-intl loads messages | High | 1s |

**Total Test Time**: <15 seconds

---

## ❓ FAQ

**Q: Should I test the actual translation quality?**
A: That's manual testing. Automated tests verify structure and parity, not translation accuracy.

**Q: How often should tests run?**
A: On every commit. CI/CD should run them on every PR.

**Q: What if a test is too strict?**
A: Update the test only if the requirement changed. Otherwise, fix the code to match.

**Q: Can I skip message tests?**
A: No. These tests ensure the quality gate for translations.

**Q: How do I handle special characters in tests?**
A: Use UTF-8 encoding and test with actual characters (é, ç, etc.).

---

## 🔗 Reference

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md)
- [Vitest Documentation](https://vitest.dev/)
- [next-intl Testing Guide](https://next-intl.dev/docs/usage/testing)

---

**Happy testing! 🧪**

