# Story 0.1 - Phases Implementation Plan

**Story**: Initialiser le projet Next.js 15
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-06
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_0/story_0_1/story_0.1.md`

**Story Objective**:

Créer la fondation du projet sebc.dev en initialisant un projet Next.js 15 avec TypeScript, TailwindCSS et App Router. Cette story constitue la base absolue sur laquelle toutes les autres stories de l'Epic 0 seront construites. Le projet doit être configuré de manière optimale pour faciliter l'intégration future de l'adaptateur OpenNext (Story 0.2) et le déploiement sur Cloudflare Workers.

**Acceptance Criteria**:
- **CA1**: Le projet compile et s'exécute avec Next.js 15 (App Router)
- **CA2**: TypeScript configuré et fonctionnel (mode strict)
- **CA3**: TailwindCSS installé et basique fonctionnel
- **CA4**: Structure de projet respectant les conventions Next.js App Router
- **CA5**: Le serveur de développement démarre sans erreur (`npm run dev`)
- **CA6**: Une page de test basique s'affiche correctement

**User Value**:

Pour les développeurs : base solide et moderne avec configuration TypeScript stricte, structure claire, et workflow de développement fluide. Pour les utilisateurs finaux : garantit performance optimale grâce à Next.js 15 et base technique solide pour toutes les fonctionnalités futures.

---

## 🎯 Phase Breakdown Strategy

### Why 3 Phases?

Cette story est décomposée en **3 phases atomiques** basées sur :

✅ **Technical dependencies**: L'initialisation du projet (Phase 1) doit précéder la configuration avancée (Phase 2) et la validation (Phase 3)

✅ **Risk mitigation**:
- Phase 1 isole le risque d'initialisation et de choix de versions
- Phase 2 isole la configuration TypeScript/TailwindCSS
- Phase 3 garantit que tout fonctionne correctement avant de passer aux autres stories

✅ **Incremental value**:
- Phase 1 : Projet fonctionnel basique
- Phase 2 : Configuration optimisée et structure professionnelle
- Phase 3 : Validation complète et documentation

✅ **Team capacity**: Chaque phase est dimensionnée pour 0.5-1 jour de travail, permettant une progression rapide et des points de validation fréquents

✅ **Testing strategy**: Chaque phase peut être validée indépendamment (compilation, linting, exécution)

### Atomic Phase Principles

Each phase follows these principles:
- **Independent**: Can be implemented and tested separately
- **Deliverable**: Produces tangible, working functionality
- **Sized appropriately**: 0.5-1 day of work (story is simple)
- **Low coupling**: Minimal dependencies between phases
- **High cohesion**: All work in phase serves single objective

### Implementation Approach

```
[Phase 1]      →      [Phase 2]      →      [Phase 3]
Initialize           Configure             Validate
Foundation           & Optimize            & Document
    ↓                    ↓                      ↓
Basic project      Strict TS config       Comprehensive
structure          Clean structure         validation
npm init           Best practices         Documentation
```

---

## 📦 Phases Summary

### Phase 1: Initialize Next.js Project

**Objective**: Créer le projet Next.js 15 avec les options de base et vérifier que l'initialisation fonctionne correctement.

**Scope**:
- Exécuter `create-next-app` avec les bonnes options
- Vérifier que toutes les dépendances sont installées
- Tester que le serveur de dev démarre
- Faire le premier commit Git

**Dependencies**:
- None (Foundation phase)

**Key Deliverables**:
- [x] Projet Next.js 15 créé avec `create-next-app`
- [x] Dépendances npm installées (Next.js 15, React 19, TypeScript, Tailwind)
- [x] Configuration de base générée (next.config.js, tsconfig.json, tailwind.config.ts)
- [x] Git initialisé avec .gitignore approprié
- [x] Premier commit : "Initial Next.js 15 project setup"

**Files Affected** (~12 files):
- `package.json` (new) - Dependencies and scripts
- `next.config.js` (new) - Next.js configuration
- `tsconfig.json` (new) - TypeScript configuration
- `tailwind.config.ts` (new) - Tailwind configuration
- `postcss.config.js` (new) - PostCSS configuration
- `src/app/layout.tsx` (new) - Root layout
- `src/app/page.tsx` (new) - Home page
- `src/app/globals.css` (new) - Global styles
- `.gitignore` (new) - Git ignore rules
- `.eslintrc.json` (new) - ESLint configuration
- `README.md` (new) - Basic project README
- `public/` (new directory) - Static assets

**Estimated Complexity**: 🟢 Low

**Estimated Duration**: 0.5 days (3-4 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:
- Aucun risque majeur, processus standard et bien documenté
- Next.js 15 est stable

**Mitigation Strategies**:
- Utiliser la commande officielle `create-next-app@latest`
- Vérifier les versions après installation
- Tester immédiatement le serveur de dev

**Success Criteria**:
- [x] `npm run dev` démarre sans erreur
- [x] Page d'accueil accessible sur http://localhost:3000
- [x] TypeScript compile sans erreur
- [x] Tailwind CSS appliqué sur la page par défaut
- [x] Tests: Compilation réussie + serveur fonctionnel

**Technical Notes**:
- Utiliser les options `--typescript --tailwind --app` lors de l'init
- Sélectionner `src/` directory pour meilleure organisation
- Activer import alias (`@/*`) pour imports propres
- Node.js 18+ requis (vérifier version avant init)

**Commits Plan**:
1. `chore: initialize Next.js 15 project with TypeScript and Tailwind`
2. `chore: configure base project structure with src directory`
3. `docs: add initial README with project setup instructions`
4. `chore: verify dev server and basic compilation`

---

### Phase 2: Optimize TypeScript & Project Structure

**Objective**: Configurer TypeScript en mode strict, optimiser la structure de projet, et établir les conventions de code.

**Scope**:
- Activer le mode strict de TypeScript
- Créer la structure de dossiers conventionnelle (components, lib)
- Configurer ESLint avec règles strictes
- Nettoyer le code par défaut et créer une page de test simple
- Optimiser les configurations

**Dependencies**:
- Requires Phase 1 (projet doit exister)

**Key Deliverables**:
- [x] TypeScript strict mode activé dans tsconfig.json
- [x] Structure de dossiers professionnelle créée
- [x] ESLint configuré avec règles Next.js + TypeScript strictes
- [x] Page de test basique créée (remplace la page par défaut)
- [x] Conventions de code documentées

**Files Affected** (~8 files):
- `tsconfig.json` (modified) - Enable strict mode and additional checks
- `.eslintrc.json` (modified) - Add strict TypeScript rules
- `src/components/.gitkeep` (new) - Components directory
- `src/lib/.gitkeep` (new) - Utilities directory
- `src/lib/utils.ts` (new) - Basic utility functions
- `src/app/page.tsx` (modified) - Clean test page
- `src/app/layout.tsx` (modified) - Optimize root layout
- `README.md` (modified) - Add structure documentation

**Estimated Complexity**: 🟡 Medium

**Estimated Duration**: 1 day (5-6 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:
- Configuration TypeScript strict peut révéler des erreurs dans le code par défaut
- Pas de risque majeur, juste ajustements

**Mitigation Strategies**:
- Activer strict mode progressivement si nécessaire
- Utiliser les types Next.js officiels pour éviter les erreurs
- Tester après chaque modification de configuration

**Success Criteria**:
- [x] `npm run build` compile sans erreur ni warning TypeScript
- [x] ESLint ne remonte aucune erreur (`npm run lint`)
- [x] Structure de dossiers conforme aux conventions
- [x] Page de test affiche correctement avec styles Tailwind
- [x] Tests: Type checking strict OK + Linting OK

**Technical Notes**:
- TypeScript strict mode inclut : `strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`
- Créer des barrel exports (index.ts) dans components/ et lib/ pour imports propres
- Utiliser Tailwind utility classes pour vérifier que CSS fonctionne
- Documenter la structure dans README

**Commits Plan**:
1. `config: enable TypeScript strict mode and additional checks`
2. `chore: create conventional project structure (components, lib)`
3. `config: configure strict ESLint rules for TypeScript`
4. `feat: create clean test homepage with Tailwind styles`
5. `refactor: optimize root layout and remove default boilerplate`
6. `docs: document project structure and coding conventions`

---

### Phase 3: Validation & Documentation

**Objective**: Valider que l'ensemble du setup fonctionne correctement, documenter le projet, et préparer pour Story 0.2.

**Scope**:
- Tests complets de compilation et exécution
- Validation des configurations (TS, ESLint, Tailwind)
- Documentation complète du setup
- Vérification des prérequis pour OpenNext (Story 0.2)
- Création de scripts npm utiles

**Dependencies**:
- Requires Phase 2 (configurations doivent être complètes)

**Key Deliverables**:
- [x] Validation complète : compilation, linting, dev server, build
- [x] README complet avec instructions de setup
- [x] Scripts npm additionnels (type-check, format, etc.)
- [x] Documentation des prérequis pour Story 0.2
- [x] Checklist de validation complétée

**Files Affected** (~5 files):
- `package.json` (modified) - Add utility scripts
- `README.md` (modified) - Complete documentation
- `docs/setup/DEVELOPMENT.md` (new) - Development guide
- `docs/setup/ARCHITECTURE.md` (new) - Architecture overview
- `.vscode/settings.json` (new) - VS Code recommended settings

**Estimated Complexity**: 🟢 Low

**Estimated Duration**: 0.5 days (3-4 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:
- Aucun risque technique, phase de validation

**Mitigation Strategies**:
- Checklist systématique de validation
- Tests sur environnement propre (clean install)

**Success Criteria**:
- [x] `npm run dev` : serveur démarre sans erreur
- [x] `npm run build` : build production réussit
- [x] `npm run lint` : aucune erreur ESLint
- [x] `npm run type-check` : aucune erreur TypeScript
- [x] Documentation claire et complète
- [x] Tests: Validation checklist 100% complétée

**Technical Notes**:
- Ajouter script `type-check` : `tsc --noEmit`
- Ajouter script `format` : `prettier --write .` (si Prettier utilisé)
- Documenter la compatibilité avec OpenNext pour faciliter Story 0.2
- Inclure instructions pour Node.js version management (nvm)

**Commits Plan**:
1. `chore: add utility npm scripts (type-check, format)`
2. `docs: create comprehensive development guide`
3. `docs: document architecture and OpenNext preparation`
4. `chore: add VS Code recommended settings for team consistency`

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Initialize)
    ↓
Phase 2 (Configure & Optimize)
    ↓
Phase 3 (Validate & Document)
```

### Critical Path

**Must follow this order**:
1. Phase 1 → Phase 2 → Phase 3 (strictly sequential)

**No parallelization possible**: Chaque phase dépend de la précédente

### Blocking Dependencies

**Phase 1 blocks**:
- Phase 2: Configuration requires existing project
- Phase 3: Validation requires completed configuration

**Phase 2 blocks**:
- Phase 3: Documentation requires finalized structure

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric | Estimate | Notes |
|--------|----------|-------|
| **Total Phases** | 3 | Atomic, sequential phases |
| **Total Duration** | 2 days | Sequential implementation |
| **Parallel Duration** | N/A | No parallelization possible |
| **Total Commits** | 10-14 | Across all phases |
| **Total Files** | ~25 new/modified | Project initialization |
| **Test Coverage Target** | N/A | No unit tests in this story (setup only) |

### Per-Phase Timeline

| Phase | Duration | Commits | Start After | Blocks |
|-------|----------|---------|-------------|--------|
| 1. Initialize | 0.5d | 3-4 | - | Phase 2, 3 |
| 2. Configure | 1d | 5-6 | Phase 1 | Phase 3 |
| 3. Validate | 0.5d | 3-4 | Phase 2 | - |

### Resource Requirements

**Team Composition**:
- 1 developer: Next.js + TypeScript expertise
- 1 reviewer: Validate configuration best practices

**External Dependencies**:
- Node.js 18+ installed locally
- npm/yarn/pnpm package manager
- Git for version control
- Internet connection for package downloads

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Aucune phase à haut risque** dans cette story.

### Medium-Risk Phases

**Phase 2: Configure & Optimize** 🟡
- **Risk**: TypeScript strict mode peut révéler des erreurs dans code généré
- **Impact**: Peut nécessiter des ajustements mineurs
- **Mitigation**: Utiliser les types officiels Next.js, tester progressivement
- **Contingency**: Désactiver temporairement certaines règles strictes si blocage

### Overall Story Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Version incompatibility (Next.js 15 + React 19) | Low | Medium | Use official create-next-app, verify versions |
| Node.js version too old | Low | High | Document Node.js 18+ requirement, use nvm |
| Network issues during install | Low | Low | Retry installation, use npm cache |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase | Manual Tests | Compilation Tests | Runtime Tests |
|-------|--------------|-------------------|---------------|
| 1. Initialize | Project created | `npm run build` | `npm run dev` |
| 2. Configure | Structure correct | Type checking | Linting pass |
| 3. Validate | All scripts work | Full build | Dev + Prod modes |

### Test Milestones

- **After Phase 1**: Dev server runs, page displays
- **After Phase 2**: Strict TypeScript compiles, ESLint passes
- **After Phase 3**: All npm scripts work, documentation complete

### Quality Gates

Each phase must pass:
- [x] Project compiles without TypeScript errors
- [x] ESLint passes with no errors
- [x] Dev server starts successfully
- [x] Production build succeeds
- [x] Manual QA checklist completed

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

Cette story étant simple (3 phases), la documentation détaillée par phase n'est **pas requise** (pas de génération via `phase-doc-generator`). Le PHASES_PLAN.md actuel suffit.

**Rationale**:
- Story simple et bien délimitée
- Phases très claires et standard
- Commit checklists intégrés dans ce document
- Génération de docs détaillées serait excessive (overhead > value)

**Alternative approach**:
- Ce PHASES_PLAN.md sert de guide complet
- Les commits plans sont détaillés dans chaque phase
- La validation est décrite dans Phase 3

### Story-Level Documentation

**This document** (PHASES_PLAN.md):
- Strategic overview ✅
- Phase-by-phase implementation guide ✅
- Commit-level checklists ✅
- Validation criteria ✅

**Additional documentation**:
- `README.md` (created in phases)
- `docs/setup/DEVELOPMENT.md` (created in Phase 3)
- `docs/setup/ARCHITECTURE.md` (created in Phase 3)

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Validate that 3 phases is appropriate
   - Confirm commit plans make sense
   - Adjust estimates if needed

2. **Prepare development environment**
   ```bash
   # Verify Node.js version
   node --version  # Should be 18+

   # Verify npm/yarn/pnpm
   npm --version

   # Prepare workspace
   cd /home/negus/dev/website
   ```

3. **Begin Phase 1 implementation**
   - Follow commit checklist in Phase 1 section
   - Execute `create-next-app` with correct options
   - Validate after each commit

### Implementation Workflow

For each phase:

1. **Plan**:
   - Read phase section in this PHASES_PLAN.md
   - Review commit checklist
   - Understand success criteria

2. **Implement**:
   - Follow commit plan sequentially
   - Test after each commit
   - Validate against success criteria

3. **Review**:
   - Self-review against checklist
   - Ensure all deliverables completed
   - Run all quality gates

4. **Move to next phase**:
   - Update EPIC_TRACKING.md progress
   - Begin next phase

### Progress Tracking

Update EPIC_TRACKING.md as phases complete:
- [x] Phase 1: Initialize - Status, Actual duration, Notes
- [x] Phase 2: Configure - Status, Actual duration, Notes
- [x] Phase 3: Validate - Status, Actual duration, Notes

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:
- [x] All 3 phases implemented and validated
- [x] All acceptance criteria from story spec met (CA1-CA6)
- [x] Next.js 15 project runs in dev mode
- [x] Production build succeeds
- [x] TypeScript strict mode enabled and compiling
- [x] Documentation complete (README + setup guides)
- [x] Git repository initialized with clean history
- [x] Ready for Story 0.2 (OpenNext adapter)

### Quality Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| TypeScript Errors | 0 | - |
| ESLint Errors | 0 | - |
| Build Success | 100% | - |
| Documentation Complete | 100% | - |

---

## 📚 Reference Documents

### Story Specification
- Original spec: `docs/specs/epics/epic_0/story_0_1/story_0.1.md`

### Related PRD Sections
- Epic 0 overview: PRD lines 586-598
- ENF1 (Frontend Next.js + React): PRD lines 266-273
- ENF2 (Architecture App Router): PRD lines 274-285
- Brief: `docs/specs/Brief.md`
- Concept: `docs/specs/Concept.md`

### External Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)

---

## 🔧 Implementation Commands Reference

### Phase 1: Initialize

```bash
# Create Next.js project
npx create-next-app@latest website --typescript --tailwind --app

# Options during interactive prompt:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: Yes (default @/*)

# Navigate to project
cd website

# Install dependencies (if not auto-installed)
npm install

# Start dev server
npm run dev

# Initialize git (if not auto-initialized)
git init
git add .
git commit -m "chore: initialize Next.js 15 project with TypeScript and Tailwind"
```

### Phase 2: Configure

```bash
# Create project structure
mkdir -p src/components src/lib

# Edit tsconfig.json (enable strict mode)
# Edit .eslintrc.json (add strict rules)

# Create utility files
touch src/lib/utils.ts
touch src/components/.gitkeep

# Verify configuration
npm run lint
npm run build
```

### Phase 3: Validate

```bash
# Add type-check script to package.json
# "type-check": "tsc --noEmit"

# Run validation
npm run type-check
npm run lint
npm run build
npm run dev

# Create documentation
mkdir -p docs/setup
touch docs/setup/DEVELOPMENT.md
touch docs/setup/ARCHITECTURE.md

# Final commit
git add .
git commit -m "docs: complete setup documentation and validation"
```

---

**Plan Created**: 2025-11-06
**Last Updated**: 2025-11-06
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING
