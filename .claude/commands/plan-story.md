# Plan Story Phases

This command invokes the **story-phase-planner** skill to analyze a user story and create a strategic implementation phases plan.

## What This Does

**Analyzes a user story and creates a strategic phases breakdown document**:

- Decomposes story into optimal number of phases (adaptive sizing: 1-20+ based on complexity)
- Identifies dependencies and parallelization opportunities
- Provides estimates for duration, complexity, and risk
- Creates implementation order and timeline
- Generates `PHASES_PLAN.md` (~800-1200 lines)

**This is the FIRST step** before detailed phase documentation.

## How Invocation Works

⚡ **Model-invoked (Automatic)**: Claude can discover and use this skill automatically when you mention terms like:

- "plan story phases"
- "break down story into phases"
- "story planning"
- "create phases plan"
- "decompose story"
- "how should I implement this story?"

🎯 **User-invoked (Manual)**: Or use this slash command to explicitly invoke the skill.

## Complete Workflow

The recommended three-tier workflow for implementing stories:

```
Step 1: Initialize Epic (if needed)
   /epic-initializer [or] epic-initializer skill
   → Creates: docs/specs/epics/epic_X/EPIC_TRACKING.md
   ↓
Step 2: Plan Story Phases (THIS COMMAND)
   /plan-story
   → Creates: docs/specs/epics/epic_X/story_X_Y/story_X.Y.md
   → Creates: docs/specs/epics/epic_X/story_X_Y/implementation/PHASES_PLAN.md
   ↓
Step 3: Generate Phase Documentation
   /generate-phase-doc [for each phase]
   → Creates: docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/ (7 files)
   ↓
Step 4: Implement Each Phase
   phase-implementer agent (one commit at a time)
   → Follow COMMIT_CHECKLIST.md
   → Update EPIC_TRACKING.md as phases complete
```

---

## Context Documents

Before planning a story, review the relevant specifications:

- **PRD.md**: `docs/specs/PRD.md` - Product requirements with all epics and stories
- **Frontend_Specification.md**: `docs/specs/Architecture_technique.md` - Technical architecture and patterns
- **UX_UI_Spec.md**: `docs/specs/UX_UI_Spec.md` - Design requirements and user experience principles
- **Brief.md**: `docs/specs/Brief.md` - Project goals and target personas
- **Concept.md**: `docs/specs/Concept.md` - Vision and content architecture

## Instructions for Manual Invocation

When you use this command, the skill will guide you through creating a strategic phases plan.

### Step 1: Gather Information

The skill will ask you for:

1. **Story Reference** (e.g., "Epic 1 Story 1.1", "Epic 2 Story 3")
2. **PRD Path** (default: `docs/specs/PRD.md`)
3. **Epic Directory** (auto-created if needed)
4. **Tech Stack** (optional, helps with technical dependency analysis)
5. **Team Size** (optional, helps with resource estimation)

### Step 2: Story Extraction from PRD

The skill will:

1. Read the PRD (`docs/specs/PRD.md`)
2. Extract the specified story (objectives, acceptance criteria, requirements)
3. Create the story specification file: `docs/specs/epics/epic_X/story_X_Y/story_X.Y.md`
4. Identify features and components to build
5. Assess technical dependencies and constraints

### Step 3: Phase Decomposition

The skill decomposes your story into the optimal number of phases based on:

- **Story complexity**: Simple (1-3 phases), Medium (4-6), Complex (7-10), Very Complex (10+)
- **Technical dependencies**: What must come first
- **Risk mitigation**: Isolate high-risk work
- **Incremental value**: Each phase delivers something testable
- **Team capacity**: Typically sized for 2-5 days of work (can vary)
- **Parallelization**: Identify independent work streams

**Phase Sizing Principles**:

- ✅ Independent (can be tested alone)
- ✅ Deliverable (produces working functionality)
- ✅ Appropriately sized (typically 2-5 days, adaptive commit count based on complexity)
- ✅ Low coupling (minimal phase dependencies)
- ✅ High cohesion (focused objective)

### Step 4: Generate PHASES_PLAN.md

Creates a comprehensive strategic plan including:

**For Each Phase**:

- Objective and scope
- Key deliverables
- Files affected
- Dependencies (what it needs, what needs it)
- Complexity and risk assessment
- Duration and commit estimates
- Success criteria
- Technical notes

**Overall**:

- Dependency graph
- Implementation order
- Timeline and resource estimates
- Risk assessment
- Testing strategy
- Next steps

### Step 5: Validation

The skill automatically validates:

- ✅ Phase count matches story complexity (adaptive sizing based on actual work)
- ✅ Dependencies are logical and documented
- ✅ Estimates are realistic
- ✅ All story acceptance criteria covered
- ✅ Each phase is independently testable
- ✅ No circular dependencies

---

## Generated Document Structure

```
docs/specs/epics/epic_X/story_X_Y/
├── story_X.Y.md                           # Story specification (extracted from PRD)
└── implementation/
    └── PHASES_PLAN.md                     # Strategic overview (~800-1200 lines)
        ├── Story Overview
        ├── Phase Breakdown Strategy
        ├── Phases Summary (detailed for each phase)
        ├── Implementation Order & Dependencies
        ├── Timeline & Resource Estimation
        ├── Risk Assessment
        ├── Testing Strategy
        ├── Phase Documentation Strategy
        └── Next Steps
```

---

## Phase Planning Best Practices

### The "Goldilocks" Principle

**Too Small** (<1 day):

- ❌ Too much overhead
- ❌ Context switching
- ❌ Review fatigue

**Too Large** (>7 days):

- ❌ Hard to review
- ❌ Risky rollback
- ❌ Delayed integration

**Just Right** (2-5 days):

- ✅ Focused and reviewable
- ✅ Safe rollback scope
- ✅ Clear milestones
- ✅ Progressive value

### Common Phase Patterns

1. **Foundation**: Types, schemas, config
2. **Data Layer**: Database, models, migrations
3. **Core Logic**: Business logic, utilities
4. **Integration**: APIs, external services
5. **UI/UX**: Components, pages, interactions
6. **Testing**: E2E tests, validation
7. **Polish**: Performance, accessibility, docs

---

## Examples

### Example 1: E-Commerce Product Catalog

**Story**: "As a user, I want to browse and search products by category with filters"

**Generated Plan**: 5 phases

1. Product data models & schema (2d, Low risk)
2. Product API endpoints (3d, Medium risk)
3. Search & filter logic (3d, High risk - performance)
4. Product listing UI (4d, Medium risk)
5. E2E tests & optimization (3d, Medium risk)

**Total**: 15 days, ~25 commits

### Example 2: User Authentication

**Story**: "As a user, I want to sign up, log in, and manage my profile securely"

**Generated Plan**: 4 phases

1. Auth types & database schema (2d, Low risk)
2. JWT service & security (3d, High risk - security)
3. Auth API endpoints (4d, Medium risk)
4. Profile UI & tests (3d, Low risk)

**Total**: 12 days, ~20 commits

### Example 3: Real-time Chat

**Story**: "As a user, I want to send and receive real-time messages"

**Generated Plan**: 6 phases

1. WebSocket infrastructure (2d, Medium risk)
2. Message models & storage (2d, Low risk)
3. Real-time message service (4d, High risk - concurrency)
4. Chat UI components (3d, Medium risk)
5. Presence & typing indicators (2d, Low risk)
6. E2E tests & load testing (3d, Medium risk)

**Total**: 16 days, ~30 commits

---

## After Planning: Next Steps

Once PHASES_PLAN.md is generated:

### 1. Review with Team

- Validate phase breakdown
- Adjust estimates if needed
- Identify missing phases or dependencies
- Confirm risk assessments

### 2. Generate Detailed Phase Documentation

For each phase, use the `phase-doc-generator` skill:

**Option A: Automatic**

```
"Generate implementation docs for Phase 1 of Story 1.1"
```

**Option B: Manual**

```
/generate-phase-doc
```

This creates 7 detailed documents per phase:

- INDEX.md
- IMPLEMENTATION_PLAN.md (atomic commits)
- COMMIT_CHECKLIST.md
- ENVIRONMENT_SETUP.md
- guides/REVIEW.md
- guides/TESTING.md
- validation/VALIDATION_CHECKLIST.md

### 3. Start Implementation

Follow the workflow:

1. **Plan**: PHASES_PLAN.md (strategic overview)
2. **Detail**: Phase-specific docs (tactical implementation)
3. **Implement**: Follow commit checklists
4. **Validate**: Complete validation checklists
5. **Next**: Move to next phase

---

## Quality Standards

The generated plan follows these standards:

- **Comprehensive**: All aspects of implementation covered
- **Realistic**: Estimates based on actual work complexity
- **Risk-aware**: Identifies and mitigates risks
- **Testable**: Clear success criteria for each phase
- **Independent**: Phases can be implemented separately
- **Valuable**: Each phase delivers working functionality

---

## Integration with phase-doc-generator

**Two-tier Documentation Strategy**:

**Tier 1 - Strategic (this skill)**:

- `PHASES_PLAN.md`: High-level overview
- Cross-phase coordination
- Overall timeline and dependencies
- Story-level success criteria

**Tier 2 - Tactical (phase-doc-generator)**:

- 7 detailed docs per phase
- Commit-by-commit implementation
- Specific technical validations
- Phase-level success criteria

**Together**: Complete documentation from strategy to execution.

---

## See Also

- **Epic Initializer**: `.claude/skills/epic-initializer/SKILL.md` - Initialize epic with EPIC_TRACKING.md
- **Skill Documentation**: `.claude/skills/story-phase-planner/SKILL.md`
- **README**: `.claude/skills/story-phase-planner/README.md`
- **Phase Generator**: `.claude/skills/phase-doc-generator/SKILL.md`
- **Phase Command**: `.claude/commands/generate-phase-doc.md`

---

**Ready to plan? The skill will now ask you for your story information!**
