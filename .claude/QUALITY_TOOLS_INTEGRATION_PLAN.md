# 📋 Plan d'Intégration Complet - Outils de Qualité de Code

**Date de création** : 2025-11-09
**Contexte** : Développement assisté par IA (Claude Code) + Blog technique Next.js 15
**Objectif** : Augmenter la qualité de code et créer des garde-fous automatisés contre les erreurs courantes de l'IA

---

## 🎯 Vue d'Ensemble

### Outils Intégrés (V1)

| Outil                     | Objectif                              |  ROI   | Effort |
| :------------------------ | :------------------------------------ | :----: | :----: |
| **ESLint Flat Config**    | Détection bugs TypeScript/Next.js/MDX | 🔥🔥🔥 |  ⭐⭐  |
| **Prettier + Tailwind**   | Formatage automatique classes         | 🔥🔥🔥 |   ⭐   |
| **dependency-cruiser**    | Validation frontières client/serveur  | 🔥🔥🔥 |   ⭐   |
| **Stryker.js**            | Validation qualité tests IA           | 🔥🔥🔥 | ⭐⭐⭐ |
| **@next/bundle-analyzer** | Détection erreurs bundling            |  🔥🔥  |   ⭐   |
| **TSDoc validation**      | Documentation typée                   |   🔥   |   ⭐   |

### Outils Exclus (Over-Engineering)

- ❌ next-safe-action (pattern manuel suffit)
- ❌ Socket.dev/Phylum (pnpm audit + Dependabot OK)
- ❌ Percy/Chromatic (coût élevé, détection manuelle OK)
- ❌ Sheriff/ArchUnitTS (redondant)
- ❌ Métriques complexité (code reviews > métriques)

---

## 📄 Modifications Documentation

### 1. Architecture_technique.md

**Position** : Après "Stratégie de Test" (ligne ~365)

**Nouvelle section** : "Qualité de Code et Outils de Développement"

Contient :

- Contexte (développement IA + risques identifiés)
- Configuration ESLint Flat Config (MDX + linting typé)
- Configuration Prettier + Tailwind plugin
- Workflow VSCode "Perfect Save"
- dependency-cruiser (garde-fou client/serveur)
- @next/bundle-analyzer (détection bundling)
- **Stryker.js (validation tests IA)**
- TSDoc validation
- SCA (stratégie minimaliste)
- Outils exclus et justification

**Volume** : ~2000 lignes

---

### 2. PRD.md

**Modification 1** : ENF7 (ligne ~326)

Remplacer par version incluant :

- ESLint Flat Config + MDX + linting typé
- Prettier + plugin Tailwind
- dependency-cruiser
- @next/bundle-analyzer
- **Stryker.js (mutation score > 80%)**
- Workflow VSCode
- Revue de code obligatoire

**Modification 2** : Ajouter ENF28 (après ENF27)

Nouvelle exigence "Outils de Qualité de Code" avec :

- Fichiers configuration créés
- Scripts package.json
- Intégration CI/CD
- Documentation patterns IA

**Modification 3** : EPIC 7 (ligne ~659)

Mettre à jour avec :

- 7.7 : Configuration ESLint
- 7.8 : Configuration dependency-cruiser
- 7.9 : Configuration Stryker.js
- 7.10 : Workflow CI/CD qualité

---

### 3. Brief.md

**Position** : Section "Qualité" (ligne ~104)

Remplacer par version incluant :

- Tests Vitest + @testing-library/react
- Tests E2E Playwright
- **Tests mutation Stryker.js**
- Outils qualité (ESLint, Prettier, dependency-cruiser, bundle-analyzer)
- Pipeline CI/CD détaillé

---

### 4. Concept.md

**Position** : Section "Qualité & Tests" (ligne ~154)

Remplacer par version incluant :

- Tests composants/E2E
- **Stryker.js (mutation score > 80%)**
- Outils qualité
- CI/CD workflow

---

## 📁 Fichiers de Configuration à Créer

### Fichier 1 : `prettier.config.js`

**Emplacement** : Racine

```javascript
/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
```

---

### Fichier 2 : `eslint.config.mjs`

**Emplacement** : Racine

**Points clés** :

- Linting typé activé (`parserOptions.project = true`)
- Support MDX avec linting typé
- FlatCompat pour Next.js compatibility
- Plugins : react, tailwind, mdx, simple-import-sort, next-intl, vitest, testing-library, tsdoc
- eslint-config-prettier en dernière position

**Volume** : ~200 lignes

---

### Fichier 3 : `.dependency-cruiser.js`

**Emplacement** : Racine

**Configuration minimaliste** :

- Rule `no-server-in-client` (erreur si import serveur depuis client)
- Rule `no-circular-dependencies` (warning)
- Exclut : `node_modules`, `.next`, `.open-next`

---

### Fichier 4 : `stryker.config.json`

**Emplacement** : Racine

**Configuration** :

- Scope : `src/lib/server/**`, `app/admin/actions.ts`, `src/lib/utils/**`
- Seuils : high 80%, low 60%, break 50%
- Reporters : html, clear-text, progress
- Concurrency : 4
- Timeout : 60s

---

### Fichier 5 : `.vscode/settings.json`

**Emplacement** : `.vscode/`

**Configuration** :

- Editor.defaultFormatter : Prettier
- formatOnSave : true
- codeActionsOnSave : ESLint fixAll
- Associations : mdx → mdx
- Validation ESLint : active

---

### Fichier 6 : `.github/workflows/quality.yml`

**Emplacement** : `.github/workflows/`

**Jobs** :

1. **standard-quality** (chaque PR)
   - Lint, Format check, Architecture validation, Tests

2. **mutation-testing** (conditions)
   - Hebdomadaire (lundi 2h)
   - OU si PR touche `/admin` ou `/src/lib/server/`
   - Upload artefact rapport
   - Comment PR avec score

---

### Fichier 7 : Mise à Jour `package.json`

**Scripts à ajouter** :

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format:check": "prettier --check .",
  "format": "prettier --write .",
  "arch:validate": "depcruise src app",
  "bundle:analyze": "ANALYZE=true pnpm build",
  "test:mutation": "stryker run",
  "test:mutation:critical": "stryker run --mutate 'app/admin/actions.ts' --mutate 'src/lib/server/**/*.ts'",
  "quality:check": "pnpm format:check && pnpm lint && pnpm arch:validate"
}
```

**DevDependencies à ajouter** :

- @eslint/eslintrc, @eslint/js
- @next/bundle-analyzer
- @stryker-mutator/core, @stryker-mutator/vitest-runner
- @vitest/eslint-plugin
- dependency-cruiser
- eslint + plugins (react, mdx, simple-import-sort, tailwindcss, next-intl, testing-library, tsdoc)
- eslint-config-prettier
- globals
- prettier + prettier-plugin-tailwindcss
- typescript-eslint

---

### Fichier 8 : Mise à Jour `tsconfig.json`

**Modifications** :

```json
{
  "compilerOptions": {
    "types": ["./worker-configuration.d.ts", "node"]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "**/*.mdx", // ✅ AJOUTER
    "**/*.md" // ✅ AJOUTER
  ]
}
```

**Raison** : Permet à TypeScript de "voir" les blocs de code dans MDX pour linting typé

---

### Fichier 9 : Mise à Jour `next.config.js`

**Ajout** :

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config existante
});
```

---

## 📋 Ordre d'Exécution Recommandé

### Phase 1 : Mise à Jour Documentation (30 min)

1. [ ] Mettre à jour `Architecture_technique.md` (section complète "Qualité de Code")
2. [ ] Mettre à jour `PRD.md` (ENF7, ENF28, EPIC 7)
3. [ ] Mettre à jour `Brief.md` (section "Qualité")
4. [ ] Mettre à jour `Concept.md` (section "Qualité & Tests")

---

### Phase 2 : Installation Dépendances (5 min)

```bash
pnpm add -D \
  @eslint/eslintrc @eslint/js @next/bundle-analyzer \
  @stryker-mutator/core @stryker-mutator/vitest-runner \
  @vitest/eslint-plugin dependency-cruiser eslint \
  eslint-config-prettier eslint-plugin-mdx eslint-plugin-next-intl \
  eslint-plugin-react eslint-plugin-simple-import-sort \
  eslint-plugin-tailwindcss eslint-plugin-testing-library \
  eslint-plugin-tsdoc globals prettier \
  prettier-plugin-tailwindcss typescript-eslint
```

---

### Phase 3 : Création Fichiers Configuration (15 min)

1. [ ] `prettier.config.js` (racine)
2. [ ] `eslint.config.mjs` (racine)
3. [ ] `.dependency-cruiser.js` (racine)
4. [ ] `stryker.config.json` (racine)
5. [ ] `.vscode/settings.json` (créer `.vscode/` si nécessaire)
6. [ ] `.github/workflows/quality.yml` (créer si nécessaire)

---

### Phase 4 : Mise à Jour Fichiers Existants (10 min)

1. [ ] `package.json` (scripts + devDependencies)
2. [ ] `tsconfig.json` (ajouter `**/*.mdx` et `**/*.md` dans `include`)
3. [ ] `next.config.js` (ajouter `withBundleAnalyzer`)

---

### Phase 5 : Validation Initiale (15 min)

```bash
# 1. Vérifier formatage
[ ] pnpm format:check

# 2. Formater si nécessaire
[ ] pnpm format

# 3. Vérifier linting
[ ] pnpm lint

# 4. Corriger auto si possible
[ ] pnpm lint:fix

# 5. Valider architecture
[ ] pnpm arch:validate

# 6. Exécuter tests
[ ] pnpm test

# 7. Test mutation (scope réduit)
[ ] pnpm test:mutation:critical
```

---

### Phase 6 : Premier Commit (5 min)

```bash
git add .
git commit -m "🔧 Configure advanced code quality tools

- Add ESLint Flat Config with MDX and type-aware linting
- Add Prettier with Tailwind CSS plugin
- Add dependency-cruiser for architecture validation
- Add Stryker.js for mutation testing
- Configure GitHub Actions quality workflow
- Update documentation (Architecture, PRD, Brief, Concept)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## ✅ Checklist de Validation

### Documentation

- [ ] Architecture_technique.md : Section "Qualité de Code" ajoutée et complète
- [ ] PRD.md : ENF7 mis à jour
- [ ] PRD.md : ENF28 ajouté
- [ ] PRD.md : EPIC 7 mis à jour
- [ ] Brief.md : Section "Qualité" mise à jour
- [ ] Concept.md : Section "Qualité & Tests" mise à jour

### Fichiers Configuration

- [ ] `prettier.config.js` créé et valide
- [ ] `eslint.config.mjs` créé et valide (pas d'erreurs syntaxe)
- [ ] `.dependency-cruiser.js` créé
- [ ] `stryker.config.json` créé
- [ ] `.vscode/settings.json` créé
- [ ] `.github/workflows/quality.yml` créé

### Fichiers Existants

- [ ] `package.json` : Scripts ajoutés
- [ ] `package.json` : DevDependencies ajoutées
- [ ] `tsconfig.json` : `**/*.mdx` et `**/*.md` dans `include`
- [ ] `next.config.js` : `withBundleAnalyzer` configuré

### Validation Fonctionnelle

- [ ] `pnpm install` sans erreur
- [ ] `pnpm format:check` ✅
- [ ] `pnpm lint` ✅
- [ ] `pnpm arch:validate` ✅
- [ ] `pnpm test` ✅
- [ ] `pnpm test:mutation:critical` exécution réussie
- [ ] VSCode : Sauvegarde déclenche formatage + linting automatique

### Git

- [ ] Tous les fichiers ajoutés
- [ ] Commit avec Gitmoji ✅
- [ ] Co-Authored-By présent ✅

---

## 📊 Temps Total Estimé

| Phase                       |  Temps   | Critique |
| :-------------------------- | :------: | :------: |
| 1. Mise à jour docs         |  30 min  |  ⭐⭐⭐  |
| 2. Installation dépendances |  5 min   |  ⭐⭐⭐  |
| 3. Création configs         |  15 min  |  ⭐⭐⭐  |
| 4. Mise à jour existants    |  10 min  |  ⭐⭐⭐  |
| 5. Validation               |  15 min  |  ⭐⭐⭐  |
| 6. Premier commit           |  5 min   |  ⭐⭐⭐  |
| **TOTAL**                   | **1h20** |    ✅    |

---

## 💡 Gain Productivité Estimé

- **Détection bugs IA** : +90% (ESLint + dependency-cruiser)
- **Temps debugging** : -50% (détection proactive)
- **Qualité tests** : +40% (Stryker.js révèle tests faibles)
- **Maintenance code** : -30% (formatage auto + linting)
- **Overhead CI** : ~+2 min (acceptable pour valeur apportée)

---

## 🚀 Prochaines Étapes

**Pour démarrer l'implémentation :**

1. ✅ Approuver ce plan
2. Exécuter Phase 1-6 dans l'ordre
3. Valider checklist à chaque phase
4. Documenter tout problème rencontré

**Post-V1 (considérations futures) :**

- Intégrer `size-limit` en CI (une fois baseline établi)
- Évaluer Socket.dev si croissance audience massive
- Améliorer score Stryker.js progressivement
- Ajouter exhaustivité documentation (eslint-plugin-jsdoc)
- VRT avec Argos si besoin détection régressions visuelles

---

## 📞 Points de Référence

**Fichiers source pour configurations :**

- Rapport : `/docs/research/Configuration ESLint et Prettier pour sebc.dev.md`
- Rapport : `/docs/research/Amélioration Qualité Code Projet Next.js.md`

**Plan créé le** : 2025-11-09
**Version** : V1 (intégration initiale)
