# sebc.dev

> Blog technique bilingue explorant l'IA, l'UX et les bonnes pratiques d'ingénierie logicielle moderne.

Un projet personnel servant de laboratoire pour expérimenter avec les technologies web modernes, l'architecture cloud-native, et les méthodologies de développement rigoureuses.

## 🎯 Vue d'ensemble

Ce projet est une vitrine de compétences en développement full-stack moderne, démontrant :

- **Architecture moderne** : Next.js 15 avec App Router et React Server Components
- **Edge Computing** : Déploiement sur Cloudflare Workers pour des performances globales optimales
- **Qualité du code** : Pipeline CI/CD complet avec validation automatisée à chaque étape
- **Méthodologie structurée** : Workflow de spécifications à 5 niveaux (Produit → Epic → Story → Phase → Commit)

## 🏗️ Architecture Technique

### Stack Principal

- **Framework** : Next.js 15 (App Router, Server Components)
- **Runtime** : Cloudflare Workers via OpenNext
- **Base de données** : Cloudflare D1 (SQLite distribué)
- **Stockage** : Cloudflare R2 (S3-compatible)
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **Langage** : TypeScript strict mode
- **Package Manager** : pnpm

### Infrastructure Cloudflare

Le projet exploite l'écosystème Cloudflare pour une architecture serverless performante :

- **Workers** : Exécution edge pour des temps de réponse minimaux
- **D1** : Base de données SQLite répliquée globalement
- **R2** : Stockage d'assets avec CDN intégré
- **Pages** : Déploiement continu depuis Git
- **Access** : Authentification Zero Trust pour les routes admin

> **Note** : Le projet reste sur Next.js 15 en attendant que OpenNext prenne en charge Next.js 16 pour assurer la compatibilité complète avec Cloudflare Workers.

### Outils de Développement

- **Tests** : Vitest (unit) + Playwright (E2E) + Stryker (mutation testing)
- **Qualité** : ESLint + Prettier + dependency-cruiser
- **ORM** : Drizzle avec migrations typées
- **CI/CD** : GitHub Actions avec 4 jobs parallélisés
- **AI Tools** : Claude Code avec skills personnalisés et workflow automatisé

## 🔬 Workflow de Spécifications

Un système de documentation structuré en 5 niveaux pour garantir la qualité et la traçabilité :

1. **PRODUIT** - Spécifications produit (Brief, Architecture, Concept)
2. **EPIC** - Regroupements de fonctionnalités avec tracking
3. **STORY** - User stories détaillées avec critères d'acceptation
4. **PHASE** - Plans d'implémentation technique par étapes
5. **COMMIT** - Commits atomiques avec checklists de validation

Chaque niveau dispose de templates, commandes Claude personnalisées et validations automatiques.

## 🎨 Caractéristiques Notables

### Qualité et Tests

- **Mutation Testing** : Validation de la qualité des tests avec Stryker.js
- **E2E Testing** : Scénarios utilisateurs automatisés avec Playwright
- **Architecture Guards** : Prévention des fuites de code serveur vers le client
- **Coverage Reports** : Génération automatique de rapports de couverture

#### E2E Tests in CI

E2E tests in CI use Cloudflare preview deployments for a production-like environment.

**Running E2E tests on a PR**:
- Comment `@e2e` on the PR to trigger tests
- Tests run on a dedicated preview deployment
- Results posted as comment and status check

**For PRs to `main`**:
- E2E tests are **required** before merge
- Status check `e2e/preview-deployment` must pass
- Comment `@e2e` to run tests and unlock merge

**Why preview deployments?**
- Eliminates `wrangler dev` timeout issues in CI
- Tests against actual Cloudflare Workers environment
- More representative of production behavior
- No resource waste from running tests on every push

See [E2E Implementation Guide](docs/deployment/e2e-preview-deployments-implementation.md) and [ADR-001](docs/decisions/001-e2e-tests-preview-deployments.md) for complete details.

### DevOps & Automation

- **Pipeline CI/CD** : 4 jobs (Quality, E2E, Build, Mutation) sur chaque PR
- **Branch Protection** : Règles strictes avec reviews requises sur `main`
- **Scheduled Checks** : Validation hebdomadaire automatique
- **Pre-commit Hooks** : Validation locale avant push

### Documentation & Tooling

- **Claude Skills** : 5 skills personnalisés pour automatiser le workflow
- **Slash Commands** : Commandes custom pour générer specs et phases
- **Validation Framework** : Système de validation de documents avec règles YAML
- **Gitmoji Convention** : Commits sémantiques avec emojis standardisés

### Internationalisation (i18n)

Le site est **entièrement bilingue** (Français/Anglais) avec une implémentation avancée :

- **next-intl v4.5.3** : Intégration middleware pour détection automatique de langue
- **Détection intelligente** : URL → Cookie → Accept-Language → Défaut (Français)
- **Routes préfixées** : `/fr/*` et `/en/*` avec support complet SSR/RSC
- **Persistence** : Cookie `NEXT_LOCALE` avec flags sécurisés (HttpOnly, SameSite)
- **Performance** : Middleware optimisé < 50ms, compatible Cloudflare Workers edge
- **73 clés de traduction** : 8 namespaces (common, nav, footer, form, etc.)
- **Parité 100%** : Tests automatisés garantissant la complétude des traductions

#### Utilisation Rapide

```typescript
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('appName')}</h1>;
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function Nav() {
  const t = useTranslations('nav');
  return <a href="/fr/">{t('home')}</a>;
}
```

#### Changement de Langue

Le basculement se fait automatiquement via la navigation :

```typescript
// Redirection vers la version anglaise
router.push('/en/articles');

// Le middleware gère :
// - Mise à jour du cookie NEXT_LOCALE
// - Initialisation du contexte i18n
// - Chargement des traductions appropriées
```

**Documentation complète** : [docs/i18n/MIDDLEWARE.md](docs/i18n/MIDDLEWARE.md)

## 📊 Pipeline CI/CD

Pipeline GitHub Actions exécuté sur chaque PR et push vers `main`/`develop` :

```
┌─────────────────┐
│  Code Quality   │ → Lint, Format, Architecture, Unit Tests
└─────────────────┘
         ↓
┌─────────────────┐
│   E2E Tests     │ → Playwright (Chrome, Firefox, Safari)
└─────────────────┘
         ↓
┌─────────────────┐
│     Build       │ → Next.js production build
└─────────────────┘
         ↓
┌─────────────────┐
│ Mutation Tests  │ → Stryker.js (conditionnel)
└─────────────────┘
```

Tous les jobs doivent passer avant merge. Documentation complète : [CI/CD Pipeline](.github/CI_CD_PIPELINE.md)

## 📁 Structure du Projet

```
/app                    Next.js App Router (pages, layouts, API routes)
/src
  /components          React components (shadcn/ui)
  /lib
    /server            Server-only code (actions, DB queries)
    /utils             Shared utilities
/tests                 Playwright E2E tests
/docs
  /specs               Spécifications produit et techniques
  /research            Documents de recherche
/.claude
  /commands            Slash commands personnalisés
  /skills              Claude Code skills
/.github
  /workflows           GitHub Actions CI/CD
/drizzle               Schémas DB et migrations
```

## 🛠️ Commandes Principales

```bash
# Développement
pnpm dev              # Serveur de dev avec Turbopack
pnpm build            # Build production
pnpm preview          # Preview Cloudflare local

# Qualité
pnpm quality:check    # Format + Lint + Architecture
pnpm test             # Tests unitaires Vitest
pnpm test:e2e         # Tests E2E Playwright
pnpm test:mutation    # Mutation testing

# Base de données
pnpm db:generate      # Générer migrations
pnpm db:studio        # Drizzle Studio UI

# Déploiement
pnpm deploy           # Deploy vers Cloudflare
```

## 📚 Documentation

### Product & Architecture

- **[Brief Projet](docs/specs/Brief.md)** - Vue d'ensemble et objectifs
- **[Architecture Technique](docs/specs/Architecture_technique.md)** - Détails de la stack
- **[Concept Produit](docs/specs/Concept.md)** - Vision et fonctionnalités
- **[SPECS_WORKFLOW.md](.claude/SPECS_WORKFLOW.md)** - Système de workflow complet

### Development & Operations

- **[CLAUDE.md](CLAUDE.md)** - Guide pour Claude Code
- **[Security Documentation](docs/security/README.md)** - Cloudflare Access, WAF, et protection
- **[Deployment Guides](docs/deployment/)** - Configuration Cloudflare et déploiement

## 🚀 Démarrage Rapide

```bash
# Prérequis : Node.js 20+, pnpm 8+
pnpm install
cp .env.example .env
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)
