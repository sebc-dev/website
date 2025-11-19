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

## Architecture

### Project Structure

```
/app              - Next.js App Router pages (layout.tsx, page.tsx)
/lib              - Utility functions (e.g., cn() for className merging)
/components       - React components (intended for shadcn/ui components)
/tests            - Playwright E2E test files
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

- `@/*` - Root-level imports (configured in tsconfig.json)
- shadcn/ui aliases (in components.json):
  - `@/components` - Components directory
  - `@/lib/utils` - Utility functions
  - `@/components/ui` - UI components
  - `@/hooks` - React hooks

### Testing Configuration

- **Vitest**: Uses jsdom environment, globals enabled, setup file at `vitest.setup.ts` which imports `@testing-library/jest-dom`
- Unit tests: `**/*.{test,spec}.{ts,tsx}` (excludes `/tests` directory)
- E2E tests: `/tests/**/*.spec.ts` with Playwright
- Coverage excludes: node_modules, .next, tests, config files, type definitions

### E2E Testing Strategy

**Local Development**:
- Run `pnpm test:e2e` to test against local dev server

**CI (Preview Deployments)**:
- Tests run on Cloudflare Workers preview deployments
- **Triggering**: Comment `@e2e` on any PR to run tests
- **For PRs to `main`**: E2E tests are **required** before merge
  - Status check `e2e/preview-deployment` must be "success"
  - Automatic reminder comment when PR is opened

**How it works**:
1. Comment `@e2e` on the PR
2. Workflow deploys to Cloudflare preview environment
3. Playwright tests run against preview URL
4. Status check updated with results
5. Preview environment automatically cleaned up

**Preview URLs**: Available in PR comments after workflow runs

See [E2E Implementation Guide](docs/deployment/e2e-preview-deployments-implementation.md) and [ADR-001](docs/decisions/001-e2e-tests-preview-deployments.md) for details.

### Cloudflare Integration

- Uses OpenNext adapter for Cloudflare Workers compatibility
- Configuration in `open-next.config.ts` and `wrangler.jsonc`
- Built worker output in `.open-next/` directory
- Assets served from `.open-next/assets`
- Access Cloudflare context via `getCloudflareContext()` in dev mode

### Fonts

Uses Geist font family (Geist Sans and Geist Mono) via `next/font/google`

### Internationalization (i18n)

- **Library**: next-intl v4.5.3 (supports Next.js 15 + edge runtime)
- **Configuration**: `i18n/` directory
  - `config.ts` - Request configuration for Server Components
  - `types.ts` - TypeScript type definitions
  - `index.ts` - Barrel exports for clean imports
  - `README.md` - Comprehensive usage documentation
- **Supported Locales**: French (fr) - default, English (en)
- **Message Files**: `messages/fr.json`, `messages/en.json`
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
- **Documentation**: See `i18n/README.md` for complete usage guide, examples, and best practices
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
