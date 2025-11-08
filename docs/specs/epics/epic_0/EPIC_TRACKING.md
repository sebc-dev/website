# Epic 0 - Socle technique (V1)

**Status**: 📋 PLANNING
**Created**: 2025-11-06
**Target Completion**: Q1 2025

---

## 📖 Epic Overview

### Description

L'Epic 0 établit le socle technique complet du projet sebc.dev. Il s'agit de la fondation sur laquelle tous les autres epics seront construits. Cette epic couvre l'initialisation du projet Next.js 15, la configuration de l'adaptateur OpenNext pour le déploiement sur Cloudflare Workers, la mise en place de la base de données D1 avec Drizzle ORM, la configuration du design system (TailwindCSS 4 + shadcn/ui), et l'établissement du pipeline CI/CD complet avec tests, migrations, et déploiement automatisé.

L'Epic 0 garantit que toutes les bases techniques sont correctement posées : configuration des bindings Cloudflare (D1, R2, KV, Durable Objects), activation des flags de compatibilité requis (`nodejs_compat`), mise en place de la sécurité (Cloudflare Access pour `/admin`, WAF), et configuration du système de tests (Vitest, Playwright).

### Epic Objectives

- Initialiser un projet Next.js 15 fonctionnel avec App Router et React Server Components
- Configurer l'adaptateur OpenNext pour un déploiement sur Cloudflare Workers
- Établir l'architecture de base de données avec D1 et Drizzle ORM (schéma initial + migrations)
- Mettre en place le design system (TailwindCSS 4 + shadcn/ui) avec la palette de couleurs du projet
- Configurer tous les bindings Cloudflare requis dans `wrangler.toml` (D1, R2, KV, Durable Objects)
- Établir le pipeline CI/CD avec GitHub Actions (tests, migrations, build OpenNext, déploiement)
- Sécuriser l'application avec Cloudflare Access (pour `/admin`) et WAF
- Configurer le système de tests (Vitest pour tests unitaires/composants, Playwright pour E2E)
- Valider le fonctionnement bout-en-bout de la stack technique

### User Value

Pour les développeurs et mainteneurs du projet, cet epic fournit une base technique solide, sécurisée et testée. Pour les utilisateurs finaux, bien qu'invisible, il garantit une infrastructure performante, sécurisée et fiable qui permettra de délivrer du contenu rapidement et avec une excellente expérience utilisateur. L'architecture Edge de Cloudflare garantit une latence minimale partout dans le monde.

---

## 📚 Stories in This Epic

This epic contains **10 stories** as defined in the PRD:

| Story | Title | Description | Status | Phases | Progress |
|-------|-------|-------------|--------|--------|----------|
| 0.1 | Initialiser le projet Next.js 15 | Next.js 15.4.7 + React 19 + TypeScript 5 + App Router | ✅ COMPLETED | 3 | 3/3 |
| 0.2 | Configurer adaptateur OpenNext | `@opennextjs/cloudflare` v1.3.0 installé et configuré | ✅ COMPLETED | - | ✅ |
| 0.3 | Configurer TailwindCSS 4 + shadcn/ui | TailwindCSS 4 + shadcn/ui + palette projet (teal #14B8A6) | ✅ COMPLETED | - | ✅ |
| 0.4 | Configurer Drizzle ORM + Cloudflare D1 | Schéma initial + migrations setup | 📋 PLANNED | 5 | 📋 Phase 2 docs ready |
| 0.5 | Configurer wrangler.toml avec bindings | Config de base OK, bindings D1/R2/KV/DO manquants | 🚧 IN PROGRESS | - | 40% |
| 0.6 | Configurer compatibility flags | `nodejs_compat` + `compatibility_date: 2025-03-01` | ✅ COMPLETED | - | ✅ |
| 0.7 | Mettre en place CI/CD GitHub Actions | Pipeline de tests, build OpenNext, migrations D1, déploiement | 📋 NOT STARTED | - | 0% |
| 0.8 | Configurer Cloudflare Access | Protection routes `/admin/*` avec Zero Trust | 📋 NOT STARTED | - | 0% |
| 0.9 | Configurer Cloudflare WAF | Sécurité de base contre menaces web | 📋 NOT STARTED | - | 0% |
| 0.10 | Base tests & linting | ESLint + Vitest (avec tests) + Playwright configurés | ✅ COMPLETED | - | ✅ |

**Columns Explained**:
- **Story**: Reference ID (e.g., 0.1, 0.2)
- **Title**: Story name from PRD
- **Description**: One-line summary of what the story delivers
- **Status**: 📋 NOT STARTED → 🚧 IN PROGRESS → ✅ COMPLETED
- **Phases**: Number of phases when story is planned (empty until /plan-story is run)
- **Progress**: Completed phases out of total (e.g., "2/5" = 2 of 5 phases done)

---

## 🎯 Story Management

### How Stories Progress

For each story in the epic:

1. **Plan Phase** (use `/plan-story`)
   - Story spec created: `story_0_Y/story_0.Y.md`
   - Phases plan created: `story_0_Y/implementation/PHASES_PLAN.md`
   - Update this table: Set **Phases** column to phase count (e.g., "5")
   - Update **Status** to 🚧 IN PROGRESS

2. **Implement Phases** (use `phase-doc-generator` + `phase-implementer`)
   - Generate detailed phase docs
   - Implement phases one at a time
   - Update **Progress** column as each phase completes (e.g., "1/5" → "2/5" → ...)

3. **Complete Story**
   - All phases completed
   - Update **Status** to ✅ COMPLETED
   - Update **Progress** to final (e.g., "5/5")

### Quick Actions

```bash
# Initialize a story in this epic
/plan-story Epic 0 Story 0.1
/plan-story Epic 0 Story 0.2
# ... etc.

# Generate docs for a phase
/generate-phase-doc Epic 0 Story 0.1 Phase 1

# Check epic progress at any time
cat docs/specs/epics/epic_0/EPIC_TRACKING.md
```

---

## 📊 Epic-Level Metrics

### Progress Summary

- **Stories Started**: 6 / 10
- **Stories Completed**: 5 / 10 ✅
- **Stories Planned**: 1 / 10 (Story 0.4)
- **Stories In Progress**: 1 / 10
- **Stories Not Started**: 3 / 10
- **Total Phases**: 8 (Story 0.1: 3 phases, Story 0.4: 5 phases)
- **Phases Completed**: 3 / 8 (Story 0.1: 3/3, Story 0.4: 0/5)

**Epic Completion**: 50% (5 stories complétées / 10 total)
**Weighted Progress**: ~54% (incluant la story partielle 0.5)

### Timeline

- **Epic Created**: 2025-11-06
- **Expected Start**: Q1 2025
- **Expected Completion**: Q1 2025
- **Actual Completion**: TBD

---

## 🔄 Epic Dependencies

### Dependencies Between Stories

**Sequential dependencies**:
- Story 0.1 (Next.js init) **must** complete before all others
- Story 0.2 (OpenNext adapter) depends on Story 0.1
- Story 0.4 (Drizzle + D1) should complete before Story 0.7 (CI/CD with migrations)
- Story 0.5 (wrangler.toml bindings) should complete before Story 0.7 (CI/CD deployment)
- Story 0.8 (Cloudflare Access) can start after Story 0.5 (wrangler.toml configured)

**Parallel work possible**:
- Story 0.3 (TailwindCSS + shadcn/ui) can be done in parallel with Story 0.4, 0.5, 0.6
- Story 0.9 (WAF) and 0.10 (tests & linting) can be done in parallel with other stories

**Recommended order**:
1. Story 0.1 (foundation)
2. Stories 0.2, 0.3, 0.6 in parallel (framework setup)
3. Stories 0.4, 0.5 in parallel (infrastructure)
4. Stories 0.8, 0.9, 0.10 in parallel (security & quality)
5. Story 0.7 (CI/CD - integrates everything)

### External Dependencies

- **Cloudflare Account**: Required for D1, R2, Workers deployment
- **GitHub Repository**: Required for GitHub Actions CI/CD
- **Node.js 18+**: Required for Next.js 15 and tooling
- **Wrangler CLI**: Required for local development and deployment

---

## 📝 Status Updates

Track epic-level milestones here:

- [x] **Milestone 1**: Project initialized and Next.js working locally - ✅ COMPLETED
- [ ] **Milestone 2**: All infrastructure configured (D1, R2, bindings) - 🚧 PARTIAL (40%)
- [ ] **Milestone 3**: Security configured (Access, WAF) - Target: Week 2
- [ ] **Milestone 4**: CI/CD pipeline functional and first deployment successful - Target: Week 2
- [ ] **Milestone 5**: All tests passing and Epic 0 complete - Target: Week 2

### Recent Updates

**2025-11-08 (Evening)**: Phase 2 documentation generated for Story 0.4! 📚
- ✅ **Phase 2 (Core Schema) documentation complete**: 7 files, ~3,700 lines generated
  - INDEX.md: Navigation hub (~300 lines)
  - IMPLEMENTATION_PLAN.md: 6 atomic commits strategy (~500 lines)
  - COMMIT_CHECKLIST.md: Per-commit detailed checklist (~600 lines)
  - ENVIRONMENT_SETUP.md: Setup guide (~400 lines)
  - guides/REVIEW.md: Code review guide (~650 lines)
  - guides/TESTING.md: Integration testing strategy (~550 lines)
  - validation/VALIDATION_CHECKLIST.md: Final validation (~700 lines)
- **Atomic commits**: 6 commits (ENUMs → Articles → Translations → Migration → Data → Tests)
- **Estimated time**: 4.5-6h implementation + 2-3h review
- **Tech stack**: Next.js 15 + Drizzle ORM + Cloudflare D1 + Vitest
- Ready for Phase 2 implementation!

**2025-11-08**: Story 0.4 planned via story-phase-planner skill ! 📋
- ✅ Story 0.4 : Drizzle ORM + Cloudflare D1 planifiée en 5 phases (11 jours estimés)
  - Phase 1: Drizzle Config & D1 Setup (2d)
  - Phase 2: Core Schema - Articles + Translations (3d)
  - Phase 3: Taxonomy Schema - Categories, Tags (2d)
  - Phase 4: Validation Chain - drizzle-zod (2d)
  - Phase 5: Access Layer + Integration Tests (2d)
- **Total Phases**: 8 (Story 0.1: 3, Story 0.4: 5)
- Documentation complète générée: story spec + PHASES_PLAN.md (~1200 lines)
- Prêt pour génération de docs détaillées par phase avec /generate-phase-doc

**2025-11-06 (Late Evening)**: Stories 0.3 et 0.10 complétées à 100% ! 🎉
- ✅ Story 0.3 : shadcn/ui installé + palette projet appliquée (teal + typographies Nunito Sans/JetBrains Mono)
- ✅ Story 0.10 : Vitest configuré avec scripts + tests unitaires + Playwright E2E
- **Epic Completion** : **50%** (5 stories complètes / 10 total)
- **Weighted Progress** : ~54%

**2025-11-06 (Evening)**: État des lieux complet effectué. Mise à jour du tracking pour refléter l'état réel du projet :
- ✅ Stories 0.1, 0.2, 0.6 **COMPLÉTÉES** (30%)
- 🚧 Stories 0.3, 0.5, 0.10 **EN COURS** (partielles : 60%, 40%, 33%)
- 📋 Stories 0.4, 0.7, 0.8, 0.9 **PAS COMMENCÉES**
- **Epic Completion** : 30% (weighted: ~45%)

**2025-11-06 (PM)**: Story 0.1 planned via story-phase-planner skill. Decomposed into 3 phases (Initialize, Configure, Validate). Total estimated duration: 2 days. Ready for implementation.

**2025-11-06 (AM)**: Epic 0 initialized via epic-initializer skill. All 10 stories identified from PRD. Ready for story planning phase.

---

## 🔗 Reference Documents

### Story Specifications
- Story 0.1: `docs/specs/epics/epic_0/story_0_1/story_0.1.md` (created via /plan-story)
- Story 0.2: `docs/specs/epics/epic_0/story_0_2/story_0.2.md` (created via /plan-story)
- Story 0.3: `docs/specs/epics/epic_0/story_0_3/story_0.3.md` (created via /plan-story)
- Story 0.4: `docs/specs/epics/epic_0/story_0_4/story_0.4.md` (created via /plan-story)
- Story 0.5: `docs/specs/epics/epic_0/story_0_5/story_0.5.md` (created via /plan-story)
- Story 0.6: `docs/specs/epics/epic_0/story_0_6/story_0.6.md` (created via /plan-story)
- Story 0.7: `docs/specs/epics/epic_0/story_0_7/story_0.7.md` (created via /plan-story)
- Story 0.8: `docs/specs/epics/epic_0/story_0_8/story_0.8.md` (created via /plan-story)
- Story 0.9: `docs/specs/epics/epic_0/story_0_9/story_0.9.md` (created via /plan-story)
- Story 0.10: `docs/specs/epics/epic_0/story_0_10/story_0.10.md` (created via /plan-story)

### Phase Plans
- Story 0.1: `docs/specs/epics/epic_0/story_0_1/implementation/PHASES_PLAN.md` ✅ PLANNED (3 phases)
- Story 0.4: `docs/specs/epics/epic_0/story_0_4/implementation/PHASES_PLAN.md` ✅ PLANNED (5 phases)
- Links for other stories will be added as they are planned

### Related Documentation
- **PRD**: `docs/specs/PRD.md` (lines 586-598)
- **Brief**: `docs/specs/Brief.md`
- **Concept**: `docs/specs/Concept.md`
- **Architecture Principles**: See PRD lines 964-977 for key architectural decisions

---

## 📋 Checklist

### Epic Setup
- [x] EPIC_TRACKING.md created
- [x] All stories from PRD added to table
- [x] Dependencies documented
- [ ] Team assigned (solo developer)

### During Epic Execution
- [x] First story planned (/plan-story) - Story 0.1 with 3 phases
- [x] First story completed - Story 0.1 (100%)
- [x] Additional stories completed - Stories 0.2, 0.6 (3/10 total)
- [x] Progress metrics updated - 30% epic completion
- [x] Stories in progress identified - 0.3 (60%), 0.5 (40%), 0.10 (33%)

### Epic Completion
- [ ] All stories planned
- [ ] All stories in progress
- [ ] All stories completed
- [ ] Final review done
- [ ] Ready for Epic 1 (next epic)

---

## 🔧 Technical Notes

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Adapter**: @opennextjs/cloudflare (OpenNext)
- **Runtime**: Cloudflare Workers (workerd)
- **Database**: Cloudflare D1 (SQLite serverless)
- **ORM**: Drizzle ORM
- **UI**: TailwindCSS 4 + shadcn/ui
- **Tests**: Vitest (unit/component) + Playwright (E2E)

### Critical Configuration Points
- `wrangler.toml`: Source of truth for all bindings
- `compatibility_flags = ["nodejs_compat"]`: Non-negotiable requirement
- `compatibility_date`: Must be recent (2025+)
- Bindings required: D1, R2, KV, Durable Objects, WORKER_SELF_REFERENCE

### Design System
- **Primary color**: Teal #14B8A6
- **Background**: Anthracite #1A1D23
- **Typography**: Nunito Sans (body) + JetBrains Mono (code)
- **Components**: shadcn/ui (copy-paste approach)

### Security Requirements
- Cloudflare Access protecting `/admin/*` routes
- JWT validation (`Cf-Access-Jwt-Assertion`) in middleware
- Cloudflare WAF enabled
- Secrets via `.dev.vars` (local) and `wrangler secret` (prod)

---

**Epic Initialized**: 2025-11-06
**Last Updated**: 2025-11-06
**Created by**: Claude Code (epic-initializer skill)
