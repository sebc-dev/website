# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Create Message File Structure

**Files**: `messages/fr.json`, `messages/en.json`
**Estimated Duration**: 25-35 minutes

### Implementation Tasks

- [ ] Create `messages/` directory in project root
- [ ] Create `messages/fr.json` with empty namespace objects
- [ ] Create `messages/en.json` with identical structure
- [ ] Use 2-space indentation throughout
- [ ] Ensure UTF-8 encoding (typically default in editors)
- [ ] Include all 8 namespaces: `common`, `nav`, `footer`, `form`, `article`, `complexity`, `search`, `error`
- [ ] Namespaces are sorted alphabetically within each file

### Validation

```bash
# Test JSON syntax for both files
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "✓ fr.json is valid JSON"
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))" && echo "✓ en.json is valid JSON"

# Verify file sizes are similar
ls -lh messages/*.json
```

**Expected Result**: Two valid JSON files with empty namespaces, ~5-10 lines each with proper indentation

### Review Checklist

#### File Structure

- [ ] `messages/fr.json` exists in project root
- [ ] `messages/en.json` exists in project root
- [ ] Both files contain identical namespace structure
- [ ] All 8 namespaces present (common, nav, footer, form, article, complexity, search, error)
- [ ] Namespaces are alphabetically sorted

#### JSON Validity

- [ ] Both files are valid JSON (no syntax errors)
- [ ] 2-space indentation used consistently
- [ ] Proper opening/closing braces
- [ ] No trailing commas
- [ ] UTF-8 encoding used

#### Code Quality

- [ ] No placeholder comments left
- [ ] Files are clean and ready for translations
- [ ] Proper formatting for maintainability

### Commit Message

```bash
git add messages/
git commit -m "feat(i18n): create message file structure with namespaces

- Create messages/fr.json and messages/en.json with namespace structure
- Include all 8 namespaces: common, nav, footer, form, article, complexity, search, error
- Use 2-space indentation and UTF-8 encoding
- Provides foundation for Phase 1 French translations

Part of Phase 1 - Commit 1/4"
```

---

## 📋 Commit 2: Add French Translations - Part 1 (Common, Nav, Footer)

**Files**: `messages/fr.json`
**Estimated Duration**: 50-70 minutes

### Implementation Tasks

- [ ] Add French translations to `common` namespace (~10 keys)
  - [ ] `appName`: "sebc.dev"
  - [ ] `loading`: "Chargement..."
  - [ ] `error`: "Une erreur s'est produite"
  - [ ] `close`: "Fermer"
  - [ ] (+ 6 more common UI elements)
- [ ] Add French translations to `nav` namespace (~4 keys)
  - [ ] `home`: "Accueil"
  - [ ] `articles`: "Articles"
  - [ ] `search`: "Rechercher"
  - [ ] `about`: "À propos"
- [ ] Add French translations to `footer` namespace (~3 keys)
  - [ ] `copyright`: "© 2025 sebc.dev. Tous droits réservés."
  - [ ] `privacy`: "Politique de confidentialité"
  - [ ] `terms`: "Conditions d'utilisation"
- [ ] Ensure all French text uses proper accents (é, è, ê, ç, etc.)
- [ ] Verify JSON remains valid after additions

### Validation

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "✓ fr.json is valid JSON"

# Count keys (should be ~17)
node -e "const fr = JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8')); const count = Object.values(fr).reduce((sum, ns) => sum + Object.keys(ns).length, 0); console.log('✓ Total keys in fr.json:', count)"

# Check file is readable
cat messages/fr.json | head -30
```

**Expected Result**: French file with ~17 complete translations, proper accents, valid JSON

### Review Checklist

#### French Translations

- [ ] ~10 keys in `common` namespace
- [ ] ~4 keys in `nav` namespace
- [ ] ~3 keys in `footer` namespace
- [ ] Total: ~17 keys (approximately)
- [ ] All translations are in French (not English)
- [ ] French is natural and professional (not literal translations)

#### Quality Standards

- [ ] All French text uses proper accents (é, è, ê, ç, à, etc.)
- [ ] Consistent terminology across translations
- [ ] Proper capitalization (title case where appropriate)
- [ ] No hardcoded references to language in keys
- [ ] Tone matches project identity (professional, approachable)

#### Technical Validation

- [ ] JSON remains valid after additions
- [ ] No syntax errors or malformed objects
- [ ] All namespaces still present

### Commit Message

```bash
git add messages/fr.json
git commit -m "feat(i18n): add French translations for common, nav, and footer namespaces

- Add ~10 French translations to 'common' (loading, error, close, etc.)
- Add ~4 French translations to 'nav' (home, articles, search, about)
- Add ~3 French translations to 'footer' (copyright, privacy, terms)
- Use proper French accents and professional terminology
- Total: ~17 French translation keys added

Part of Phase 1 - Commit 2/4"
```

---

## 📋 Commit 3: Add French Translations - Part 2 (Forms, Articles, Complexity, Search, Errors)

**Files**: `messages/fr.json`
**Estimated Duration**: 60-80 minutes

### Implementation Tasks

- [ ] Add French translations to `form` namespace (~7 keys)
  - [ ] `submit`: "Soumettre"
  - [ ] `cancel`: "Annuler"
  - [ ] `save`: "Enregistrer"
  - [ ] `delete`: "Supprimer"
  - [ ] `edit`: "Modifier"
  - [ ] `required`: "Ce champ est requis"
  - [ ] `invalidEmail`: "Adresse e-mail invalide"
- [ ] Add French translations to `article` namespace (~8 keys with parameterized values)
  - [ ] `readingTime`: "{minutes} min de lecture"
  - [ ] `publishedOn`: "Publié le {date}"
  - [ ] `updatedOn`: "Mis à jour le {date}"
  - [ ] `category`: "Catégorie"
  - [ ] `tags`: "Balises"
  - [ ] `complexity`: "Complexité"
  - [ ] `tableOfContents`: "Table des matières"
  - [ ] `readingProgress`: "Progression de lecture"
- [ ] Add French translations to `complexity` namespace (3 keys)
  - [ ] `beginner`: "Débutant"
  - [ ] `intermediate`: "Intermédiaire"
  - [ ] `advanced`: "Avancé"
- [ ] Add French translations to `search` namespace (~8 keys)
  - [ ] `placeholder`: "Rechercher les articles..."
  - [ ] `noResults`: "Aucun article trouvé"
  - [ ] `filters`: "Filtres"
  - [ ] `clearFilters`: "Effacer les filtres"
  - [ ] `categories`: "Catégories"
  - [ ] `complexityLevel`: "Niveau de complexité"
  - [ ] `readingDuration`: "Durée de lecture"
  - [ ] `dateRange`: "Plage de dates"
- [ ] Add French translations to `error` namespace (~3 keys)
  - [ ] `notFound`: "Page non trouvée"
  - [ ] `serverError`: "Erreur serveur interne"
  - [ ] `goHome`: "Aller à la page d'accueil"
- [ ] Ensure parameterized translations use correct syntax: `{variable}`
- [ ] Verify all French text uses proper accents
- [ ] Verify JSON remains valid after all additions

### Validation

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "✓ fr.json is valid JSON"

# Count total keys (should be ~50)
node -e "const fr = JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8')); const count = Object.values(fr).reduce((sum, ns) => sum + Object.keys(ns).length, 0); console.log('✓ Total French keys:', count); Object.entries(fr).forEach(([ns, keys]) => console.log(\`  - \${ns}: \${Object.keys(keys).length}\`))"

# Verify parameterized translations
node -e "const fr = JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8')); const parameterized = fr.article.readingTime; console.log('✓ Parameterized translation example:', parameterized)"
```

**Expected Result**: Complete French translation set with ~50 total keys, proper accents, parameterized values, valid JSON

### Review Checklist

#### French Translations

- [ ] ~7 keys in `form` namespace
- [ ] ~8 keys in `article` namespace (with parameterized values)
- [ ] 3 keys in `complexity` namespace
- [ ] ~8 keys in `search` namespace
- [ ] ~3 keys in `error` namespace
- [ ] Total: ~30 new keys added, ~50 total
- [ ] All translations are in French
- [ ] French is natural, professional, and consistent

#### Parameterized Translations

- [ ] `article.readingTime` uses `{minutes}` placeholder
- [ ] `article.publishedOn` uses `{date}` placeholder
- [ ] `article.updatedOn` uses `{date}` placeholder
- [ ] All other parameterized values follow same pattern
- [ ] Placeholders are descriptive (e.g., `{variable}` not `{0}`)

#### Quality Standards

- [ ] All French text uses proper accents
- [ ] Consistent terminology across all namespaces
- [ ] Professional tone suitable for technical blog
- [ ] No hardcoded language-specific values
- [ ] Form validation messages are clear and helpful
- [ ] Error messages are user-friendly

#### Technical Validation

- [ ] JSON remains valid
- [ ] All namespaces complete with values
- [ ] No missing keys from structure

### Commit Message

```bash
git add messages/fr.json
git commit -m "feat(i18n): add French translations for forms, articles, search, and errors

- Add ~7 French translations to 'form' namespace (submit, cancel, required, etc.)
- Add ~8 French translations to 'article' namespace with parameterized values ({minutes}, {date})
- Add 3 French translations to 'complexity' namespace (beginner, intermediate, advanced)
- Add ~8 French translations to 'search' namespace (filters, results, categories, etc.)
- Add ~3 French translations to 'error' namespace (notFound, serverError, goHome)
- Use proper French accents and professional terminology
- Total: ~30 French translation keys added, ~50 total

Part of Phase 1 - Commit 3/4"
```

---

## 📋 Commit 4: Add Message Loading Tests and Config Validation

**Files**: `tests/messages.test.ts` (new), `i18n/config.ts` (modify)
**Estimated Duration**: 50-70 minutes

### Implementation Tasks

#### Test File (`tests/messages.test.ts`)

- [ ] Create test file in `/tests` directory
- [ ] Import necessary testing utilities (Vitest, assertions)
- [ ] Test 1: JSON parsing - `messages/fr.json` loads without errors
- [ ] Test 2: JSON parsing - `messages/en.json` loads without errors
- [ ] Test 3: UTF-8 encoding - files are properly encoded
- [ ] Test 4: Namespace existence - all 8 namespaces present in French file
- [ ] Test 5: Namespace existence - all 8 namespaces present in English file
- [ ] Test 6: No empty values - French translations are not empty strings
- [ ] Test 7: No empty values - English translations are not empty strings
- [ ] Test 8: Key count - French file has ~50 keys
- [ ] Test 9: Basic structure validation - all values are strings
- [ ] Add comments explaining complex test logic

#### Config Modification (`i18n/config.ts`)

- [ ] Ensure `messages` are properly imported in config
- [ ] Update config to load messages (if not already done)
- [ ] Add type definitions for message keys (TypeScript support)
- [ ] Verify no errors on module load

#### Documentation

- [ ] Add JSDoc comments to test functions
- [ ] Document test structure and purpose
- [ ] Add comments for any edge cases tested

### Validation

```bash
# Run all tests (should pass)
pnpm test messages

# Check test coverage
pnpm test:coverage -- tests/messages.test.ts

# Verify linting passes
pnpm lint

# Verify types check
pnpm tsc --noEmit
```

**Expected Result**: All tests pass, >80% coverage for message handling, no type errors

### Review Checklist

#### Test Coverage

- [ ] Test file created at `/tests/messages.test.ts`
- [ ] >=8 test cases implemented
- [ ] Tests cover JSON parsing, encoding, structure, and values
- [ ] Edge cases tested
- [ ] Coverage >80% for message-related code

#### Test Quality

- [ ] Tests are meaningful (not just for coverage)
- [ ] Test names are descriptive
- [ ] Each test has single assertion (where possible)
- [ ] No magic strings or hardcoded values
- [ ] Comments explain complex logic

#### TypeScript/Type Safety

- [ ] No `any` types (use proper types for test data)
- [ ] All imports properly typed
- [ ] Test fixtures have correct types
- [ ] Types generated or configured for message keys

#### Config Integration

- [ ] `i18n/config.ts` properly loads messages
- [ ] No TypeScript errors in config
- [ ] No runtime errors when loading messages
- [ ] Messages accessible from components (basic test)

### Commit Message

```bash
git add tests/messages.test.ts i18n/config.ts
git commit -m "test(i18n): add message file validation tests and config integration

- Create tests/messages.test.ts with 8+ test cases
- Test JSON parsing for both fr.json and en.json
- Verify UTF-8 encoding and namespace structure
- Validate no empty translation values
- Test message key counts (~50 expected)
- Update i18n/config.ts to load messages
- Add TypeScript types for message keys
- Coverage >80% for message handling logic

Part of Phase 1 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] All JSON files valid
- [ ] All tests pass
- [ ] Coverage >80% for message handling
- [ ] Linter passes (`pnpm lint`)
- [ ] TypeScript checks pass (`pnpm tsc --noEmit`)
- [ ] Documentation updated
- [ ] No console warnings or errors

### Final Validation Commands

```bash
# Validate all JSON files
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "✓ fr.json"
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))" && echo "✓ en.json"

# Run all tests
pnpm test messages

# Check coverage
pnpm test:coverage -- tests/messages.test.ts

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit
```

**Phase 1 is complete when all checkboxes are checked! 🎉**
