# Phase 2 - Atomic Implementation Plan

**Objective**: Créer la structure App Router avec segment dynamique `[locale]` et Provider pour l'internationalisation

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - Types validate at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Layout localisé] → [Layout racine] → [Not-found] → [Middleware] → [Test page]
       ↓                   ↓              ↓             ↓            ↓
   Provider           Simplification   i18n 404     Routing      Validation
    setup              + cleanup       page        alignment     complète
```

---

## 📦 The 5 Atomic Commits

### Commit 2.1: Créer app/[locale]/layout.tsx

**Files**: `app/[locale]/layout.tsx`
**Size**: ~80-120 lines
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:

- Créer le layout localisé avec `NextIntlClientProvider`
- Implémenter `getMessages()` pour charger les traductions
- Configurer `<html lang={locale}>` dynamique
- Setup des fonts et styles de base
- Export `generateStaticParams()` pour les locales

**Why it's atomic**:

- Single responsibility: Provider setup
- Can be validated independently avec `pnpm dev`
- Foundation for all localized pages

**Technical Validation**:

```bash
pnpm tsc
pnpm dev
# Visit /fr and /en - should render without errors
```

**Expected Result**: Routes `/fr` et `/en` répondent avec le layout correct

**Review Criteria**:

- [ ] `NextIntlClientProvider` correctly wraps children
- [ ] `getMessages()` async call is properly awaited
- [ ] `locale` parameter is validated
- [ ] `<html lang={locale}>` is dynamic
- [ ] Fonts (Geist) are properly configured

---

### Commit 2.2: Simplifier app/layout.tsx

**Files**: `app/layout.tsx`
**Size**: ~30-50 lines
**Duration**: 20-30 min (implementation) + 15-20 min (review)

**Content**:

- Réduire le layout racine au minimum
- Garder uniquement l'import des fonts
- Garder l'import de globals.css
- Supprimer les métadonnées (déplacées vers [locale]/layout)
- Retirer `<html>` et `<body>` tags (délégués au layout localisé)

**Why it's atomic**:

- Single responsibility: cleanup root layout
- Depends on Commit 2.1 being functional
- Clear separation of concerns

**Technical Validation**:

```bash
pnpm tsc
pnpm lint
pnpm dev
# App should still work correctly
```

**Expected Result**: Root layout minimal, [locale]/layout handles i18n

**Review Criteria**:

- [ ] No duplicate `<html>` or `<body>` tags
- [ ] Fonts still load correctly
- [ ] globals.css still applied
- [ ] No orphan metadata
- [ ] Clean, minimal code

---

### Commit 2.3: Créer app/[locale]/not-found.tsx

**Files**: `app/[locale]/not-found.tsx`
**Size**: ~40-60 lines
**Duration**: 30-40 min (implementation) + 15-20 min (review)

**Content**:

- Créer page 404 internationalisée
- Utiliser `useTranslations('error')` pour les textes
- Design cohérent avec le style du site
- Lien de retour vers l'accueil avec `Link` de next-intl
- Messages pour titre, description, bouton retour

**Why it's atomic**:

- Single responsibility: 404 page
- Tests `useTranslations` in Client Component context
- Validates Provider is working

**Technical Validation**:

```bash
pnpm tsc
pnpm dev
# Visit /fr/nonexistent-page - should show French 404
# Visit /en/nonexistent-page - should show English 404
```

**Expected Result**: 404 page shows localized content

**Review Criteria**:

- [ ] `useTranslations('error')` works correctly
- [ ] Link component is from `@/src/i18n`
- [ ] Design matches site style
- [ ] Both FR and EN display correctly
- [ ] Return link works

---

### Commit 2.4: Mettre à jour middleware

**Files**: `middleware.ts`
**Size**: ~20-40 lines modified
**Duration**: 30-40 min (implementation) + 20-30 min (review)

**Content**:

- Importer `routing` depuis `@/src/i18n/routing`
- Utiliser la configuration centralisée
- Supprimer la configuration dupliquée
- Vérifier la redirection `/` → `/fr/` ou `/en/`
- Conserver le pattern de chaînage manuel si existant

**Why it's atomic**:

- Single responsibility: middleware alignment
- Critical for routing to work correctly
- Easy to test and rollback

**Technical Validation**:

```bash
pnpm tsc
pnpm dev
# Visit / - should redirect to /fr/ (or /en/ based on browser)
# Visit /fr - should work
# Visit /en - should work
# Visit /invalid-locale - should redirect
```

**Expected Result**: Middleware uses centralized routing config

**Review Criteria**:

- [ ] Imports from `@/src/i18n/routing`
- [ ] No duplicate locale configuration
- [ ] Redirects work correctly
- [ ] Accept-Language detection works
- [ ] Locale prefix behavior correct

---

### Commit 2.5: Migrer messages-test page

**Files**: `app/[locale]/(test)/messages-test/page.tsx`
**Size**: ~50-100 lines
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:

- Déplacer/adapter la page de test existante
- Vérifier qu'elle fonctionne avec le nouveau Provider
- Afficher toutes les traductions pour validation visuelle
- Optionnel: améliorer avec la nouvelle structure

**Why it's atomic**:

- Single responsibility: test page migration
- Validates entire i18n pipeline works
- Useful for manual testing

**Technical Validation**:

```bash
pnpm tsc
pnpm dev
# Visit /fr/messages-test - should show all French translations
# Visit /en/messages-test - should show all English translations
```

**Expected Result**: Test page displays all translations in both locales

**Review Criteria**:

- [ ] Page renders without errors
- [ ] All namespaces displayed
- [ ] Both locales work
- [ ] Translations are correct
- [ ] Route group `(test)` used appropriately

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand requirements fully
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md
3. **Implement Commit 1**: Follow COMMIT_CHECKLIST.md
4. **Validate Commit 1**: Run validation commands
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message
7. **Repeat for commits 2-5**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Type-checking
pnpm tsc

# Linting
pnpm lint

# Tests (if applicable)
pnpm test

# Dev server test
pnpm dev
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit              | Files | Lines    | Implementation | Review   | Total  |
| ------------------- | ----- | -------- | -------------- | -------- | ------ |
| 2.1 Layout localisé | 1     | ~100     | 60 min         | 30 min   | 90 min |
| 2.2 Layout racine   | 1     | ~40      | 25 min         | 15 min   | 40 min |
| 2.3 Not-found       | 1     | ~50      | 35 min         | 15 min   | 50 min |
| 2.4 Middleware      | 1     | ~30      | 35 min         | 25 min   | 60 min |
| 2.5 Test page       | 1     | ~75      | 40 min         | 20 min   | 60 min |
| **TOTAL**           | **5** | **~295** | **3.2h**       | **1.8h** | **5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time
- 🧪 **Testable**: Each commit validated
- 📝 **Documented**: Clear commit messages

### For Reviewers

- ⚡ **Fast review**: 15-30 min per commit
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot issues

### For the Project

- 🔄 **Rollback-safe**: Revert without breaking
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand later

---

## 📝 Best Practices

### Commit Messages

Format:

```
🌐 feat(i18n): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Story 1.8 Phase 2 - Commit X/5
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Review Checklist

Before committing:

- [ ] Code follows project style guide
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] Manual testing done in both locales
- [ ] No console.logs or debug code

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies)
- ✅ Validate after each commit
- ✅ Test both `/fr` and `/en` routes
- ✅ Use provided commit messages as template

### Don'ts

- ❌ Skip commits or combine them
- ❌ Commit without running validations
- ❌ Add features not in the spec
- ❌ Forget to test both locales

---

## 🔗 Dependencies

### Phase 1 Prerequisites

- `src/i18n/routing.ts` with `defineRouting()` ✅
- `src/i18n/request.ts` with new API ✅
- `src/i18n/index.ts` barrel export ✅
- All imports updated ✅

### External Dependencies

- `next-intl` v4.5.3+
- `messages/fr.json` and `messages/en.json`
- Error namespace in messages

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Split it into smaller commits (update this plan)

**Q: What if I need to fix a previous commit?**
A: Fix in place if not pushed, or create a fixup commit

**Q: Can I change the commit order?**
A: Only if dependencies allow. Commits 2.1 must come first.

**Q: What if tests fail?**
A: Don't commit until they pass. Fix the code or update tests.

**Q: What about the existing app/page.tsx?**
A: It will be handled in Phase 3. Keep it for now.
