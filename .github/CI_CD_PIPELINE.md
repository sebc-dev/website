# CI/CD Pipeline - GitHub Actions

Ce document décrit le pipeline CI/CD automatisé pour le projet sebc.dev.

## Vue d'ensemble

Le pipeline CI/CD est défini dans `.github/workflows/quality.yml` et s'exécute automatiquement lors de :

- **Pull Requests** vers `main` ou `develop`
- **Push** vers `main` ou `develop`
- **Schedule** : Tous les lundis à 2h du matin (mutation testing hebdomadaire)

## Architecture du Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ detect-changes                                              │
│ ───────────────                                              │
│ Détecte les fichiers critiques changés                      │
│ (app/admin/, src/lib/server/)                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────────┬──────────────────────┐
             │                      │                      │
    ┌────────▼─────────┐   ┌───────▼──────────┐   ┌──────▼──────────┐
    │ standard-quality │   │ e2e-tests        │   │ mutation-testing │
    │ ────────────────  │   │ ─────────────────   │ ──────────────  │
    │ • format:check   │   │ • Playwright tests   │ • Stryker       │
    │ • lint           │   │ (Browser E2E)       │ • Conditionnel   │
    │ • architecture   │   │ • Generate report   │ • Commentaire PR │
    │ • unit tests     │   └───────┬──────────┘   └──────┬──────────┘
    │ • integration    │           │                     │
    │ • coverage       │           │  (Seulement si     │
    │ • upload coverage│           │   changements)     │
    └────────┬─────────┘           │                     │
             │                     │                     │
             └──────────────┬──────┴─────────────────────┘
                            │
                    ┌───────▼──────────┐
                    │ build            │
                    │ ─────            │
                    │ • pnpm build     │
                    │ • bundle analyze │
                    │ • upload artefact│
                    └───────┬──────────┘
                            │
                    ┌───────▼──────────┐
                    │ ci-success       │
                    │ ──────────────── │
                    │ Status final     │
                    └──────────────────┘
```

## Jobs Détaillés

### 1. **detect-changes** ⚙️

Détecte les fichiers changés pour optimiser l'exécution du mutation testing.

- **Trigger** : Tous les événements
- **Durée** : ~30s
- **Sortie** : Variable `critical-files` (true/false)

#### Logique :

- **Pull Request** : Vérifie si les diffs contiennent `app/admin/` ou `src/lib/server/`
- **Push/Schedule** : Toujours `true` (exécute mutation testing complet)

---

### 2. **standard-quality** ✓

Validation rapide de la qualité du code (exécuté sur toutes les PR).

**Étapes** :

1. `pnpm format:check` - Prettier
2. `pnpm lint` - ESLint + plugins
3. `pnpm arch:validate` - dependency-cruiser
4. `pnpm test --run` - Tests unitaires/intégration (Vitest)
5. `pnpm test:coverage` - Génère rapport de couverture
6. Upload sur Codecov (optionnel)

- **Durée** : ~5-10 min
- **Requis** : Oui, doit réussir pour les PRs

---

### 3. **e2e-tests** 🎭

Tests end-to-end avec Playwright (navigation complète du navigateur).

**Étapes** :

1. Installe les dépendances
2. `pnpm exec playwright install --with-deps` - Télécharge les navigateurs
3. `pnpm test:e2e` - Exécute tous les tests E2E
4. Upload rapport Playwright

- **Durée** : ~8-15 min
- **Requis** : Oui, doit réussir pour les PRs
- **Rapport** : Disponible dans les artefacts de la run

---

### 4. **mutation-testing** 🧬

Validation de la qualité des tests via mutation de code.

**Conditions d'exécution** :

```
SI schedule (Lundi 2h) → pnpm test:mutation        # Complet
SINON push (main/dev) → pnpm test:mutation:critical # Chemins critiques
SINON PR + fichiers critiques → pnpm test:mutation:critical
SINON PR → SKIP
```

**Portée** :

- `src/lib/server/**/*.ts` - Code serveur
- `app/admin/actions.ts` - Actions admin
- `src/lib/utils/**/*.ts` - Utilitaires

- **Durée** : ~15-45 min (dépend de la portée)
- **Requis** : Non (optionnel conditionnel)
- **Rapport** : HTML généré dans `reports/mutation/html`
- **Commentaire PR** : Si échec, commente la PR avec lien au rapport

---

### 5. **build** 🏗️

Compile l'application Next.js et analyse le bundle.

**Étapes** :

1. `pnpm build` - Build production Next.js
2. `pnpm bundle:analyze` - Analyse bundle size
3. Upload artefacts `.next/` (5 jours rétention)

- **Durée** : ~10-15 min
- **Requis** : Dépend de standard-quality et e2e-tests
- **Artefacts** : `.next/` directory

---

### 6. **ci-success** ✅

Vérification finale du statut global du pipeline.

Marque le pipeline comme succès/échec en fonction des résultats de :

- `standard-quality`
- `e2e-tests`
- `build`

Note : Le mutation-testing n'est pas requis pour le succès global.

---

## Timings Approximatifs

| Job                         | Rapide | Normal | Lent |
| --------------------------- | ------ | ------ | ---- |
| detect-changes              | 30s    | 30s    | 30s  |
| standard-quality            | 5m     | 8m     | 10m  |
| e2e-tests                   | 8m     | 12m    | 15m  |
| build                       | 8m     | 12m    | 15m  |
| mutation-testing (critical) | -      | 15m    | 30m  |
| mutation-testing (complet)  | -      | 30m    | 45m  |
| **Total PR normal**         | ~15m   | ~25m   | ~35m |
| **Total PR critical**       | ~23m   | ~35m   | ~50m |
| **Total schedule**          | -      | ~60m   | ~80m |

---

## Cache Strategy

Tous les jobs utilisent le cache pnpm automatiquement via `actions/setup-node@v4` avec `cache: 'pnpm'`.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'
```

**Avantages** :

- Pas besoin de réinstaller `node_modules` si `pnpm-lock.yaml` inchangé
- ~80% de gain de temps sur les runs suivantes

---

## Concurrency

Le pipeline utilise la stratégie de concurrence pour optimiser les ressources :

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Comportement** :

- Une seule run par branch à la fois
- Les runs précédentes sont annulées si une nouvelle arrive
- Évite les runs inutiles quand on pousse rapidement

---

## Artefacts Générés

| Artefact              | Durée    | Chemin                   |
| --------------------- | -------- | ------------------------ |
| **Coverage Report**   | -        | `coverage/`              |
| **Playwright Report** | 14 jours | `playwright-report/`     |
| **Mutation Report**   | 30 jours | `reports/mutation/html/` |
| **Build Output**      | 5 jours  | `.next/`                 |

## Accès aux Rapports

Après chaque run GitHub Actions :

1. **Summary Page** : `https://github.com/USER/REPO/actions/runs/RUN_ID`
2. **Artifacts** : Onglet "Artifacts" (bas de page)
3. **Logs** : Onglet "Logs" pour chaque job
4. **Playlist Report** : Cliquer sur artefact `playwright-report`

---

## Troubleshooting

### Mutation testing échoue sur PR

**Cause** : Vos tests n'attrapent pas assez de bugs (mutations).

**Solution** :

1. Téléchargez le rapport de mutation
2. Lisez les mutations qui passent inaperçues
3. Améliorez les tests correspondants

### E2E tests timeout

**Cause** : Tests Playwright trop lents ou site non réactif.

**Solution** :

1. Augmentez `timeout-minutes: 30` dans le workflow
2. Vérifiez la performance du site
3. Optimisez les tests Playwright

### Build échoue avec TypeScript

**Cause** : Erreurs de type détectées.

**Solution** :

```bash
pnpm tsc          # Vérifier localement
pnpm lint:fix     # Auto-fixer les erreurs ESLint
```

---

## Configuration Locale

Pour simuler le pipeline en local :

```bash
# Format check
pnpm format:check

# Linting
pnpm lint
pnpm lint:fix

# Tests
pnpm test
pnpm test:coverage
pnpm test:e2e

# Architecture
pnpm arch:validate

# Build
pnpm build

# Mutation (lent)
pnpm test:mutation:critical

# Tout ensemble
pnpm quality:check
```

---

## Secrets & Permissions

Le workflow ne nécessite **aucun secret** pour fonctionner.

**Permissions requis** (par défaut) :

- `contents: read` - Lire le code
- `pull-requests: write` - Commenter les PRs (mutation-testing)

---

## Intégration Branch Protection

Pour forcer le succès du pipeline avant merge :

1. Allez dans **Settings** > **Branches** > **Add rule**
2. Branch name pattern: `main` ou `develop`
3. Cochez **Require status checks to pass before merging**
4. Sélectionnez :
   - ✅ `Code Quality (Lint, Format, Architecture, Tests)`
   - ✅ `E2E Tests (Playwright)`
   - ✅ `Build Next.js Application`
5. Optionnel : `Mutation Testing` (ne pas cocher, c'est optionnel)

---

## Monitoring & Dashboards

### GitHub Actions

- Vue d'ensemble : https://github.com/USER/REPO/actions
- Workflow spécifique : https://github.com/USER/REPO/actions/workflows/quality.yml

### Codecov (si configuré)

- Voir rapport de couverture : https://codecov.io/gh/USER/REPO

### Alertes

Vous pouvez configurer des notifications Slack/Discord pour les échecs :

- Dans **Settings** > **Notifications** (GitHub)
- Ou utiliser des GitHub Apps tierces

---

## Maintenance

### Mises à jour

Périodiquement, vérifiez les versions des actions :

```bash
# Vérifier les versions utilisées
grep "uses:" .github/workflows/quality.yml

# Sites utiles :
# - https://github.com/actions
# - https://github.com/pnpm/action-setup
# - https://github.com/codecov/codecov-action
```

### Optimisation

Si les runs sont trop lentes :

1. **Augmentez le cache** : Vérifiez que `pnpm-lock.yaml` est stable
2. **Parallélisez davantage** : Certains jobs pourraient être indépendants
3. **Réduisez la portée mutation** : Limitez `mutate` dans `stryker.config.json`
4. **Optimisez les tests E2E** : Réduisez le nombre de tests ou parallelisez-les

---

## Prochaines Étapes

- [ ] Configurer Branch Protection Rules
- [ ] Intégrer Codecov pour la couverture
- [ ] Ajouter notifications Slack/Discord
- [ ] Configurer automatic deployments (Post-V1)
- [ ] Ajouter security scanning (e.g., SAST, dependency check)
