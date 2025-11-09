# sebc.dev

Blog technique bilingue (FR/EN) sur l'IA, l'UX et les bonnes pratiques d'ingénierie logicielle.

**Stack** : Next.js 15 + Cloudflare Workers + D1 + R2 + TypeScript + React 19

## 🚀 Démarrage

### Prérequis
- Node.js 20+
- pnpm 8+
- Wrangler CLI

### Installation

```bash
# Cloner le repo
git clone https://github.com/YOUR_USER/website
cd website

# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer le serveur de développement
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## 📖 Documentation

### Architecture & Setup
- **[Brief Projet](docs/specs/Brief.md)** - Vue d'ensemble du projet
- **[Architecture Technique](docs/specs/Architecture_technique.md)** - Stack technique détaillée
- **[Concept du Produit](docs/specs/Concept.md)** - Vision et fonctionnalités

### CI/CD & Quality
- **[Pipeline GitHub Actions](.github/CI_CD_PIPELINE.md)** - Description complète du pipeline
- **[Branch Protection Setup](.github/BRANCH_PROTECTION_SETUP.md)** - Configuration des règles de branches

### Développement Local
- **[CLAUDE.md](CLAUDE.md)** - Instructions pour Claude Code
- **[Environment Setup](docs/environment-setup.md)** - Configuration de l'environnement

## 🛠️ Scripts

### Développement
```bash
pnpm dev              # Démarrer le serveur de dev (Turbopack)
pnpm build            # Build production
pnpm start            # Lancer le serveur production
```

### Quality & Testing
```bash
# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix linting issues
pnpm format:check     # Check Prettier formatting
pnpm format           # Format all files

# Tests
pnpm test             # Run unit/integration tests
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm test:e2e:debug   # Debug E2E tests

# Mutation Testing (AI-generated tests validation)
pnpm test:mutation              # Full mutation testing
pnpm test:mutation:critical     # Critical paths only

# Architecture & Performance
pnpm arch:validate    # Validate dependency architecture
pnpm bundle:analyze   # Analyze bundle size

# All checks
pnpm quality:check    # Format + Lint + Architecture validation
```

### Database
```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate:local # Apply migrations locally
pnpm db:migrate:remote # Apply migrations to production
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Drizzle Studio
```

## ✨ Code Quality Tools

This project includes a comprehensive quality suite:

- **ESLint** - TypeScript type-aware linting with React, Testing Library, and more
- **Prettier** - Automatic code formatting with Tailwind CSS sorting
- **dependency-cruiser** - Architectural validation (prevent server code leakage)
- **Stryker.js** - Mutation testing for AI-generated test validation

All tools are integrated with:
- **GitHub Actions** - Automated CI/CD pipeline on every PR
- **VSCode** - Auto-format on save + auto-fix on save
- **Pre-commit hooks** - Validate locally before pushing

See [CI/CD Pipeline Documentation](.github/CI_CD_PIPELINE.md) for details.

## 📊 GitHub Actions Pipeline

The project has a comprehensive CI/CD pipeline that runs on:
- **Every Pull Request** to `main` or `develop`
- **Every Push** to `main` or `develop`
- **Weekly Schedule** (Mondays 2 AM UTC)

### Pipeline Jobs

1. ✓ **Code Quality** - Lint, Format, Architecture, Unit Tests
2. 🎭 **E2E Tests** - Playwright browser automation tests
3. 🏗️ **Build** - Verify Next.js build succeeds
4. 🧬 **Mutation Testing** - Validate test quality (conditional)

All jobs must pass before merging to `main`.

**Setup** : See [Branch Protection Setup](.github/BRANCH_PROTECTION_SETUP.md)

## 📁 Project Structure

```
/app                    - Next.js App Router pages & layouts
/src
  /components          - React components (shadcn/ui)
  /lib
    /server            - Server-only utilities & actions
    /utils             - Shared utilities
/tests                 - Playwright E2E tests
/docs
  /specs               - Product & technical specifications
  /research            - Research documents & insights
/.github
  /workflows           - GitHub Actions CI/CD pipelines
/.claude               - Claude Code configuration & skills
/drizzle               - Database schema & migrations
```

## 🔐 Security

- **Cloudflare Access** - Zero Trust authentication for `/admin`
- **WAF** - Cloudflare Web Application Firewall
- **Secrets Management** - Environment variables via `.dev.vars` + `wrangler secret`
- **Code Scanning** - ESLint + TypeScript strict mode

## 🌍 Deployment

The project is deployed to **Cloudflare Workers** using OpenNext adapter.

```bash
# Preview locally
pnpm preview

# Deploy to production
pnpm deploy
```

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure all local checks pass: `pnpm quality:check`
4. Push and create a Pull Request
5. Wait for GitHub Actions to pass
6. Request review and merge when approved

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

MIT

---

**Questions?** See [CLAUDE.md](CLAUDE.md) for development help with Claude Code.
