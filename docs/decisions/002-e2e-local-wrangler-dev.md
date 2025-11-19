# ADR 002: Tests E2E Locaux avec Wrangler Dev

## Statut
Accepté

## Date
2025-01-19

## Contexte

Le projet nécessite une stratégie de tests E2E pour valider le comportement
de l'application Next.js sur le runtime Cloudflare Workers.

Deux approches ont été évaluées:

### Option A: Preview Deployments (ADR 001)
- Tests exécutés contre des déploiements Cloudflare réels (preview URLs)
- Environnement 100% identique à la production
- Standard de l'industrie (Vercel, Netlify)

### Option B: Wrangler Dev Local (Story Document)
- Tests exécutés contre `wrangler dev` localement en CI
- Simulation du runtime Cloudflare Workers avec `workerd`
- URL de test: `http://127.0.0.1:8788`

## Décision

Nous adoptons **Option B: Wrangler Dev Local** pour les tests E2E.

## Rationale

### Avantages de l'Option B

1. **Performance**: Build + start wrangler (~60-90s) vs déploiement cloud (~5-10min)
2. **Coût**: Aucune consommation de quota Cloudflare pour les tests
3. **Debugging**: Logs directs et stdout/stderr accessibles immédiatement
4. **Contrôle**: Configuration locale complète (D1, R2, DO, variables)
5. **Itération**: Pas de cleanup de preview deployments à gérer
6. **Offline**: Tests possibles sans connexion internet stable

### Fidélité du Runtime

Le runtime `workerd` (utilisé par `wrangler dev`) est le **même** que
celui utilisé en production Cloudflare Workers. Il détecte donc:
- ✅ Bugs spécifiques au Edge runtime
- ✅ Limitations I/O (pas de `fs`, `child_process`)
- ✅ API manquantes ou contraintes mémoire
- ✅ Comportement des bindings (D1, R2, DO)

### Limites Acceptées

- ❌ Latence réseau réelle non simulée (non critique pour tests fonctionnels)
- ❌ Infrastructure Cloudflare globale non testée (Anycast, etc.)

**Mitigation**: Possibilité d'ajouter des tests de smoke sur preview
deployments APRÈS stabilisation des tests locaux (Phase future).

## Conséquences

### Implémentation (Phases 1-4)

- Modification de `playwright.config.ts` (baseURL: `http://127.0.0.1:8788`)
- Modification de `package.json` (script `preview` avec `--ip 127.0.0.1`)
- Création de `tests/global-setup.ts` (seeding D1)
- Réactivation du job `e2e-tests` dans `.github/workflows/quality.yml`

### Documentation

- ADR 001 archivé (pas supprimé) pour référence historique
- Story Document devient la spec de référence
- CLAUDE.md mis à jour avec différence dev/preview

### Évolution Future

Si l'Option B s'avère insuffisante (non anticipé), nous pouvons:
1. Ajouter des tests de smoke en preview (complémentaires)
2. Migrer complètement vers ADR 001 (rollback possible)

## Alternatives Considérées

### Option A: Preview Deployments (Rejetée)

**Avantages**:
- ✅ Environnement 100% identique à production
- ✅ Tests l'infrastructure Cloudflare complète
- ✅ Standard de l'industrie

**Inconvénients**:
- ❌ Quota Cloudflare requis (coût potentiel)
- ❌ Temps de déploiement élevé (5-10min)
- ❌ Gestion cleanup complexe (preview URLs persistantes)
- ❌ Debugging difficile (logs sur dashboard cloud)
- ❌ Dépendance connexion internet stable

**Décision**: Rejetée pour les raisons de performance et coût.

## Références

- `/docs/decisions/001-e2e-tests-preview-deployments.md` (archivé)
- `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
- `/docs/guide_cloudflare_playwright.md` (guide de référence)
- [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)
- [Wrangler Dev Docs](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

## Auteurs

- Claude Code (AI Assistant)

## Changelog

- 2025-01-19: ADR créé et accepté
