# Phase 0: Résumé du Nettoyage et Préparation

**Document parent**: `STORY_E2E_CLOUDFLARE_REFACTOR.md`
**Date**: 2025-01-19
**Durée estimée**: 2-3h

---

## Vue d'Ensemble

La Phase 0 a été ajoutée suite à une analyse approfondie du projet révélant un **état de transition** entre deux architectures E2E. Cette phase est **critique** et doit être complétée AVANT toute implémentation technique.

---

## Découvertes Clés

### 🚨 CRITIQUE - Conflit Architectural
- **Problème**: ADR 001 (preview deployments) vs Story (wrangler dev local)
- **Action**: Décision architecturale requise AVANT Phase 1
- **Recommandation**: Option B (Wrangler Dev Local)

### ⚠️ HAUTE PRIORITÉ - État Git Incohérent
- `tests/example.spec.ts` - Deleted mais non commité
- `tests/compression.spec.ts` - Nouveau fichier non tracké
- `tests/fixtures/compression.ts` - Nouveau fixture non tracké
- `test-output.log` - Fichier temporaire à la racine

### 🧹 Code Mort et Obsolète
- Imports dotenv commentés dans `playwright.config.ts` (L7-9)
- Configurations mobiles commentées (L54-71) - Décision requise
- Commentaires obsolètes décrivant ancienne architecture (L74-82)
- Longs commentaires CI à archiver dans ADR

---

## Checklist Phase 0 (5 Sous-phases)

### 0.1 - Résolution Conflit Architectural
- [ ] Décider: Preview Deployments (A) ou Wrangler Dev Local (B)
- [ ] Si B: Créer `/docs/decisions/002-e2e-local-wrangler-dev.md`
- [ ] Archiver ou supprimer ADR 001

### 0.2 - Nettoyage Git
- [ ] `git add tests/example.spec.ts` + commit suppression
- [ ] `git add tests/compression.spec.ts tests/fixtures/compression.ts` + commit
- [ ] `rm test-output.log`
- [ ] Ajouter patterns logs à `.gitignore`

### 0.3 - Nettoyage playwright.config.ts
- [ ] Supprimer imports dotenv commentés (L7-9)
- [ ] Décider: Supprimer/Documenter/Activer configs mobiles (L54-71)
- [ ] Noter mise à jour commentaires pour Phase 1

### 0.4 - Archivage Commentaires CI
- [ ] Créer `/docs/decisions/003-e2e-ci-timeout-history.md`
- [ ] Copier historique des commentaires workflow
- [ ] Simplifier commentaire dans `quality.yml`

### 0.5 - Documentation Scripts
- [ ] Ajouter commentaires dans `scripts/dev-quiet.sh`
- [ ] Documenter différence dev/preview dans `CLAUDE.md`

---

## Validation Finale Phase 0

Exécuter avant de passer à Phase 1:

```bash
# 1. ADR créé
test -f docs/decisions/002-e2e-local-wrangler-dev.md

# 2. Git propre
git status | grep "working tree clean"

# 3. Logs ignorés
grep "test-output.log" .gitignore

# 4. Pas de dotenv
! grep -q "dotenv" playwright.config.ts

# 5. ADR timeout créé
test -f docs/decisions/003-e2e-ci-timeout-history.md

# 6. Scripts documentés
grep -q "tests E2E" scripts/dev-quiet.sh
```

**Tous les checks doivent passer (exit code 0)**

---

## Inventaire des Fichiers Impactés

| Fichier | Type | Action |
|---------|------|--------|
| `tests/example.spec.ts` | Suppression | Commiter |
| `tests/compression.spec.ts` | Nouveau | Tracker |
| `tests/fixtures/compression.ts` | Nouveau | Tracker |
| `test-output.log` | Temporaire | Supprimer |
| `.gitignore` | Config | Ajouter patterns |
| `playwright.config.ts` | Config | Nettoyer imports, décider mobiles |
| `.github/workflows/quality.yml` | CI | Simplifier commentaires |
| `scripts/dev-quiet.sh` | Script | Documenter |
| `CLAUDE.md` | Doc | Ajouter section dev/preview |
| `/docs/decisions/002-e2e-local-wrangler-dev.md` | ADR | Créer |
| `/docs/decisions/003-e2e-ci-timeout-history.md` | ADR | Créer |

---

## Impact sur l'Estimation Globale

| Composant | Avant Phase 0 | Après Phase 0 |
|-----------|---------------|---------------|
| **Effort Total** | 8 points | 10 points |
| **Durée Estimée** | 12-16h | 15-19h |
| **Phases** | 4 (1-4) | 5 (0-4) |

---

## Prochaines Étapes

1. **Immédiat**: Prendre décision architecturale (ADR vs Story)
2. **Court terme**: Compléter Phase 0 (2-3h)
3. **Validation**: Exécuter checklist de validation
4. **Transition**: Passer à Phase 1 uniquement si validation ✅

---

## Références

- **Story complète**: `STORY_E2E_CLOUDFLARE_REFACTOR.md`
- **Guide de référence**: `/docs/guide_cloudflare_playwright.md`
- **Rapport d'analyse**: Section 10 de la story
- **ADR conflit**: `/docs/decisions/001-e2e-tests-preview-deployments.md`
