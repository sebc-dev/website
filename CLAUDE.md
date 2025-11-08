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

### Cloudflare Integration
- Uses OpenNext adapter for Cloudflare Workers compatibility
- Configuration in `open-next.config.ts` and `wrangler.jsonc`
- Built worker output in `.open-next/` directory
- Assets served from `.open-next/assets`
- Access Cloudflare context via `getCloudflareContext()` in dev mode

### Fonts
Uses Geist font family (Geist Sans and Geist Mono) via `next/font/google`

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
