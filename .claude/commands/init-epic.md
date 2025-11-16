# Initialize Epic

This command invokes the **epic-initializer** skill to create a new epic structure with tracking documentation.

## What This Does

**Initializes a new epic with complete directory structure and tracking**:

- Creates epic directory structure (`docs/specs/epics/epic_X/`)
- Generates EPIC_TRACKING.md with all stories from PRD
- Sets up story management templates
- Initializes progress tracking system
- Documents dependencies and milestones

**This is the FIRST step** before planning individual stories.

## How Invocation Works

⚡ **Model-invoked (Automatic)**: Claude can discover and use this skill automatically when you mention terms like:

- "initialize epic"
- "create epic structure"
- "set up epic tracking"
- "start new epic"
- "epic setup"

🎯 **User-invoked (Manual)**: Or use this slash command to explicitly invoke the skill.

## Complete Workflow

The recommended workflow for managing epics and stories:

```
Step 1: Initialize Epic (THIS COMMAND)
   /init-epic
   → Creates: docs/specs/epics/epic_X/EPIC_TRACKING.md
   → Sets up: Story tracking table
   ↓
Step 2: Plan Story Phases
   /plan-story [for each story]
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

Before initializing an epic, review the product specifications:

- **PRD.md**: `docs/specs/PRD.md` - Product requirements with all epics and stories
- **Brief.md**: `docs/specs/Brief.md` - Project goals and executive summary
- **Concept.md**: `docs/specs/Concept.md` - Vision, personas, and content architecture

## Instructions for Manual Invocation

When you use this command, the skill will guide you through creating an epic structure.

### Step 1: Gather Information

The skill will ask you for:

1. **Epic Reference** (e.g., "Epic 1", "Epic 2")
2. **PRD Path** (default: `docs/specs/PRD.md`)
3. **Output Directory** (optional, auto-determined as `docs/specs/epics/epic_X/`)

### Step 2: Extract Epic from PRD

The skill will:

1. Read the PRD (`docs/specs/PRD.md`)
2. Extract the specified epic (title, description, objectives)
3. Identify all stories within the epic (e.g., 1.1, 1.2, 1.3...)
4. Extract story titles and descriptions
5. Document epic-level dependencies and goals

### Step 3: Create Directory Structure

Creates the epic directory:

```
docs/specs/epics/epic_X/
└── EPIC_TRACKING.md          # Central tracking document
```

Story directories (`story_X_Y/`) will be created automatically when `/plan-story` is used.

### Step 4: Generate EPIC_TRACKING.md

Creates a comprehensive tracking document including:

**Epic Metadata**:

- Epic title and description
- Status (PLANNING / IN PROGRESS / COMPLETED)
- Created date and target completion

**Stories Table**:

- All stories from PRD
- Status tracking (NOT STARTED → IN PROGRESS → COMPLETED)
- Phase count and progress tracking
- Story descriptions

**Management Tools**:

- Story management workflow
- Progress metrics
- Dependency documentation
- Milestone tracking
- Quick action commands

### Step 5: Validation

The skill automatically validates:

- ✅ EPIC_TRACKING.md created successfully
- ✅ All stories from PRD listed in table
- ✅ No placeholder text remaining
- ✅ Proper markdown formatting
- ✅ File size reasonable (~150-250 lines)

---

## Generated Document Structure

```
docs/specs/epics/epic_X/
└── EPIC_TRACKING.md                     # Epic tracking (~150-250 lines)
    ├── Epic Overview (description, objectives, user value)
    ├── Stories Table (all stories with progress tracking)
    ├── Story Management Guide (workflow instructions)
    ├── Epic-Level Metrics (progress summary)
    ├── Dependencies (story and external dependencies)
    ├── Status Updates (milestones and recent changes)
    ├── Reference Documents (links to specs and plans)
    └── Checklists (setup, execution, completion)
```

---

## EPIC_TRACKING.md Contents

The generated tracking document includes:

### Epic Overview

- Description (extracted from PRD)
- Epic objectives
- User value proposition

### Stories Table

| Story | Title | Description | Status         | Phases | Progress |
| ----- | ----- | ----------- | -------------- | ------ | -------- |
| X.1   | ...   | ...         | 📋 NOT STARTED | -      | 0/0      |
| X.2   | ...   | ...         | 📋 NOT STARTED | -      | 0/0      |

**Status Values**:

- 📋 NOT STARTED - Story not yet planned
- 🚧 IN PROGRESS - Story planned and implementation started
- ✅ COMPLETED - All phases completed

### Story Management

Instructions for progressing stories through:

1. Planning phase (using `/plan-story`)
2. Implementation (using phase docs)
3. Completion (updating tracking table)

### Metrics & Timeline

- Stories started/completed counts
- Total phases and phases completed
- Epic timeline (created, expected start/completion)

### Dependencies

- Dependencies between stories
- External dependencies (APIs, designs, etc.)

### Status Updates

- Milestone tracking
- Recent updates log

### Reference Documents

- Links to story specs (added as stories are planned)
- Links to phase plans
- PRD reference

---

## Epic Planning Best Practices

### Epic Sizing

**Small Epic** (2-3 stories):

- ✅ Quick to complete
- ✅ Focused scope
- ✅ Low coordination overhead

**Medium Epic** (4-6 stories):

- ✅ Balanced scope
- ✅ Deliverable in 4-8 weeks
- ✅ Manageable dependencies

**Large Epic** (7+ stories):

- ⚠️ May need breakdown
- ⚠️ Higher coordination needs
- ⚠️ Consider sub-epics

### Story Dependencies

Document in EPIC_TRACKING.md:

- **Sequential**: Story X.1 must complete before X.2
- **Parallel**: Stories X.2 and X.3 can run simultaneously
- **External**: Dependencies on other teams/systems

---

## Examples

### Example 1: E-Commerce Product Catalog

**Epic**: "Epic 1 - Product Catalog System"

**Stories** (from PRD):

- Story 1.1: Product data models
- Story 1.2: Product listing page
- Story 1.3: Search and filters
- Story 1.4: Product detail page

**Generated**:

- Directory: `docs/specs/epics/epic_1/`
- File: `EPIC_TRACKING.md` with 4 stories
- Status: 📋 PLANNING
- Progress: 0/4 stories started

### Example 2: User Authentication

**Epic**: "Epic 2 - User Authentication Flow"

**Stories** (from PRD):

- Story 2.1: Sign up flow
- Story 2.2: Login system
- Story 2.3: Password recovery
- Story 2.4: Profile management
- Story 2.5: Session handling

**Generated**:

- Directory: `docs/specs/epics/epic_2/`
- File: `EPIC_TRACKING.md` with 5 stories
- Dependencies documented (2.1 → 2.2 → 2.5)
- Status: 📋 PLANNING

### Example 3: Payment Integration

**Epic**: "Epic 3 - Payment Processing"

**Stories** (from PRD):

- Story 3.1: Stripe integration
- Story 3.2: Payment methods
- Story 3.3: Checkout flow
- Story 3.4: Order confirmation
- Story 3.5: Refund handling

**Generated**:

- Directory: `docs/specs/epics/epic_3/`
- File: `EPIC_TRACKING.md` with 5 stories
- External dependencies noted (Stripe API, PCI compliance)
- Milestones defined

---

## After Initialization: Next Steps

Once the epic is initialized:

### 1. Review EPIC_TRACKING.md

- Validate story breakdown from PRD
- Confirm dependencies
- Set realistic milestones
- Share with team

### 2. Plan Stories

For each story in the epic, use `/plan-story`:

```bash
/plan-story Epic 1 Story 1.1
/plan-story Epic 1 Story 1.2
# ... etc
```

This creates:

- Story specification (`story_X.Y.md`)
- Phase plan (`PHASES_PLAN.md`)

### 3. Track Progress

As you work through stories:

- Update status in EPIC_TRACKING.md
- Mark phases as completed
- Update progress metrics
- Document blockers or decisions

### 4. Epic Completion

When all stories are done:

- Mark epic status as ✅ COMPLETED
- Update final metrics
- Document lessons learned

---

## Quick Commands Reference

```bash
# Initialize epic
/init-epic

# Plan first story
/plan-story Epic 1 Story 1.1

# Generate phase docs
/generate-phase-doc Epic 1 Story 1.1 Phase 1

# Check epic status
cat docs/specs/epics/epic_1/EPIC_TRACKING.md

# View all epics
ls docs/specs/epics/
```

---

## Quality Standards

The generated epic structure follows these standards:

- **Complete**: All stories from PRD included
- **Organized**: Clear directory structure
- **Trackable**: Progress metrics and status tracking
- **Documented**: Dependencies and milestones clearly stated
- **Maintainable**: Easy to update as work progresses

---

## Integration with Other Tools

**Works With**:

- `/plan-story` - Plans individual stories within the epic
- `/generate-phase-doc` - Creates detailed implementation docs
- `phase-implementer` - Implements phases one commit at a time
- `epic-initializer` skill - Can be invoked automatically by Claude

**Updates**:

- EPIC_TRACKING.md should be updated as stories progress
- Use the progress table to track completion
- Document major decisions in Status Updates section

---

## See Also

- **Skill Documentation**: `.claude/skills/epic-initializer/SKILL.md`
- **Story Planner**: `.claude/commands/plan-story.md`
- **Phase Generator**: `.claude/commands/generate-phase-doc.md`
- **Phase Implementer**: `.claude/commands/implement-phase.md`
- **Workflow Overview**: `.claude/SPECS_WORKFLOW.md`

---

**Ready to initialize your epic? The skill will now ask you for epic information!**
