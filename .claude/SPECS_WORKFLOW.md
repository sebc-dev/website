# Workflow de Gestion des Specs : Du PRD à l'Implémentation

Ce document explique le **workflow complet** pour gérer les spécifications du projet sebc.dev, depuis le document PRD initial jusqu'à l'implémentation détaillée de chaque phase.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture à 5 niveaux](#architecture-à-5-niveaux)
3. [Workflow détaillé par étape](#workflow-détaillé-par-étape)
4. [Documents et fichiers](#documents-et-fichiers)
5. [Commandes et skills utilisées](#commandes-et-skills-utilisées)
6. [Exemples pratiques](#exemples-pratiques)
7. [Checklist de validation](#checklist-de-validation)

---

## Vue d'ensemble

Le workflow de sebc.dev suit une **architecture à 5 niveaux**, du plus stratégique au plus tactique :

```
┌─────────────────────────────────────────────────────────────┐
│ Niveau 1: PRODUIT (PRD + Context Specs)                    │
│ ├─ PRD.md - Exigences produit complètes                   │
│ ├─ Brief.md - Résumé exécutif et objectifs               │
│ ├─ Concept.md - Vision et architecture de contenu         │
│ ├─ Frontend_Specification.md - Architecture technique     │
│ └─ UX_UI_Spec.md - Exigences UX/UI                        │
└──────────────────── /plan-story ────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Niveau 2: EPIC (EPIC_TRACKING.md)                          │
│ └─ Epic X : Liste de tous les stories avec statuts        │
└──────────────────── /epic-initializer ──────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Niveau 3: STORY (story_X.Y.md + PHASES_PLAN.md)           │
│ ├─ Story Specification - Extrait du PRD                   │
│ └─ Strategic Phases Plan - Breakdown en phases             │
└──────────────────── /plan-story ─────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Niveau 4: PHASE (7 documents détaillés)                    │
│ ├─ INDEX.md - Navigation et overview                       │
│ ├─ IMPLEMENTATION_PLAN.md - Stratégie atomic commits       │
│ ├─ COMMIT_CHECKLIST.md - Détails par commit                │
│ ├─ ENVIRONMENT_SETUP.md - Configuration                    │
│ ├─ guides/REVIEW.md - Guide de review                      │
│ ├─ guides/TESTING.md - Stratégie de test                   │
│ └─ validation/VALIDATION_CHECKLIST.md - Validation finale  │
└────────────── /generate-phase-doc ──────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Niveau 5: COMMIT (Implémentation détaillée)               │
│ ├─ Fichier source 1 (Commit 1)                             │
│ ├─ Fichier source 2 (Commit 2)                             │
│ └─ ... (un commit à la fois)                               │
└───────────── phase-implementer agent ────────────────────────┘
```

---

## Architecture à 5 niveaux

### **Niveau 1: PRODUIT - Les Spécifications de Base**

**Fichiers** : `docs/specs/`
```
docs/specs/
├── PRD.md                           # Source de vérité produit
├── Brief.md                         # Executive summary
├── Concept.md                       # Vision et contenu
├── Frontend_Specification.md        # Architecture technique
└── UX_UI_Spec.md                    # Exigences UX/UI
```

**Contenu** :
- **PRD.md** (43KB, 2000+ lignes)
  - Tous les features épiques (EFs)
  - Tous les features non épiques (ENFs)
  - Chaque epic avec ses stories détaillées
  - Acceptance criteria par story

- **Brief.md** (10KB)
  - Problème à résoudre
  - Solution proposée
  - Personas cibles
  - Scope MVP

- **Concept.md** (15KB)
  - Vision globale
  - Piliers du projet
  - Architecture de contenu
  - 9 catégories de contenu

- **Frontend_Specification.md** (35KB)
  - Stack technique : SvelteKit 5 + Cloudflare Workers
  - Architecture et patterns
  - Conventions de code
  - Structure de projet

- **UX_UI_Spec.md** (35KB)
  - Objectifs UX
  - Personas et workflows
  - Accessibility (WCAG 2.1 AA)
  - Design system et composants

**Rôle dans le workflow** :
→ Point de départ unique pour toute implémentation
→ Référence pour valider chaque étape suivante

---

### **Niveau 2: EPIC - Organisation au Niveau Epic**

**Fichiers** : `docs/specs/epics/epic_X/`
```
docs/specs/epics/epic_X/
├── EPIC_TRACKING.md                 # Central hub pour l'epic
└── story_X_Y/                       # Stories (créées sur demande)
```

**EPIC_TRACKING.md** contient :
- Titre et description de l'epic
- Statut global (PLANNING / IN PROGRESS / COMPLETED)
- Tableau de **tous les stories** dans l'epic
  ```
  | Story | Titre | Description | Status | Phases | Progress |
  |-------|-------|-------------|--------|--------|----------|
  | 1.1   | ... | ... | NOT STARTED | 7 | 0/7 |
  | 1.2   | ... | ... | NOT STARTED | 5 | 0/5 |
  ```

**Créé par** : `/epic-initializer` skill
- Scan du PRD
- Extraction de tous les stories pour cet epic
- Création de la table de suivi centralisée

**Mis à jour par** :
- `story-phase-planner` skill (après planification de story)
- `phase-doc-generator` skill (après génération de phase)
- `phase-implementer` agent (après implémentation de phase)

**Rôle dans le workflow** :
→ Tableau de bord unique pour suivre la progression d'un epic
→ Vue d'ensemble rapide de tous les stories et phases
→ Suivi du progrès (Progress: 3/9 = 3 phases faites sur 9)

---

### **Niveau 3: STORY - Spécifications Stratégiques**

**Fichiers** : `docs/specs/epics/epic_X/story_X_Y/`
```
docs/specs/epics/epic_X/story_X_Y/
├── story_X.Y.md                     # Story spec (du PRD)
└── implementation/
    └── PHASES_PLAN.md               # Strategic breakdown
```

#### **story_X.Y.md** - Spécification de la Story

Créé par `/plan-story` skill, contient :
- Description de la story (extraite du PRD)
- Objectif fonctionnel
- Acceptance criteria (du PRD)
- Exigences techniques
- Dépendances avec d'autres stories

**Exemple** (Story 0.1 - Project Foundation) :
```markdown
# Story 0.1 - Project Foundation

## Description
Initialize sebc.dev project with core infrastructure,
SvelteKit 5, Cloudflare Workers bindings, and database setup.

## Acceptance Criteria
- [ ] SvelteKit 5 project created and builds successfully
- [ ] Cloudflare Workers bindings configured
- [ ] D1 database initialized
- [ ] Environment variables properly configured
- [ ] CI/CD pipeline working
- [ ] All types valid (pnpm typecheck passes)
```

#### **PHASES_PLAN.md** - Strategic Phases Breakdown

Créé par `/plan-story` skill, contient :
- **Why X phases?** - Justification du nombre de phases
- **Pour chaque phase** :
  - Objectif (une phrase)
  - Scope (features et composants)
  - Dépendances (phases dont elle dépend)
  - Livérables clés
  - Fichiers affectés
  - Estimations (jours, commits)

- **Implementation order** - Dépendance entre phases
- **Timeline** - Estimations globales
- **Risk assessment** - Risques identifiés
- **Testing strategy** - Approche de test

**Exemple** (Story 0.1) :
```markdown
# Story 0.1 - Phases Implementation Plan

## Phase Breakdown Strategy

This story is decomposed into **9 atomic phases** based on:

✅ Technical dependencies: Database → API → Config
✅ Risk mitigation: Security and infrastructure first
✅ Incremental value: Each phase deployable

## Phases Summary

### Phase 1: SvelteKit & Wrangler Setup
**Objective**: Initialize SvelteKit 5 project with Cloudflare Workers support
**Scope**:
- SvelteKit 5 project initialization
- Wrangler integration
- TypeScript configuration
**Files**: src/app.html, svelte.config.js, tsconfig.json
**Duration**: 2 days, ~3 commits

### Phase 2: Database Schema Setup
**Objective**: Initialize D1 database with Drizzle ORM
**Scope**:
- D1 database initialization
- Drizzle ORM setup
- Initial schema definition
**Files**: src/lib/db/schema.ts, wrangler.toml
**Duration**: 2 days, ~4 commits

... (autres phases)
```

**Créé par** : `/plan-story` command → `story-phase-planner` skill
**Mis à jour par** : Rarement (sauf si phases sont replannifiées)

**Rôle dans le workflow** :
→ Breakdown stratégique : "Comment implémenter cette story?"
→ Référence pour planning et estimation
→ Documentation du "pourquoi" des phases

---

### **Niveau 4: PHASE - Documentation Détaillée**

**Fichiers** : `docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/`
```
docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/
├── INDEX.md                         # Navigation et overview
├── IMPLEMENTATION_PLAN.md           # Stratégie atomic commits
├── COMMIT_CHECKLIST.md             # Détails par commit
├── ENVIRONMENT_SETUP.md            # Configuration env
├── validation/
│   └── VALIDATION_CHECKLIST.md     # Checklist validation
└── guides/
    ├── REVIEW.md                    # Guide de code review
    └── TESTING.md                   # Stratégie de test
```

**Créé par** : `/generate-phase-doc` command → `phase-doc-generator` skill

**7 documents automatiquement générés** (~3400 lignes total) :

1. **INDEX.md** (~300 lignes)
   - Overview de la phase
   - Liens vers tous les autres documents
   - Statut (NOT STARTED → IN PROGRESS → COMPLETED)
   - Scope et objectifs

2. **IMPLEMENTATION_PLAN.md** (~500 lignes)
   - Stratégie d'atomic commits
   - Nombre de commits adaptatif (1-20+ basé sur complexité)
   - Ordre logique : Types → Config → Implémentation → Tests
   - Estimations de taille

3. **COMMIT_CHECKLIST.md** (~600 lignes)
   - Checklist détaillée **par commit**
   - Pour chaque commit :
     - Fichiers à créer/modifier
     - Éléments à implémenter
     - Commandes de validation
     - Message de commit pré-écrit

4. **ENVIRONMENT_SETUP.md** (~400 lignes)
   - Dépendances nécessaires
   - Configuration SvelteKit + Cloudflare
   - Variables d'environnement
   - Scripts de setup

5. **guides/REVIEW.md** (~600 lignes)
   - Guide de code review **commit par commit**
   - Pour chaque commit : points clés à vérifier
   - Checklist de review
   - Red flags à surveiller

6. **guides/TESTING.md** (~500 lignes)
   - Stratégie de test pour la phase
   - Tests unitaires à écrire
   - Tests d'intégration
   - Coverage targets
   - Commandes pour lancer les tests

7. **validation/VALIDATION_CHECKLIST.md** (~500 lignes)
   - Checklist de validation finale
   - Tous les acceptance criteria
   - Commandes de validation
   - Checklist de déploiement

**Rôle dans le workflow** :
→ Documentation tactique : "Comment implémenter exactement?"
→ Prête pour développement immédiate
→ Contient tous les détails commit par commit

---

### **Niveau 5: COMMIT - Implémentation Détaillée**

**Fichiers** : Fichiers source du projet

**Créé par** : `phase-implementer` agent (un commit à la fois)

**Process** :
1. Lire COMMIT_CHECKLIST.md pour le commit courant
2. Implémenter les fichiers listés
3. Lancer les validations
4. Créer un git commit atomique
5. **STOP** - Attendre validation utilisateur
6. Passer au commit suivant

**Caractéristiques** :
- ✅ Atomic : Une responsabilité par commit
- ✅ Petit : Typiquement 50-300 lignes
- ✅ Reviewable : 15-90 min de review
- ✅ Safe : Peut être rollback indépendamment
- ✅ Progressive : Type-safe à chaque étape

**Rôle dans le workflow** :
→ Implémentation réelle du code
→ Suivi exact de COMMIT_CHECKLIST.md
→ Validation et testing à chaque step

---

## Workflow détaillé par étape

### **ÉTAPE 0: Préparation - Lire le PRD**

**Avant de commencer** : Familiarisez-vous avec le PRD :

```bash
# Lisez le PRD pour comprendre la structure générale
cat docs/specs/PRD.md

# Identifiez l'epic qui vous intéresse
# Exemple: Epic 0 - Project Foundation
# Exemple: Epic 1 - Content Management

# Lisez aussi les specs contextuelles
cat docs/specs/Brief.md           # Compréhension générale
cat docs/specs/Frontend_Specification.md  # Stack technique
cat docs/specs/UX_UI_Spec.md     # Exigences UX/UI
```

**Checkpoint** ✅
- Vous comprenez les objectifs du projet
- Vous connaissez la stack technique
- Vous avez identifié un epic/story à travailler

---

### **ÉTAPE 1: Epic Initialization (Epic-Initializer)**

**Quand** : Première fois pour un nouvel epic
**Commande** : `/epic-initializer` skill

**Input** :
```
Epic Reference: "Epic 1"
PRD Path: "docs/specs/PRD.md"
Output Directory: "docs/specs/epics/epic_1/"
```

**Le skill fait** :
1. Lire le PRD
2. Extraire tous les stories de Epic 1
3. Créer la table de suivi centralisée

**Output** :
```
docs/specs/epics/epic_1/
└── EPIC_TRACKING.md  (~150-250 lignes)

Contenu:
┌─────────────────────────────────────┐
│ Epic 1 - Content Management         │
│ Status: 📋 PLANNING                 │
│                                     │
│ Stories in This Epic:               │
│ ┌─────┬────────────┬────────────┐   │
│ │ 1.1 │ Add Posts  │ NOT STARTED│   │
│ │ 1.2 │ Edit Posts │ NOT STARTED│   │
│ │ 1.3 │ Delete ... │ NOT STARTED│   │
│ └─────┴────────────┴────────────┘   │
└─────────────────────────────────────┘
```

**Checkpoint** ✅
- EPIC_TRACKING.md créé
- Tous les stories listés
- Prêt pour story planning

---

### **ÉTAPE 2: Story Planning (Plan Story)**

**Quand** : Pour chaque story à implémenter
**Commande** : `/plan-story`

**Input** :
```
Story Reference: "Epic 1 Story 1.1"
PRD Path: "docs/specs/PRD.md" (auto-détecté)
Epic Directory: "docs/specs/epics/epic_1/" (auto-créé si nécessaire)
```

**Le skill fait** :
1. Lire le PRD, extraire Story 1.1
2. Créer story_1_1.md (spec de story)
3. Analyser complexity et dépendances
4. Créer PHASES_PLAN.md (breakdown stratégique)
5. Update EPIC_TRACKING.md

**Output** :
```
docs/specs/epics/epic_1/story_1_1/
├── story_1.1.md  (~200-400 lignes)
│   - Spécification extraite du PRD
│   - Acceptance criteria
│   - Exigences techniques
│
└── implementation/
    └── PHASES_PLAN.md  (~800-1200 lignes)
        - Phase breakdown strategy
        - 5 phases détaillées
        - Dependencies et timeline
        - Risk assessment
```

**Update** : EPIC_TRACKING.md
```
| 1.1 | Add Posts | Create, edit, delete posts | 🚧 IN PROGRESS | 5 | 0/5 |
```

**Checkpoint** ✅
- story_1.1.md créé et validé
- PHASES_PLAN.md créé avec phases réalistes
- EPIC_TRACKING.md updaté
- Prêt pour phase documentation

---

### **ÉTAPE 3: Phase Documentation (Generate Phase Doc)**

**Quand** : Pour chaque phase du story
**Commande** : `/generate-phase-doc`

**Input** :
```
Story Reference: "Epic 1 Story 1.1"
Phase Number: "1"
Phase Name: (auto-extrait de PHASES_PLAN.md)
```

**Le skill fait** :
1. Smart path detection : résout les chemins automatiquement
2. Lire PHASES_PLAN.md pour Phase 1
3. Générer 7 documents détaillés
4. Adapter commandes au tech stack (SvelteKit 5, pnpm, ESLint, Vitest)
5. Update EPIC_TRACKING.md

**Output** :
```
docs/specs/epics/epic_1/story_1_1/implementation/phase_1/
├── INDEX.md                    # Navigation
├── IMPLEMENTATION_PLAN.md      # X commits atomiques
├── COMMIT_CHECKLIST.md        # Détails par commit
├── ENVIRONMENT_SETUP.md       # Setup guide
├── validation/
│   └── VALIDATION_CHECKLIST.md
└── guides/
    ├── REVIEW.md               # Review guide
    └── TESTING.md              # Test strategy
```

**COMMIT_CHECKLIST.md structure** :
```
## Commit 1/5: Database Schema Setup

### Files to Create/Modify
- src/lib/db/schema.ts (new)
- src/lib/db/index.ts (new)
- wrangler.toml (modify)

### Implementation Checklist
- [ ] Import Drizzle types
- [ ] Define schema (users table)
- [ ] Configure D1 binding
- [ ] Export schema types

### Validation Commands
pnpm typecheck
pnpm lint

### Git Commands
git add src/lib/db/
git commit -m "Database Schema: Define users table with Drizzle ORM"
```

**Checkpoint** ✅
- 7 documents générés (3400+ lignes)
- COMMIT_CHECKLIST.md prêt
- Prêt pour implémentation

---

### **ÉTAPE 4: Phase Implementation (Phase Implementer)**

**Quand** : Pour chaque commit d'une phase
**Agent** : `phase-implementer` (one commit at a time)

**Process** (pour Commit 1/5) :

**1. Préparation**
```bash
# Lire COMMIT_CHECKLIST.md pour Commit 1
# Identifier les fichiers : src/lib/db/schema.ts, src/lib/db/index.ts
# Identifier les étapes : Types → Config → Implémentation
```

**2. Implémentation**
```typescript
// src/lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull().unique(),
  // ... autres colonnes
});
```

**3. Validation**
```bash
pnpm typecheck  # ✅ Pas d'erreurs types
pnpm lint       # ✅ ESLint OK
pnpm test       # ✅ Tests passent
```

**4. Update Documentation**
```bash
# INDEX.md : Status = IN PROGRESS
# COMMIT_CHECKLIST.md : Commit 1 marked [x]
```

**5. Git Commit**
```bash
git add src/lib/db/
git commit -m "Database Schema: Define users table with Drizzle ORM

- Create src/lib/db/schema.ts with Drizzle types
- Define users table structure
- Configure D1 binding in wrangler.toml
- Add TypeScript definitions"
```

**6. STOP & Wait**
→ Présenter résumé au user
→ Demander validation
→ Attendre "ok, next commit"

**7. Next Commit**
→ Phase Implementer reprend avec Commit 2

**Checkpoint** ✅
- Commit 1 fait et validé
- Tests et types passent
- Prêt pour Commit 2

---

## Documents et fichiers

### **Spec Files** (Reference - Read Only)
```
docs/specs/
├── PRD.md                           # Source de vérité
├── Brief.md                         # Executive summary
├── Concept.md                       # Vision
├── Frontend_Specification.md        # Architecture tech
└── UX_UI_Spec.md                    # Design requirements
```

### **Generated Files** (Per Epic)
```
docs/specs/epics/epic_X/
├── EPIC_TRACKING.md                 # Central tracking

└── story_X_Y/
    ├── story_X.Y.md                 # Story spec (from PRD)
    └── implementation/
        ├── PHASES_PLAN.md           # Strategic breakdown
        │
        ├── phase_1/
        │   ├── INDEX.md
        │   ├── IMPLEMENTATION_PLAN.md
        │   ├── COMMIT_CHECKLIST.md
        │   ├── ENVIRONMENT_SETUP.md
        │   ├── validation/
        │   │   └── VALIDATION_CHECKLIST.md
        │   └── guides/
        │       ├── REVIEW.md
        │       └── TESTING.md
        │
        ├── phase_2/
        │   ├── ... (7 documents)
        │
        └── phase_N/
            └── ... (7 documents)
```

### **Claude Automation Files** (.claude/)
```
.claude/
├── commands/
│   ├── plan-story.md               # /plan-story command
│   └── generate-phase-doc.md       # /generate-phase-doc command
│
├── skills/
│   ├── epic-initializer/SKILL.md
│   ├── story-phase-planner/SKILL.md
│   └── phase-doc-generator/SKILL.md
│
└── agents/
    └── phase-implementer.md         # Implementation agent
```

---

## Commandes et skills utilisées

### **Phase 1: Epic Initialization**
```bash
/epic-initializer
```
- **Input** : Epic reference (e.g., "Epic 1")
- **Output** : EPIC_TRACKING.md
- **Time** : 5-10 minutes
- **Automation** : ✅ Entièrement automatisé

### **Phase 2: Story Planning**
```bash
/plan-story
```
- **Input** : Story reference (e.g., "Epic 1 Story 1.1")
- **Output** : story_X.Y.md + PHASES_PLAN.md
- **Time** : 20-30 minutes (dépend de complexité)
- **Automation** : ✅ Entièrement automatisé

### **Phase 3: Phase Documentation**
```bash
/generate-phase-doc
```
- **Input** : Story reference + Phase number
- **Smart features** :
  - Auto-détecte les chemins
  - Auto-extrait le nom de phase
  - Adapte le tech stack automatiquement
- **Output** : 7 documents détaillés (~3400 lignes)
- **Time** : 15-20 minutes per phase
- **Automation** : ✅ Entièrement automatisé

### **Phase 4: Implementation**
```bash
phase-implementer (via Task tool)
```
- **Input** : Story reference + Phase number
- **Output** : Code implémenté + git commits
- **Process** : ONE COMMIT AT A TIME
- **Automation** : ✅ Semi-automatisé (attend validation entre commits)
- **Role** : Développeur exécute les commits, phase-implementer vérifie

---

## Exemples pratiques

### **Exemple 1: Implémenter Epic 0, Story 0.1, Phase 1**

**Jour 1: Preparation**
```bash
# Lire le PRD et comprendre Epic 0
cat docs/specs/PRD.md | grep -A 20 "Epic 0"
```

**Jour 2: Epic Initialization (10 min)**
```
Utilisateur: "Initialize Epic 0 please"
Claude: /epic-initializer skill
  → Crée docs/specs/epics/epic_0/EPIC_TRACKING.md
  → Liste 1 story (0.1)
```

**Jour 3: Story Planning (30 min)**
```
Utilisateur: "/plan-story Epic 0 Story 0.1"
Claude: /plan-story command
  → Crée story_0.1.md (spécification)
  → Crée PHASES_PLAN.md (9 phases identifiées)
  → Update EPIC_TRACKING.md
```

**Jour 4-5: Phase Documentation (20 min)**
```
Utilisateur: "/generate-phase-doc Epic 0 Story 0.1 Phase 1"
Claude: /generate-phase-doc command
  → Génère 7 documents pour Phase 1
  → IMPLEMENTATION_PLAN.md : 3 atomic commits
  → COMMIT_CHECKLIST.md : Prêt à implémenter
```

**Jour 6-8: Implementation (plusieurs jours)**
```
Utilisateur: "Implement Phase 1 Commit 1"
Claude: phase-implementer agent
  → Implémente src/app.html, svelte.config.js
  → Valide types et linting
  → Crée git commit
  → STOP - Attend validation

Utilisateur: "ok, next commit"
Claude: phase-implementer reprend
  → Commit 2 : Wrangler setup
  → Valide
  → STOP

Utilisateur: "ok, next"
Claude: Commit 3 : TypeScript configuration
  → ... et ainsi de suite
```

**Timeline** : ~2 semaines pour story complet (9 phases, ~40 commits)

---

### **Exemple 2: Tech Stack Adaptation**

**Le workflow s'adapte au tech stack** :

#### Linter
- SvelteKit → ESLint (was: Biome for Next.js)
- Command: `pnpm lint` (not `biome check`)

#### Package Manager
- Default: `pnpm` (also supports npm, yarn)
- Install: `pnpm install` (not npm install)

#### Test Framework
- Default: Vitest (also supports Jest, pytest)
- Run: `pnpm test` (not jest)

#### Build Tool
- Default: Vite via SvelteKit
- Command: `pnpm build`

#### Database
- D1 (SQLite) with Drizzle ORM
- Migrations: `wrangler d1 migrations create`

**Les scripts d'implémentation sont auto-adaptés** par `phase-doc-generator` en fonction du fichier PHASES_PLAN.md.

---

## Checklist de validation

### **Avant de commencer**
- [ ] Vous avez lu le PRD et compris les objectifs
- [ ] Vous avez lu Brief.md pour la vision
- [ ] Vous avez lu Frontend_Specification.md pour le tech stack
- [ ] Vous avez identifié l'epic/story à travailler

### **Après Epic Initialization**
- [ ] EPIC_TRACKING.md créé dans docs/specs/epics/epic_X/
- [ ] Tous les stories du PRD listés dans le tableau
- [ ] Statuts initialisés à "NOT STARTED"

### **Après Story Planning**
- [ ] story_X.Y.md créé et contient story specification
- [ ] PHASES_PLAN.md créé avec phase breakdown
- [ ] Nombre de phases adapté à la complexité (pas de template fixe)
- [ ] Dépendances entre phases documentées
- [ ] EPIC_TRACKING.md updaté (Status de story = IN PROGRESS)

### **Après Phase Documentation**
- [ ] 7 documents générés dans phase_X/
- [ ] IMPLEMENTATION_PLAN.md contient N commits atomiques
- [ ] COMMIT_CHECKLIST.md contient détails par commit
- [ ] Tech stack correct (SvelteKit, ESLint, pnpm, Vitest, etc.)
- [ ] Commandes adaptées au project (not Next.js/Biome)
- [ ] EPIC_TRACKING.md updaté avec phase info

### **Après chaque Commit Implementation**
- [ ] Files créés/modifiés correspondent à COMMIT_CHECKLIST.md
- [ ] `pnpm typecheck` : ✅ Pas d'erreurs
- [ ] `pnpm lint` : ✅ Linting OK
- [ ] `pnpm test` : ✅ Tests passent (si applicable)
- [ ] Git commit créé avec message descriptif
- [ ] Documentation (INDEX.md, COMMIT_CHECKLIST.md) updatée

### **Après Phase Completion**
- [ ] Tous les commits implémentés et validés
- [ ] Validation checklist complétée
- [ ] EPIC_TRACKING.md : Phase progress = 7/7 (ou nombre final)
- [ ] Prêt pour phase suivante

### **Après Story Completion**
- [ ] Toutes les phases implémentées
- [ ] EPIC_TRACKING.md : Story status = ✅ COMPLETED
- [ ] Progress = 9/9 (ou nombre final de phases)
- [ ] Acceptances criteria du story validés

### **Après Epic Completion**
- [ ] Tous les stories complétés
- [ ] EPIC_TRACKING.md : Status = ✅ COMPLETED
- [ ] Tous les stories du tableau marqués COMPLETED
- [ ] Epic progress = X/X stories

---

## Résumé et Quick Reference

### **Le Workflow en Une Phrase**
PRD → Epic Init → Story Plan → Phase Docs → Atomic Commits

### **Commandes à Utiliser**
| Étape | Commande | Quand | Entrée | Sortie |
|-------|----------|-------|--------|--------|
| 1 | `/epic-initializer` | Nouveau epic | "Epic X" | EPIC_TRACKING.md |
| 2 | `/plan-story` | Nouveau story | "Epic X Story X.Y" | story_X.Y.md + PHASES_PLAN.md |
| 3 | `/generate-phase-doc` | Chaque phase | "Epic X Story X.Y Phase Z" | 7 documents |
| 4 | `phase-implementer` | Chaque commit | Phase docs | Code + git commits |

### **Fichiers Importants**
| Fichier | Type | Création | Rôle |
|---------|------|----------|------|
| PRD.md | Reference | Manuel | Source de vérité produit |
| EPIC_TRACKING.md | Generated | epic-initializer | Dashboard epic |
| story_X.Y.md | Generated | story-phase-planner | Story spec (du PRD) |
| PHASES_PLAN.md | Generated | story-phase-planner | Strategic breakdown |
| COMMIT_CHECKLIST.md | Generated | phase-doc-generator | Implementation guide |
| Source files | Generated | phase-implementer | Code réel |

### **Temps Estimés**
- Epic Initialization : ~10 min
- Story Planning : ~30 min (simple) à 1-2h (complexe)
- Phase Documentation : ~20 min par phase (auto-générée)
- Implementation : ~5 commits par phase × 30 min = 2-3h par phase

---

**Prêt à commencer?** 🚀

Utilisez `/epic-initializer` pour créer le premier Epic, puis suivez le workflow étape par étape!
