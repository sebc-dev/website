# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 website deployed to Cloudflare Workers using OpenNext. The project uses TypeScript, React 19, and Tailwind CSS v4 with shadcn/ui components.

## Core Commands

### Development

- `pnpm dev` - Start Next.js dev server with Turbopack (runs on http://localhost:3000)
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

#### Development Servers

The project uses two distinct development servers depending on the use case:

**Local Development (`pnpm dev`)**

- **Command**: `pnpm dev`
- **Runtime**: Node.js (Next.js dev server with Turbopack)
- **Script**: `scripts/dev-quiet.sh` (filters Durable Objects warnings)
- **URL**: http://localhost:3000
- **Use case**: Local development with hot-reload, debugging, rapid iteration
- **Features**: Fast Refresh, detailed error overlay, instant updates

**E2E Testing (`pnpm preview`)**

- **Command**: `pnpm preview`
- **Runtime**: Cloudflare Workers (wrangler dev with workerd)
- **Script**: Direct wrangler execution (as of Phase 1)
- **URL**: http://127.0.0.1:8788 (IPv4 forced)
- **Use case**: E2E tests, Playwright, production-like environment simulation
- **Features**: D1 bindings, R2 cache, Durable Objects, Edge APIs

**Important**: After Phase 1 implementation, E2E tests will ONLY work with `pnpm preview`.
Using `pnpm dev` for tests will fail due to missing Cloudflare runtime features
(D1 database, R2 cache, Durable Objects, etc.).

**When to use which:**

- Development/debugging → `pnpm dev` (faster, hot-reload)
- E2E tests/validation → `pnpm preview` (production-like)
- Manual testing against Workers → `pnpm preview`

See: `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`

### Testing

- `pnpm test` - Run Vitest unit tests
- `pnpm test:ui` - Run Vitest with UI
- `pnpm test:coverage` - Generate test coverage report
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e:ui` - Run Playwright with UI
- `pnpm test:e2e:debug` - Debug Playwright tests

### Deployment

- `pnpm deploy` - Build and deploy to Cloudflare Workers
- `pnpm preview` - Build and preview Cloudflare deployment locally
- `pnpm cf-typegen` - Generate Cloudflare environment types

### Running Single Tests

- Vitest: `pnpm test <filename>` or use `.only` in test files
- Playwright: `pnpm test:e2e <test-file-path>` or use `.only` in spec files

### CI Pipeline (Manual Trigger)

La CI est **100% manuelle** - elle ne se lance jamais automatiquement (ni sur push, ni sur PR).
Configurer les **branch protection rules** sur GitHub pour exiger le passage de la CI avant merge.

```bash
# Tout le pipeline
gh workflow run ci.yml

# Jobs spécifiques
gh workflow run ci.yml -f jobs=static-checks   # Format, Lint, TypeScript, Architecture
gh workflow run ci.yml -f jobs=unit-tests      # Tests unitaires et intégration
gh workflow run ci.yml -f jobs=build           # Build complet
gh workflow run ci.yml -f jobs=security-audit  # Audit de sécurité
gh workflow run ci.yml -f jobs=shellcheck      # Validation scripts shell
```

Ou via GitHub : **Actions > CI > Run workflow**

**Note** : Pour que la CI soit requise pour merger, configurer dans GitHub :
Settings > Branches > Branch protection rules > Require status checks

## Architecture

### Project Structure

```
/src              - Application source code
  /app            - Next.js App Router pages (layout.tsx, page.tsx)
  /lib            - Utility functions (e.g., cn() for className merging)
  /i18n           - Internationalization configuration
  /messages       - Translation files (fr.json, en.json)
  middleware.ts   - Next.js middleware
/config           - Configuration files
  vitest.config.ts
  playwright.config.ts
  drizzle.config.ts
  eslint.config.mjs
  prettier.config.js
  postcss.config.mjs
  open-next.config.ts
  components.json
/tests            - Playwright E2E test files
/drizzle          - Database migrations
/docs             - Project documentation and specs
/.claude          - Claude Code configuration and workflows
```

### Key Technologies

- **Framework**: Next.js 15 (App Router, RSC enabled)
- **Runtime**: Cloudflare Workers via @opennextjs/cloudflare
- **Internationalization**: next-intl v4.5.3 (supports edge runtime)
- **Styling**: Tailwind CSS v4 with cssVariables, shadcn/ui "new-york" style
- **Icons**: Lucide React
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Package Manager**: pnpm

### Path Aliases

- `@/*` - Maps to `src/*` (configured in tsconfig.json)
- shadcn/ui aliases (in config/components.json):
  - `@/components` - Components directory
  - `@/lib/utils` - Utility functions
  - `@/components/ui` - UI components
  - `@/hooks` - React hooks

### Testing Configuration

- **Vitest**: Config in `config/vitest.config.ts`, setup file at `vitest.setup.ts`
- Unit tests: `**/*.{test,spec}.{ts,tsx}` (excludes `/tests` directory)
- E2E tests: `/tests/**/*.spec.ts` with Playwright (config in `config/playwright.config.ts`)
- Coverage excludes: node_modules, .next, tests, config files, type definitions

### Cloudflare Integration

- Uses OpenNext adapter for Cloudflare Workers compatibility
- Configuration in `config/open-next.config.ts` and `wrangler.jsonc`
- Built worker output in `.open-next/` directory
- Assets served from `.open-next/assets`
- Access Cloudflare context via `getCloudflareContext()` in dev mode

### Fonts

Uses Geist font family (Geist Sans and Geist Mono) via `next/font/google`

### Internationalization (i18n)

- **Library**: next-intl v4.5.3 (supports Next.js 15 + edge runtime)
- **Configuration**: `src/i18n/` directory
  - `config.ts` - Request configuration for Server Components
  - `types.ts` - TypeScript type definitions
  - `index.ts` - Barrel exports for clean imports
  - `README.md` - Comprehensive usage documentation
- **Supported Locales**: French (fr) - default, English (en)
- **Message Files**: `src/messages/fr.json`, `src/messages/en.json`
  - **8 namespaces**: common, nav, footer, form, article, complexity, search, error
  - **73 total keys** organized into semantic groups
  - **100% translation parity** between French and English (validated by tests)
  - Common patterns include parameterized translations (e.g., `{minutes} min read`)
- **Import Pattern**: Use `import { ... } from '@/i18n'` for clean imports
- **Component Usage**:

  ```typescript
  import { useTranslations } from 'next-intl';

  export function MyComponent() {
    const t = useTranslations('common');
    return <div>{t('appName')}</div>;
  }
  ```

- **Testing**: Run `pnpm test messages.test.ts` to validate translation parity
- **Documentation**: See `src/i18n/README.md` for complete usage guide, examples, and best practices
- **Development Tools**: Test page at `[locale]/messages-test` shows all translations side-by-side

**Current Status**: Phase 2 complete - Configuration (Phase 1) and Message Files (Phase 2) fully implemented

## Project Workflow System

This project uses a comprehensive 5-level specification workflow system for managing features:

### Workflow Levels

1. **PRODUIT** - Product requirements (PRD, Brief, Concept, Frontend/UX specs)
2. **EPIC** - High-level feature groupings tracked in `EPIC_TRACKING.md`
3. **STORY** - Individual user stories with specifications
4. **PHASE** - Implementation phases with detailed plans
5. **COMMIT** - Atomic commits with checklists

### Key Documents

- `/docs/specs/` - Product specifications and requirements
- `/.claude/SPECS_WORKFLOW.md` - Complete workflow documentation
- `/.claude/VALIDATION_FRAMEWORK_README.md` - Document validation framework
- `/.claude/validation-config.yaml` - Validation rules configuration

### Custom Slash Commands

- `/plan-story` - Generate story specification and phase breakdown from PRD
- `/generate-phase-doc` - Generate detailed phase implementation documents
- `/generate-checklist` - Generate validation checklist for technical documents
- `/coderabbit-review` - Prepare codebase for CodeRabbit review

These commands are available in `/.claude/commands/` and automate the spec-to-implementation workflow.

## Gitmoji Convention

**IMPORTANT**: Vous devez impérativement utiliser Gitmoji pour tous vos commits. Chaque commit doit commencer par un emoji approprié suivi d'un message descriptif.

La liste complète des emojis disponibles et leurs descriptions se trouve dans le fichier `/docs/gitmoji.md`.

Exemples de commits valides:

- ✨ Introduce new features
- 🐛 Fix a bug
- 📝 Add or update documentation
- 🔧 Add or update configuration files
- ♻️ Refactor code

## Development Notes

- The project is configured for deployment to Cloudflare Workers, not traditional Node.js hosting
- Use Next.js 15 patterns (App Router, Server Components by default)
- Follow shadcn/ui conventions for component styling (use `cn()` utility from `@/lib/utils`)
- Keep tests isolated: unit tests in component/lib directories, E2E tests in `/tests`
