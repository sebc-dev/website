# STORY: Refonte de l'Architecture des Tests E2E pour Cloudflare Workers

## Metadata

- **Type**: Story Technique
- **Epic**: Infrastructure & Testing
- **Priority**: P0 (Critique)
- **Effort**: 8 points
- **Status**: Planifié
- **Created**: 2025-01-19
- **Related Documents**:
  - `/docs/guide_cloudflare_playwright.md` (Guide de référence)
  - `/docs/specs/PRD_CLOUDFLARE_E2E_TESTING.md` (à créer si besoin de PRD formel)

---

## 1. Contexte et Problématique

### 1.1 Situation Actuelle

Notre projet Next.js 15 est déployé sur **Cloudflare Workers** via l'adaptateur **OpenNext** (`@opennextjs/cloudflare`). Actuellement, les tests E2E Playwright s'exécutent contre le serveur de développement Next.js (`pnpm dev`) ou le serveur de production Node.js (`pnpm start`), **pas contre le runtime Cloudflare Workers** (`workerd`).

**Conséquences:**
- ❌ Les tests ne valident **pas** le comportement réel de l'application en production
- ❌ Les bugs spécifiques au runtime Edge (limitations I/O, API manquantes, contraintes mémoire) ne sont **pas détectés**
- ❌ Les tests E2E sont **désactivés en CI** depuis plusieurs semaines à cause de timeouts inexpliqués
- ❌ Risque élevé de régressions silencieuses lors des déploiements

### 1.2 Architecture Cible

Selon le guide exhaustif `/docs/guide_cloudflare_playwright.md` (édition 2025), l'architecture recommandée est:

```
┌─────────────────────────────────────────────────────────┐
│  Playwright Test Runner                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ globalSetup (tests/global-setup.ts)             │   │
│  │ → Seed D1 database (wrangler d1 execute --local)│   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  webServer: pnpm preview                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. opennextjs-cloudflare build                  │   │
│  │    → Génère .open-next/worker.js                │   │
│  │    → Génère .open-next/assets/                  │   │
│  │                                                  │   │
│  │ 2. wrangler dev --port 8788 --ip 127.0.0.1      │   │
│  │    → Lance workerd runtime (pas Node.js!)       │   │
│  │    → Lie D1, R2, Durable Objects                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Tests: http://127.0.0.1:8788                           │
│  (IPv4 forcé pour éviter race conditions IPv6)          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Analyse des Écarts (Gap Analysis)

Voici le résultat de l'audit complet de la configuration actuelle:

| Composant | État Actuel | État Cible | Gap | Priorité |
|-----------|-------------|------------|-----|----------|
| **Runtime de Test** | Node.js (`next dev`/`start`) | Cloudflare Workers (`wrangler dev`) | **CRITIQUE** | P0 |
| **Base URL** | `localhost:3000` | `http://127.0.0.1:8788` | **CRITIQUE** | P0 |
| **Commande webServer** | `pnpm dev` (local), `pnpm start` (CI) | `pnpm preview` (wrangler dev) | **CRITIQUE** | P0 |
| **IPv4 Forcing** | ❌ Absent | `--ip 127.0.0.1` dans wrangler | **CRITIQUE** | P0 |
| **D1 Seeding** | Scripts existent mais non automatisés | `globalSetup` hook Playwright | **HIGH** | P1 |
| **CI E2E Tests** | ❌ Désactivés (timeout) | ✅ Activés et stables | **CRITIQUE** | P0 |
| **Cloudflare Secrets** | ❌ Non configurés | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | **MEDIUM** | P1 |
| **wrangler.jsonc** | ✅ Parfait (nodejs_compat, assets, bindings) | ✅ Conforme | ✅ OK | - |
| **open-next.config.ts** | ✅ Excellent (R2 cache, DO queue, sharding) | ✅ Conforme | ✅ OK | - |
| **Qualité des Tests** | ✅ Excellente (auto-waiting, fixtures, mobile) | ✅ Maintenir | ✅ OK | - |

**Score de Conformité Global: 61%**

---

## 2. Objectifs de la Story

### 2.1 Objectifs Fonctionnels

- **OF1**: Les tests E2E doivent s'exécuter contre le runtime Cloudflare Workers (`workerd`), pas Node.js
- **OF2**: La base de données D1 doit être réinitialisée automatiquement avant chaque run de tests
- **OF3**: Les tests doivent passer de manière stable en local ET en CI
- **OF4**: Les tests CI doivent être réactivés et intégrés dans la quality gate

### 2.2 Objectifs Non-Fonctionnels

- **ONF1**: Temps de démarrage du serveur de test < 120s (incluant build OpenNext)
- **ONF2**: Élimination complète des "flaky tests" liés à IPv6/IPv4
- **ONF3**: Isolation des tests: chaque run doit démarrer avec un état DB connu
- **ONF4**: Logs clairs et exploitables en cas d'échec (stdout/stderr capturés)

### 2.3 Critères d'Acceptance (AC)

**AC1**: La configuration `playwright.config.ts` utilise `baseURL: 'http://127.0.0.1:8788'`

**AC2**: La commande `webServer.command` est `pnpm preview` qui lance wrangler dev

**AC3**: Le script `preview` dans `package.json` force IPv4: `wrangler dev --port 8788 --ip 127.0.0.1`

**AC4**: Un fichier `tests/global-setup.ts` existe et:
- Applique les migrations D1 (`wrangler d1 migrations apply DB --local`)
- Seed les données de test (`categories.sql`, `sample-articles.sql`)
- Logue clairement chaque étape
- Throw une erreur bloquante en cas d'échec

**AC5**: Le fichier `playwright.config.ts` référence `globalSetup: require.resolve('./tests/global-setup')`

**AC6**: Le workflow CI `.github/workflows/quality.yml` contient un job `e2e-tests` actif avec:
- Variables d'environnement `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID`
- Étape explicite de build worker
- Exécution de `pnpm test:e2e`

**AC7**: Les 3 tests existants passent avec succès:
- `tests/compression.spec.ts` (compression Brotli/Gzip)
- `tests/middleware.spec.ts` (i18n routing)
- `tests/i18n-edge-cases.spec.ts` (edge cases i18n)

**AC8**: La commande `pnpm test:e2e` passe localement sans erreur

**AC9**: La commande `pnpm test:e2e` passe en CI sans timeout

**AC10**: Les logs montrent clairement que wrangler dev démarre sur `127.0.0.1:8788`

---

## 3. Architecture Technique Détaillée

### 3.1 Modification de `playwright.config.ts`

**Fichier**: `/home/negus/dev/website/playwright.config.ts`

**Changements requis:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // Séquentiel en CI pour stabilité
  reporter: 'html',

  // ✅ CHANGEMENT 1: GlobalSetup pour D1 seeding
  globalSetup: require.resolve('./tests/global-setup'),

  use: {
    // ✅ CHANGEMENT 2: Base URL avec IPv4 forcé + port Wrangler
    baseURL: 'http://127.0.0.1:8788',

    trace: 'on-first-retry',
    video: 'on-first-retry',
  },

  webServer: {
    // ✅ CHANGEMENT 3: Commande preview au lieu de dev/start
    command: 'pnpm preview',

    // ✅ CHANGEMENT 4: URL de santé avec IPv4 + port Wrangler
    url: 'http://127.0.0.1:8788',

    reuseExistingServer: !process.env.CI,

    // ✅ CHANGEMENT 5: Timeout étendu pour build OpenNext (cold start)
    timeout: 120 * 1000, // 2 minutes

    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

**Justifications techniques:**

1. **IPv4 Forcing (`127.0.0.1`)**: Node.js 20+ peut résoudre `localhost` en IPv6 (`::1`) de manière imprévisible. Si wrangler écoute sur IPv4 mais Playwright se connecte en IPv6, résultat: `ECONNREFUSED`. Le guide insiste sur ce point comme cause majeure de flakiness.

2. **Port 8788**: Port par défaut de `wrangler dev`. Utiliser un port différent nécessite de configurer wrangler ET playwright de manière synchronisée.

3. **Timeout 120s**: Le "cold start" de `opennextjs-cloudflare build` + démarrage de wrangler peut prendre 60-90s sur des machines CI limitées (2 vCPU). 120s est le minimum recommandé par le guide.

4. **Workers=1 en CI**: Les runners GitHub Actions standard (2 vCPU, 7 Go RAM) saturent rapidement avec plusieurs navigateurs en parallèle + wrangler + application Next.js. L'exécution séquentielle est plus lente mais infiniment plus stable.

---

### 3.2 Modification de `package.json`

**Fichier**: `/home/negus/dev/website/package.json`

**Script `preview` actuel:**
```json
"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"
```

**Script `preview` cible:**
```json
"preview": "opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1"
```

**Justification:**

Le guide recommande d'utiliser directement `wrangler dev` plutôt que `opennextjs-cloudflare preview` pour avoir un contrôle total sur les flags:
- `--port 8788`: Port explicite (pas de détection automatique)
- `--ip 127.0.0.1`: Force l'écoute IPv4

**Alternative (si OpenNext CLI doit être conservé):**

Vérifier si `opennextjs-cloudflare preview` accepte des flags de passage à wrangler:
```json
"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview --port 8788 --ip 127.0.0.1"
```

**Action requise**: Tester les deux approches et choisir celle qui garantit IPv4 + port 8788.

---

### 3.3 Création de `tests/global-setup.ts`

**Fichier**: `/home/negus/dev/website/tests/global-setup.ts` (nouveau)

**Contenu complet:**

```typescript
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * GlobalSetup Playwright - Initialisation de D1 pour les tests E2E
 *
 * Ce script s'exécute UNE SEULE FOIS avant tous les tests.
 * Il garantit un état de base de données propre et prévisible.
 *
 * Référence: /docs/guide_cloudflare_playwright.md section 5.3
 */
async function globalSetup() {
  console.log('🚀 [GlobalSetup] Démarrage de l\'initialisation D1...');

  // Optionnel: Purge complète du cache local D1 pour garantir un état vierge
  // Décommenter si nécessaire pour des tests ultra-isolés
  const d1StatePath = path.join(process.cwd(), '.wrangler/state/v3/d1');
  if (fs.existsSync(d1StatePath)) {
    console.log('   🗑️  Purge du cache local D1...');
    fs.rmSync(d1StatePath, { recursive: true, force: true });
  }

  try {
    // Étape 1: Application du schéma (Migrations)
    console.log('   📋 Application des migrations D1...');
    execSync('pnpm wrangler d1 migrations apply DB --local', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    // Étape 2: Seed des données de test (Categories)
    console.log('   🌱 Seed des catégories...');
    execSync('pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    // Étape 3: Seed des données de test (Articles)
    console.log('   📄 Seed des articles de test...');
    execSync('pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    console.log('   ✅ Base de données D1 initialisée avec succès\n');
  } catch (error) {
    console.error('   ❌ ERREUR CRITIQUE lors de l\'initialisation D1');
    console.error(error);

    // IMPORTANT: Throw l'erreur pour bloquer l'exécution des tests
    // Si la DB n'est pas prête, les tests produiront des faux négatifs
    throw new Error('Échec de l\'initialisation de la base de données D1');
  }
}

export default globalSetup;
```

**Points techniques critiques:**

1. **Flag `--local`**: ABSOLUMENT CRITIQUE. Sans ce flag, la commande ciblerait la base de données de production sur le cloud. Le guide insiste lourdement sur ce point (section 5.2).

2. **Purge optionnelle**: Commentée par défaut, mais peut être activée si des tests laissent des traces malgré le seeding. La purge garantit un état vierge absolu.

3. **Ordre des seeds**: Categories avant Articles (contrainte de clé étrangère probable).

4. **Gestion d'erreurs**: Si une étape échoue, on throw pour bloquer immédiatement. Exécuter les tests avec une DB mal initialisée créerait des échecs trompeurs.

5. **Utilisation de `pnpm`**: Adapter la syntaxe au package manager du projet.

---

### 3.4 Modification du Workflow CI

**Fichier**: `.github/workflows/quality.yml`

**Section E2E actuelle (désactivée):**

```yaml
e2e-tests:
  name: E2E Tests (Playwright)
  needs: build
  timeout-minutes: 30
  runs-on: ubuntu-latest

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright Browsers
      run: pnpm exec playwright install --with-deps

    # DÉSACTIVÉ: Tests E2E (timeout issues)
```

**Section E2E cible (réactivée):**

```yaml
e2e-tests:
  name: E2E Tests (Playwright)
  timeout-minutes: 60  # ✅ Augmenté pour cold start wrangler
  runs-on: ubuntu-latest

  env:
    CI: true
    # ✅ NOUVEAU: Injection des secrets Cloudflare
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright Browsers
      # ✅ --with-deps: Installe dépendances système Linux (GTK, GStreamer)
      # Indispensable pour WebKit et Firefox en mode headless sur Ubuntu
      run: pnpm exec playwright install --with-deps

    # ✅ NOUVEAU: Build explicite du worker OpenNext
    - name: Build OpenNext Worker
      run: pnpm run build && pnpm exec opennextjs-cloudflare build

    # ✅ RÉACTIVÉ: Exécution des tests E2E
    - name: Run E2E Tests
      run: pnpm test:e2e

    # ✅ Upload des rapports (toujours, même en cas d'échec)
    - name: Upload Playwright Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

**Changements clés:**

1. **Timeout 60min**: Le guide recommande 60min pour GitHub Actions. Le build OpenNext + tests peut être long en cold start.

2. **Secrets Cloudflare**: Nécessaires pour que wrangler s'authentifie (même en mode `--local`, wrangler peut vérifier les droits).

3. **Build explicite**: Séparer `pnpm run build` (Next.js) de `opennextjs-cloudflare build` (transformation en Worker) pour des logs plus clairs.

4. **Upload artifacts**: Critique pour déboguer les échecs en CI. Le rapport HTML Playwright avec traces vidéo/screenshots est uploadé.

---

### 3.5 Configuration des Secrets GitHub

**Actions requises (manuel):**

1. Aller dans `Settings` > `Secrets and variables` > `Actions` du repository GitHub

2. Créer deux secrets:

   **Secret 1: `CLOUDFLARE_API_TOKEN`**
   - Générer sur Cloudflare Dashboard > My Profile > API Tokens
   - Permissions requises: `Workers Scripts:Edit`, `D1:Edit`, `Account Settings:Read`
   - Valeur: Le token API généré

   **Secret 2: `CLOUDFLARE_ACCOUNT_ID`**
   - Trouver dans Cloudflare Dashboard > Workers & Pages > Overview
   - Format: Une chaîne hexadécimale longue (ex: `abc123def456...`)

3. Vérifier que les secrets sont bien injectés dans le workflow:
   ```yaml
   env:
     CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
     CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
   ```

**Sécurité:**
- ❌ Ne JAMAIS commiter ces valeurs en clair dans le code
- ✅ Utiliser uniquement GitHub Secrets
- ✅ Limiter les permissions du token au strict minimum

---

## 4. Plan d'Implémentation par Phases

### Phase 1: Configuration Locale (Pré-requis)

**Durée estimée**: 1-2h

**Tâches:**

1. **Modifier `package.json`**
   - [ ] Mettre à jour le script `preview` avec `--port 8788 --ip 127.0.0.1`
   - [ ] Tester manuellement: `pnpm preview` doit démarrer wrangler sur `127.0.0.1:8788`
   - [ ] Vérifier dans les logs: `[wrangler:inf] Ready on http://127.0.0.1:8788`

2. **Créer `tests/global-setup.ts`**
   - [ ] Créer le fichier avec le contenu complet (section 3.3)
   - [ ] Tester manuellement: `pnpm exec tsx tests/global-setup.ts`
   - [ ] Vérifier que les migrations + seeds s'exécutent sans erreur

3. **Modifier `playwright.config.ts`**
   - [ ] Changer `baseURL` → `http://127.0.0.1:8788`
   - [ ] Changer `webServer.command` → `pnpm preview`
   - [ ] Changer `webServer.url` → `http://127.0.0.1:8788`
   - [ ] Ajouter `globalSetup: require.resolve('./tests/global-setup')`
   - [ ] Augmenter timeout → `120 * 1000`

**Validation Phase 1:**
```bash
pnpm test:e2e
```
- [ ] Le serveur démarre sur `127.0.0.1:8788`
- [ ] Le globalSetup s'exécute avec succès
- [ ] Les 3 tests existants passent (compression, middleware, i18n)

---

### Phase 2: Stabilisation et Debug

**Durée estimée**: 2-4h

**Tâches:**

1. **Résolution des erreurs de build**
   - [ ] Si `opennextjs-cloudflare build` échoue, examiner les logs
   - [ ] Vérifier que `.open-next/worker.js` est bien généré
   - [ ] Vérifier que `.open-next/assets/` contient les fichiers statiques

2. **Résolution des timeouts**
   - [ ] Si timeout < 120s, augmenter progressivement
   - [ ] Vérifier que wrangler démarre dans les logs Playwright
   - [ ] Si blocage à la fin, vérifier que wrangler se termine proprement

3. **Validation des tests existants**
   - [ ] `compression.spec.ts`: Vérifier que Brotli/Gzip fonctionnent sur wrangler
   - [ ] `middleware.spec.ts`: Vérifier que i18n routing fonctionne
   - [ ] `i18n-edge-cases.spec.ts`: Vérifier les edge cases

4. **Debug D1**
   - [ ] Si erreurs DB, vérifier que `DB` binding existe dans `wrangler.jsonc`
   - [ ] Vérifier que les fichiers SQL dans `/drizzle/seeds/` sont valides
   - [ ] Tester manuellement: `pnpm wrangler d1 execute DB --local --command "SELECT * FROM categories"`

**Validation Phase 2:**
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```
- [ ] Tous les tests passent sur les 3 moteurs
- [ ] Aucun "flaky test" (relancer 3 fois pour confirmer)
- [ ] Temps total < 5 minutes en local

---

### Phase 3: Intégration CI

**Durée estimée**: 2-3h

**Tâches:**

1. **Configurer les secrets GitHub**
   - [ ] Créer `CLOUDFLARE_API_TOKEN` dans GitHub Secrets
   - [ ] Créer `CLOUDFLARE_ACCOUNT_ID` dans GitHub Secrets
   - [ ] Vérifier que les secrets sont bien masqués dans les logs

2. **Modifier `.github/workflows/quality.yml`**
   - [ ] Ajouter les variables d'environnement Cloudflare
   - [ ] Ajouter l'étape "Build OpenNext Worker"
   - [ ] Réactiver l'étape "Run E2E Tests"
   - [ ] Ajouter l'upload des artifacts Playwright

3. **Push et validation CI**
   - [ ] Créer une branche de test: `git checkout -b test/e2e-refactor`
   - [ ] Commiter les changements avec Gitmoji: `git commit -m "🧪 Refactor E2E tests for Cloudflare Workers runtime"`
   - [ ] Pusher: `git push origin test/e2e-refactor`
   - [ ] Créer une Pull Request de test
   - [ ] Observer les logs du job `e2e-tests` dans GitHub Actions

4. **Debug CI (si échec)**
   - [ ] Télécharger l'artifact `playwright-report`
   - [ ] Examiner les traces vidéo/screenshots
   - [ ] Vérifier les logs de build OpenNext
   - [ ] Vérifier que wrangler démarre correctement

**Validation Phase 3:**
- [ ] Le job CI `e2e-tests` passe au vert
- [ ] Durée totale du job < 15 minutes
- [ ] Aucune erreur de timeout
- [ ] Les artifacts sont bien uploadés

---

### Phase 4: Documentation et Formation

**Durée estimée**: 1h

**Tâches:**

1. **Mettre à jour `/docs/guide_cloudflare_playwright.md`**
   - [ ] Ajouter une section "Implementation Completed" avec date
   - [ ] Documenter les choix d'implémentation spécifiques au projet

2. **Mettre à jour `CLAUDE.md`**
   - [ ] Ajouter une note sur l'architecture E2E dans la section "Testing"
   - [ ] Documenter le processus de seeding D1 pour les futurs tests

3. **Créer un README dans `/tests`**
   - [ ] Créer `/tests/README.md`
   - [ ] Documenter comment ajouter un nouveau test E2E
   - [ ] Documenter comment déboguer un test qui échoue
   - [ ] Documenter les fixtures existantes

4. **Communication à l'équipe**
   - [ ] Partager le changement d'architecture
   - [ ] Expliquer pourquoi `pnpm dev` n'est plus utilisé pour les tests
   - [ ] Former sur l'utilisation de `pnpm preview` pour les tests manuels

---

## 5. Risques et Mitigations

### 5.1 Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **R1**: Timeout CI > 60min | Moyenne | Élevé | Augmenter timeout à 90min si nécessaire, optimiser build cache |
| **R2**: Tests existants cassés sur wrangler | Moyenne | Élevé | Phase 2 dédiée au debug, rollback possible |
| **R3**: Problèmes de compatibilité OpenNext | Faible | Critique | Vérifier version `@opennextjs/cloudflare` à jour, consulter changelog |
| **R4**: Secrets Cloudflare non configurés | Faible | Moyen | Documentation claire (section 3.5), validation manuelle avant CI |
| **R5**: Race conditions IPv6/IPv4 persistent | Faible | Moyen | Double vérification du flag `--ip 127.0.0.1`, test sur plusieurs OS |
| **R6**: D1 seeding échoue en CI | Moyenne | Élevé | Logs verbeux, validation manuelle du globalSetup, fichiers SQL testés |

### 5.2 Plan de Rollback

Si l'implémentation échoue de manière bloquante:

1. **Restaurer `playwright.config.ts`**:
   ```typescript
   baseURL: 'http://localhost:3000',
   webServer: { command: 'pnpm dev', url: 'http://localhost:3000' }
   ```

2. **Restaurer `package.json`**:
   ```json
   "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"
   ```

3. **Supprimer `tests/global-setup.ts`** (ou le désactiver dans playwright.config)

4. **Garder les tests CI désactivés** jusqu'à résolution

**Critère de rollback**: Si > 3 jours de debug sans succès, rollback et réévaluation de l'approche.

---

## 6. Validation et Tests de Non-Régression

### 6.1 Checklist de Validation Locale

Avant de pousser en CI, valider localement:

```bash
# 1. Clean build
rm -rf .next .open-next node_modules/.cache

# 2. Réinstaller les dépendances
pnpm install

# 3. Tester le build worker
pnpm run build
pnpm exec opennextjs-cloudflare build

# 4. Vérifier que les artefacts existent
ls -la .open-next/worker.js
ls -la .open-next/assets/

# 5. Tester preview manuellement
pnpm preview
# → Ouvrir http://127.0.0.1:8788 dans le navigateur
# → Vérifier que le site fonctionne
# → Ctrl+C pour arrêter

# 6. Tester globalSetup isolé
pnpm exec tsx tests/global-setup.ts
# → Doit afficher les logs de seeding sans erreur

# 7. Exécuter les tests E2E
pnpm test:e2e
# → Tous les tests doivent passer

# 8. Re-run pour vérifier stabilité
pnpm test:e2e
pnpm test:e2e
# → Aucun "flaky test"
```

### 6.2 Checklist de Validation CI

Après push sur une branche de test:

```bash
# 1. Créer une PR de test
git checkout -b test/e2e-cloudflare-refactor
git add .
git commit -m "🧪 test: Refactor E2E architecture for Cloudflare Workers"
git push origin test/e2e-cloudflare-refactor

# 2. Observer le job GitHub Actions
# → Aller dans "Actions" tab
# → Cliquer sur le workflow run
# → Observer les logs du job "e2e-tests"

# 3. Vérifier les étapes critiques
# → "Build OpenNext Worker": doit passer en < 5min
# → "Run E2E Tests": doit passer en < 10min
# → Logs doivent montrer "Ready on http://127.0.0.1:8788"

# 4. Télécharger les artifacts
# → Cliquer sur "Artifacts" en bas de page
# → Télécharger "playwright-report"
# → Ouvrir playwright-report/index.html
# → Vérifier que tous les tests sont verts

# 5. Merger si succès
# → Merger la PR dans main
# → Surveiller le déploiement
```

---

## 7. Métriques de Succès

### 7.1 Métriques Quantitatives

| Métrique | Baseline (Avant) | Cible (Après) | Mesure |
|----------|------------------|---------------|--------|
| **Runtime des tests** | Node.js | workerd | Vérifier logs wrangler |
| **Taux de succès CI** | 0% (désactivé) | > 95% | 19/20 runs passent |
| **Durée E2E job CI** | N/A (timeout) | < 15min | Moyenne sur 10 runs |
| **Flaky tests** | Inconnu | 0 | 10 runs consécutifs identiques |
| **Temps de démarrage serveur** | ~30s (next dev) | < 120s (wrangler) | Logs Playwright |
| **Couverture navigateurs** | 3 (Chromium, Firefox, WebKit) | 3 (maintenu) | playwright.config projects |

### 7.2 Métriques Qualitatives

- [ ] **Confiance de l'équipe**: Les développeurs font confiance aux tests E2E
- [ ] **Documentation**: Un nouveau dev peut ajouter un test E2E sans aide
- [ ] **Debugging**: Les échecs sont faciles à diagnostiquer (traces, vidéos, logs)
- [ ] **Maintenabilité**: La config est claire et bien commentée

---

## 8. Références et Resources

### 8.1 Documents Internes

- `/docs/guide_cloudflare_playwright.md` - Guide complet d'architecture E2E (édition 2025)
- `/docs/specs/STORY_E2E_CLOUDFLARE_REFACTOR.md` - Ce document
- `CLAUDE.md` - Instructions projet pour Claude Code
- `/tests/README.md` - Documentation tests (à créer en Phase 4)

### 8.2 Documentation Externe

1. **Playwright**:
   - [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
   - [Global Setup and Teardown](https://playwright.dev/docs/test-global-setup-teardown)
   - [webServer Configuration](https://playwright.dev/docs/test-webserver)

2. **Cloudflare Workers**:
   - [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
   - [Local Development](https://developers.cloudflare.com/workers/wrangler/commands/#dev)
   - [D1 Local Development](https://developers.cloudflare.com/d1/best-practices/local-development/)

3. **OpenNext**:
   - [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare/get-started)
   - [Configuration Reference](https://opennext.js.org/cloudflare/config)
   - [Migration Guide](https://opennext.js.org/cloudflare/former-releases/migrate-from-0.2-to-0.3)

4. **Next.js 15**:
   - [Deployment on Cloudflare](https://nextjs.org/docs/app/building-your-application/deploying#cloudflare)
   - [Testing Next.js Applications](https://nextjs.org/docs/app/building-your-application/testing/playwright)

### 8.3 Issues et Troubleshooting

Si problèmes, consulter ces issues GitHub:

- [wrangler dev hangs in CI](https://github.com/cloudflare/workers-sdk/issues/6280) - Issue #6280
- [IPv6 localhost resolution](https://github.com/cloudflare/workers-sdk/issues/9789) - Issue #9789
- [OpenNext migration guide](https://github.com/opennextjs/opennextjs-cloudflare/issues) - Repository issues

---

## 9. Annexes

### Annexe A: Commandes Utiles

```bash
# Debug: Vérifier la version de wrangler
pnpm wrangler --version

# Debug: Lister les bases D1 locales
pnpm wrangler d1 list --local

# Debug: Explorer la DB D1 locale
pnpm wrangler d1 execute DB --local --command "SELECT * FROM sqlite_master WHERE type='table'"

# Debug: Vérifier que les bindings sont détectés
pnpm wrangler dev --show-interactive-dev-session

# Debug: Logs verbeux de wrangler
WRANGLER_LOG=debug pnpm preview

# Debug: Tester un seul fichier de test
pnpm test:e2e tests/compression.spec.ts

# Debug: Mode UI interactif Playwright
pnpm test:e2e:ui

# Debug: Mode debug avec breakpoints
pnpm test:e2e:debug
```

### Annexe B: Structure Finale des Fichiers

```
/home/negus/dev/website/
├── playwright.config.ts          # ✅ Modifié (baseURL, webServer, globalSetup)
├── package.json                  # ✅ Modifié (script preview)
├── wrangler.jsonc                # ✅ Déjà conforme (pas de changement)
├── open-next.config.ts           # ✅ Déjà conforme (pas de changement)
├── tests/
│   ├── global-setup.ts           # ✅ NOUVEAU (D1 seeding)
│   ├── README.md                 # ✅ NOUVEAU (Phase 4)
│   ├── compression.spec.ts       # ✅ Existant (pas de changement)
│   ├── middleware.spec.ts        # ✅ Existant (pas de changement)
│   ├── i18n-edge-cases.spec.ts   # ✅ Existant (pas de changement)
│   └── fixtures/
│       ├── compression.ts        # ✅ Existant (pas de changement)
│       └── i18n.ts               # ✅ Existant (pas de changement)
├── .github/workflows/
│   └── quality.yml               # ✅ Modifié (réactivation E2E, secrets)
└── docs/
    └── specs/
        └── STORY_E2E_CLOUDFLARE_REFACTOR.md  # ✅ Ce document
```

### Annexe C: Exemple de Log de Succès

**Log local attendu:**

```
$ pnpm test:e2e

> website@1.0.0 test:e2e /home/negus/dev/website
> playwright test

🚀 [GlobalSetup] Démarrage de l'initialisation D1...
   🗑️  Purge du cache local D1...
   📋 Application des migrations D1...
✅ Applying migration 0001_create_categories.sql
✅ Applying migration 0002_create_articles.sql
   🌱 Seed des catégories...
   📄 Seed des articles de test...
   ✅ Base de données D1 initialisée avec succès

Starting webServer: pnpm preview
> website@1.0.0 preview /home/negus/dev/website
> opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1

Building .open-next...
✓ Build completed in 23.4s

 ⛅️ wrangler 3.95.0
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://127.0.0.1:8788
⎔ Listening on http://127.0.0.1:8788

Running 15 tests using 1 worker

  ✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (chromium)
  ✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (firefox)
  ✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (webkit)
  ✓ tests/middleware.spec.ts:8:5 › should redirect /fr to /fr/ (chromium)
  ...

  15 passed (2.3m)

To open last HTML report run:
  pnpm exec playwright show-report
```

**Log CI attendu (GitHub Actions):**

```
Run pnpm test:e2e
🚀 [GlobalSetup] Démarrage de l'initialisation D1...
...
✅ Base de données D1 initialisée avec succès

Starting webServer: pnpm preview
[wrangler:inf] Ready on http://127.0.0.1:8788

Running 15 tests using 1 worker
  15 passed (8.7m)

##[section]Finishing: Run E2E Tests
```

---

## 10. Conclusion

Cette story représente un pivot architectural majeur pour garantir la qualité de notre application Next.js sur Cloudflare Workers. L'investissement initial (estimé à 12-16h de travail) sera rapidement amorti par:

1. **Détection précoce des bugs Edge** avant production
2. **Confiance accrue** dans les déploiements (quality gate fonctionnelle)
3. **Réduction des incidents** liés aux différences Node.js vs workerd
4. **Conformité aux best practices 2025** de l'écosystème Cloudflare

Les critères de succès sont clairs et mesurables. La phase d'implémentation est découpée en étapes incrémentales avec des points de validation réguliers.

**Next Steps:**
1. Validation de cette spec par l'équipe technique
2. Création d'un ticket JIRA/Linear avec estimation formelle
3. Planification dans le prochain sprint
4. Assignation à un développeur senior (familier avec Playwright + Cloudflare)

**Signature:**
- **Auteur**: Claude Code (AI Assistant)
- **Reviewer**: [À compléter]
- **Date**: 2025-01-19
- **Version**: 1.0.0
