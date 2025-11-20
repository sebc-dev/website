# Phase 5: Tests & Documentation - Navigation Hub

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5
**Status**: NOT_STARTED
**Duration**: 0.5-1 jour
**Commits**: 5

---

## Quick Navigation

| Document | Purpose | Priority |
|----------|---------|----------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Atomic commit strategy | 🔴 Start Here |
| [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) | Per-commit detailed checklist | 🟠 During Work |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Environment configuration | 🟡 Setup |
| [guides/REVIEW.md](./guides/REVIEW.md) | Code review guide | 🟢 Review |
| [guides/TESTING.md](./guides/TESTING.md) | Testing strategy | 🟢 Testing |
| [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md) | Final validation | 🔵 Completion |

---

## Phase Overview

### Objective

Validation complète de l'implémentation i18n avec tests unitaires, tests E2E, tests de parité des traductions, et mise à jour de la documentation.

### Scope

- Tests unitaires pour `src/i18n/routing.ts` et `src/i18n/request.ts`
- Tests E2E pour `/fr` et `/en` homepage
- Tests de parité des messages (namespaces `home` et `metadata`)
- Mise à jour de `CLAUDE.md` et documentation i18n
- Validation build production et preview

### Success Criteria

- [ ] `pnpm test` passe (tous les tests)
- [ ] `pnpm test:e2e` passe
- [ ] `pnpm build` réussit
- [ ] `pnpm preview` fonctionne
- [ ] Documentation à jour
- [ ] Code review ready

---

## Dependencies

### Required Before Starting

- **Phase 1**: Structure `src/i18n/` complète ✅
- **Phase 2**: Layout `[locale]` avec Provider ✅
- **Phase 3**: Homepage internationalisée ✅
- **Phase 4**: Métadonnées SEO dynamiques ✅

### External Dependencies

- `next-intl` v4.5.3+
- Vitest
- Playwright
- Messages files complètes (FR/EN)

---

## Atomic Commits Summary

| Commit | Description | Files | Est. Time |
|--------|-------------|-------|-----------|
| 5.1 | Unit tests i18n | `src/i18n/__tests__/` | 45 min |
| 5.2 | E2E tests locales | `tests/*.spec.ts` | 45 min |
| 5.3 | Message parity tests | Tests de parité | 30 min |
| 5.4 | Documentation update | `CLAUDE.md`, `src/i18n/README.md` | 45 min |
| 5.5 | Final validation | Validation only | 30 min |

**Total Estimated Time**: 3-4 hours

---

## Key Files

### To Create

```
src/i18n/__tests__/
├── routing.test.ts
└── request.test.ts
```

### To Modify

- `tests/*.spec.ts` - E2E tests for localized pages
- `messages.test.ts` - Parity tests for new namespaces
- `CLAUDE.md` - i18n section update
- `src/i18n/README.md` - Documentation update

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Flaky E2E tests | Medium | Medium | Retry logic, appropriate timeouts |
| Missing test coverage | Low | Medium | Coverage report, review |
| Documentation gaps | Low | Low | Template-based approach |

---

## Notes

- Cette phase finale valide l'ensemble de l'implémentation i18n
- Les tests doivent couvrir les nouvelles fonctionnalités des phases 1-4
- La documentation doit refléter la nouvelle architecture

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
