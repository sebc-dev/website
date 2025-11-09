# Story Phase Planner

A Claude Code **Agent Skill** that analyzes user stories and creates strategic implementation phase breakdowns.

**Version**: 1.1.0
**Type**: Project Skill
**Auto-invocation**: ✅ Enabled (model-invoked based on trigger keywords)

## 🎯 What It Does

Analyzes a user story specification and creates a **strategic phases breakdown plan** that:

- Decomposes story into optimal number of phases (adaptive sizing: 1-20+ based on complexity)
- Identifies technical dependencies and parallelization opportunities
- Provides realistic estimates for duration, complexity, and risk
- Creates clear implementation order and timeline
- Generates a comprehensive PHASES_PLAN.md document (~800-1200 lines)

**This is Step 1** in the two-tier documentation strategy, providing the strategic overview before detailed phase-by-phase implementation planning.

---

## 🚀 Quick Start

### 1. Installation

The skill is already installed in this project at `.claude/skills/story-phase-planner/`.

For other projects, copy the entire directory:

```bash
# From your project root
mkdir -p .claude/skills
cp -r /path/to/story-phase-planner .claude/skills/
```

### 2. Usage

**Option A: Automatic Invocation (Recommended) ⚡**

Just describe what you need using trigger keywords:

```
"Plan the implementation phases for Story 1.1"
"Break down Story 2.3 into implementable phases"
"I need a phases plan for the authentication story"
"How should I decompose this story into phases?"
```

Claude will automatically detect and invoke the skill based on these keywords:

- "plan story phases"
- "break down story"
- "story planning"
- "create phases plan"
- "decompose story"

**Option B: Manual Invocation via Slash Command 🎯**

```bash
# Explicitly invoke the skill
/plan-story
```

**Option C: Direct Request**

```
Use the story-phase-planner skill for Story 1.1
Spec location: docs/specs/epics/epic_1/story_1_1.md
```

The skill will ask you for:

1. Story reference (e.g., "Epic 1 Story 1.1")
2. PRD path (default: `docs/specs/PRD.md`)
3. Output directory (default: `docs/specs/epics/epic_X/story_X_Y/`)
4. Optional: Tech stack, team size

---

## 🏗️ How It Works

### Model-Invoked Skill Architecture

This is a **model-invoked skill**, meaning Claude autonomously decides when to use it based on:

1. **Trigger keywords** in your request
2. **Context matching** with the skill's capabilities
3. **Task requirements** aligning with story planning

**Benefits of Model-Invoked Skills**:
✅ Natural conversation flow
✅ Context-aware invocation
✅ Composable with other skills

---

## 📋 Prerequisites

### 1. Product Requirements Document (PRD)

The skill extracts stories directly from your PRD located at `docs/specs/PRD.md`.

Your PRD should contain:

- **Epic sections**: Organized list of epics
- **Story descriptions**: For each story within an epic
- **Acceptance Criteria**: Referenced as EF (Functional) and ENF (Non-Functional) requirements
- **Technical Requirements**: Frameworks, APIs, integrations
- **Constraints**: Time, resources, dependencies

**Example PRD structure**:

```markdown
# Product Requirements Document (PRD)

## Exigences Fonctionnelles

### EF1 — Feature Name

**Description**: Feature description
**Critères d'acceptation**:

- CA1: Criterion 1
- CA2: Criterion 2

## 🧩 EPIC 1 — Epic Name

- **1.1** Story 1.1 description
- **1.2** Story 1.2 description
- **1.3** Story 1.3 description
```

The skill will extract the specified story and create a dedicated story specification file.

---

## 📚 Generated Documentation

### Structure

```
docs/specs/epics/epic_X/story_X_Y/
├── story_X.Y.md                   # Story specification (extracted from PRD)
└── implementation/
    └── PHASES_PLAN.md             # Strategic phases breakdown (~800-1200 lines)
```

### story_X.Y.md Contents

**Story specification extracted from PRD**:

- Story description and user value
- Acceptance criteria (EF/ENF references)
- Technical requirements
- Features and components
- Dependencies on other stories

### PHASES_PLAN.md Contents

**Strategic Overview**:

- Story objectives and acceptance criteria
- Phase breakdown rationale
- Overall timeline and resources

**Per-Phase Details**:

- Objective and scope
- Key deliverables and files affected
- Dependencies (requires, blocks)
- Complexity, risk, and duration estimates
- Success criteria
- Technical notes

**Coordination**:

- Dependency graph
- Implementation order
- Parallelization opportunities
- Risk assessment
- Testing strategy
- Next steps

---

## 🎓 Phase Planning Principles

### The "Goldilocks" Phase Size

**Too Small** (<1 day, <3 commits):

- ❌ Too much overhead
- ❌ Context switching costs
- ❌ Review fatigue

**Too Large** (>7 days, >15 commits):

- ❌ Hard to review
- ❌ Risky to roll back
- ❌ Delayed integration
- ❌ Merge conflicts

**Typically Optimal** (2-5 days, adaptive commit count):

- ✅ Focused and reviewable
- ✅ Safe rollback scope
- ✅ Progressive integration
- ✅ Clear milestones
- ✅ Commit count reflects actual complexity (1-20+ as needed)

### Phase Independence Test

A good phase should answer "yes" to:

1. Can this phase be tested independently?
2. Can this phase be reviewed in <2 hours?
3. Does this phase deliver tangible value?
4. Can this phase be rolled back without breaking others?
5. Is this phase sized for 2-5 days of work?

### Common Phase Patterns

1. **Foundation**: Types, schemas, configuration
2. **Data Layer**: Database, models, migrations
3. **Core Logic**: Business logic, utilities
4. **Integration**: APIs, external services
5. **UI/UX**: Components, pages, interactions
6. **Testing**: E2E tests, validation
7. **Polish**: Performance, accessibility, docs

---

## 📊 Examples

### Example 1: E-Commerce Product Catalog

**Story**: "As a user, I want to browse and search products by category with filters"

**Generated Plan**: 5 phases (~15 days)

1. **Phase 1**: Product data models & database schema
   - Duration: 2 days | Commits: ~5 | Risk: 🟢 Low

2. **Phase 2**: Product API endpoints (REST)
   - Duration: 3 days | Commits: ~6 | Risk: 🟡 Medium

3. **Phase 3**: Search & filter logic
   - Duration: 3 days | Commits: ~7 | Risk: 🔴 High (performance)

4. **Phase 4**: Product listing UI components
   - Duration: 4 days | Commits: ~8 | Risk: 🟡 Medium

5. **Phase 5**: E2E tests & performance optimization
   - Duration: 3 days | Commits: ~6 | Risk: 🟡 Medium

**Parallelization**: Phases 2 and 4 can partially overlap (backend/frontend teams)

### Example 2: User Authentication

**Story**: "As a user, I want to sign up, log in, and manage my profile securely"

**Generated Plan**: 4 phases (~12 days)

1. **Phase 1**: Auth types, database schema, migrations
   - Duration: 2 days | Commits: ~4 | Risk: 🟢 Low

2. **Phase 2**: JWT service, password hashing, session management
   - Duration: 3 days | Commits: ~6 | Risk: 🔴 High (security)

3. **Phase 3**: Auth API endpoints (signup, login, logout, refresh)
   - Duration: 4 days | Commits: ~7 | Risk: 🟡 Medium

4. **Phase 4**: Profile UI & integration tests
   - Duration: 3 days | Commits: ~5 | Risk: 🟢 Low

**Critical Path**: Sequential (security requirements)

---

## 🔄 Complete Workflow

### Two-Tier Documentation Strategy

**Tier 1 - Strategic (this skill)**:

```
PRD → [story-phase-planner] → story_X.Y.md + PHASES_PLAN.md
```

- Extract story from PRD
- Create story specification
- High-level phase overview
- Cross-phase coordination
- Overall timeline
- Story-level success criteria

**Tier 2 - Tactical (phase-doc-generator)**:

```
PHASES_PLAN.md → [phase-doc-generator] × N → Phase docs (7 files each)
```

- Commit-by-commit implementation
- Specific technical validations
- Phase-level success criteria

### Implementation Steps

1. **Ensure PRD is Ready**
   PRD exists at `docs/specs/PRD.md` with epics and stories defined

2. **Generate Story Spec & Strategic Plan**
   Use `/plan-story` or mention "plan story phases for Epic X Story Y"
   → Extracts story from PRD
   → Creates `story_X.Y.md` (story spec)
   → Creates `implementation/PHASES_PLAN.md` (strategic plan)

3. **Review Plan**
   Validate with team, adjust if needed

4. **Generate Detailed Docs** (for each phase)
   Use `/generate-phase-doc` or mention "generate phase documentation"
   → Creates 7 detailed docs per phase

5. **Implement Phase-by-Phase**
   Follow detailed docs, validate, move to next

---

## 🛠️ Configuration

### File Structure

```
.claude/skills/story-phase-planner/
├── SKILL.md               # Main skill file (frontmatter + instructions)
├── README.md             # This file - comprehensive guide
└── CHANGELOG.md          # Version history
```

**Key File**: `SKILL.md` contains:

- **YAML Frontmatter**: Metadata (name, description, version, allowed-tools)
- **Instructions**: Complete agent workflow and templates
- **Examples**: Concrete use cases

### Default Settings

Output directory: `docs/implementation/story_X_Y/`
Phase count: Adaptive (1-20+ based on story complexity)
Phase duration: Typically 2-5 days each (can vary)
Phase commits: Adaptive per phase (1-20+ based on phase complexity)

### Customization

The skill adapts based on:

- Story complexity (more phases for complex stories)
- Tech stack (considers framework-specific dependencies)
- Team size (adjusts parallelization suggestions)
- Risk factors (isolates high-risk work)

---

## 📞 Support

### Troubleshooting

**Issue**: Skill doesn't activate automatically
**Solution**: Make sure your request includes trigger keywords like "plan story phases" or "decompose story"

**Issue**: Generated phases are too large/small
**Solution**: Review PHASES_PLAN.md and manually adjust phase breakdown, or regenerate with more specific story requirements

**Issue**: Dependency graph seems incorrect
**Solution**: Verify your story spec includes clear technical requirements and constraints

**Issue**: Missing risk assessment
**Solution**: Ensure your story spec mentions potential challenges, performance requirements, or security concerns

### Getting Help

1. Check `SKILL.md` for complete skill documentation
2. Review example story specifications
3. Verify your story spec is comprehensive
4. Try regenerating with more detailed requirements

---

## 🎯 Integration with phase-doc-generator

These two skills work together:

**story-phase-planner** (this skill):

- Strategic planning
- Phase decomposition
- High-level estimates
- Dependency analysis

**phase-doc-generator**:

- Tactical implementation
- Atomic commit breakdown
- Detailed checklists
- Technical validation

**Together**: Complete documentation from strategy to execution.

**Workflow**:

1. Start with `story-phase-planner` to create PHASES_PLAN.md
2. For each phase in the plan, use `phase-doc-generator` to create detailed docs
3. Implement phase by phase following the detailed documentation
4. Track progress in PHASES_PLAN.md

---

## 🌟 Why Use This Skill?

### Time Savings

- **Manual planning**: 2-4 hours per story
- **With this skill**: 5-10 minutes
- **Savings**: ~3-4 hours per story

### Quality Improvements

- **Structured approach**: Consistent phase breakdown
- **Risk awareness**: Proactive risk identification
- **Realistic estimates**: Based on proven patterns
- **Complete coverage**: All story aspects addressed

### Better Collaboration

- **Clear roadmap**: Everyone knows the plan
- **Defined milestones**: Easy progress tracking
- **Parallelization**: Identify independent work
- **Dependency transparency**: No surprises

---

## 📜 Version History

**Current Version**: 1.0.0

### What's New in 1.0.0

- ✅ Initial release
- ✅ Proper YAML frontmatter in SKILL.md
- ✅ Enhanced description with trigger keywords
- ✅ Tool restrictions (Read, Write, Glob, Grep, Bash only)
- ✅ Comprehensive phase breakdown templates
- ✅ Dependency analysis and risk assessment
- ✅ Integration with phase-doc-generator skill

---

**Version**: 1.0.0
**Last Updated**: 2025-10-28
**Created by**: Claude Code
**Skill Type**: Model-Invoked Project Skill

**This skill follows Claude Code Agent Skills best practices and integrates seamlessly with the phase-doc-generator workflow! 🎉**
