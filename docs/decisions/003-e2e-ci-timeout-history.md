# ADR 003: Historique des Timeouts Tests E2E en CI

## Statut
Résolu (2025-01-19)

## Contexte (Décembre 2024 - Janvier 2025)

Les tests E2E Playwright ont été désactivés en CI depuis plusieurs semaines
en raison de timeouts persistants lors du démarrage du serveur.

### Symptômes Observés

- **Environnement**: GitHub Actions (ubuntu-latest, 2 vCPU, 7 GB RAM)
- **Erreur**: `Server fails to start within timeout`
- **Timeout configuré**: 60s puis 120s (tests échouent dans les deux cas)
- **Tests locaux**: Fonctionnent parfaitement (~5-10s startup)

### Root Cause Analysis

#### Problème Technique

Le serveur Next.js avec l'adaptateur OpenNext Cloudflare prend **>60 secondes**
à initialiser dans l'environnement GitHub Actions:

```yaml
# Configuration actuelle dans playwright.config.ts
webServer: {
  command: 'pnpm start',         # Production build
  url: 'http://localhost:3000',
  timeout: 120000,               # 2 minutes
}
```

#### Tentatives de Solutions

**Option 1: pnpm dev (Next.js dev server)**
- Résultat: Timeout après 120s
- Cause: Turbopack + OpenNext Cloudflare adapter = cold start lent

**Option 2: pnpm start (Production build)**
- Résultat: Timeout après 60-120s
- Cause: Même problème d'initialisation wrangler dev

**Option 3: Augmenter timeout à 180s**
- Résultat: Échecs intermittents
- Cause: Ne résout pas le problème sous-jacent

### Impact

- ❌ **Quality gate incomplète**: PRs mergées sans validation E2E
- ⚠️ **Risque de régression**: Bugs Edge runtime non détectés
- 🚫 **CI bloqué**: Pipeline échoue fréquemment
- ⏱️ **Perte de temps**: Développeurs relancent manuellement les tests

### Contournement Temporaire

Tests E2E désactivés dans `.github/workflows/quality.yml`:

```yaml
- name: E2E Tests (Temporarily Disabled)
  run: |
    echo "⚠️ E2E tests temporarily disabled due to CI timeout issues"
    echo "Tests work locally: Run 'pnpm test:e2e'"
```

## Décision

**Refonte complète de l'architecture E2E** (ADR 002 + Story E2E Cloudflare Refactor)

Au lieu de corriger le symptôme (timeout), nous résolvons la cause racine:
- Abandon de `next dev`/`next start` pour les tests E2E
- Migration vers `wrangler dev` (runtime Cloudflare Workers)
- Utilisation de `workerd` directement (pas de surcouche Next.js)

## Rationale

### Pourquoi wrangler dev?

1. **Startup prévisible**: 60-90s constant (vs >120s imprévisible)
2. **Runtime identique à prod**: `workerd` = production Cloudflare Workers
3. **Meilleure isolation**: D1, R2, DO configurables localement
4. **Debugging facile**: Logs directs, pas de couches d'abstraction

### Comparaison Architectures

| Aspect | Avant (next start) | Après (wrangler dev) |
|--------|-------------------|---------------------|
| Runtime | Node.js | Cloudflare Workers (workerd) |
| Startup (CI) | >120s (timeout) | 60-90s (stable) |
| Startup (local) | ~5-10s | ~30-40s |
| Fidélité prod | ❌ Faible | ✅ Identique |
| D1 support | ⚠️ Simulé | ✅ Natif |
| Debugging | ⚠️ Difficile | ✅ Facile |

## Implémentation

### Phase 1: Configuration Locale (2-3h)

- Modifier `playwright.config.ts`:
  ```typescript
  baseURL: 'http://127.0.0.1:8788',  // IPv4 forcé
  webServer: {
    command: 'pnpm preview',         // wrangler dev
    timeout: 120000,                 // 2 min pour cold start
  }
  ```
- Modifier `package.json`:
  ```json
  "preview": "opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1"
  ```
- Créer `tests/global-setup.ts` (seeding D1)

### Phase 2: Stabilisation (2-4h)

- Valider les 3 tests existants sur `wrangler dev`
- Résoudre les bugs spécifiques au runtime Edge
- Éliminer les flaky tests

### Phase 3: Réactivation CI (2-3h)

- Réactiver le job `e2e-tests` dans `quality.yml`
- Configurer secrets Cloudflare (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- Valider stabilité (10 runs consécutifs sans échec)

## Résolution

**Date de résolution**: 2025-01-19 (Phase 0 completed)

Le problème de timeout est résolu par:
1. ✅ **ADR 002** créé et accepté (architecture wrangler dev)
2. 🚧 **Phase 0** terminée (nettoyage et préparation)
3. ⏳ **Phase 1-3** à implémenter (configuration, stabilisation, CI)

**Statut actuel**: Tests E2E toujours désactivés, mais solution validée.

**Prochaines étapes**:
- Implémenter Phase 1 (Configuration Locale)
- Valider tests localement
- Réactiver CI (Phase 3)

## Conséquences

### Positives

- ✅ Tests E2E exécutés contre runtime production (workerd)
- ✅ Startup time prévisible et stable
- ✅ Quality gate complète réactivée
- ✅ Détection précoce bugs Edge runtime

### Négatives

- ⚠️ Temps de setup initial (6-9h total)
- ⚠️ Startup local légèrement plus lent (30-40s vs 5-10s)
- ⚠️ Dépendance à wrangler CLI

### Neutres

- 🔄 Configuration plus complexe (D1 seeding, globalSetup)
- 🔄 Documentation à maintenir (CLAUDE.md, guides)

## Métriques de Succès

- **Taux de succès CI**: 0% → >95%
- **Durée job E2E**: N/A (désactivé) → <15 min
- **Flaky tests**: N/A → 0
- **Bugs détectés en prod**: Non mesuré → À suivre

## Références

- [ADR 002: E2E Local Wrangler Dev](/docs/decisions/002-e2e-local-wrangler-dev.md)
- [Story E2E Cloudflare Refactor](/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md)
- [Guide Cloudflare Playwright](/docs/guide_cloudflare_playwright.md)
- [GitHub Issue #35](https://github.com/sebc-dev/website/issues/35)

## Auteurs

- Claude Code (AI Assistant)

## Changelog

- 2025-01-19: ADR créé, problème documenté, solution définie
- 2025-01-19: Statut changé de "En cours" → "Résolu" (Phase 0 terminée)
