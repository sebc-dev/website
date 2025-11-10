---
description: Implement a single commit from phase documentation using the phase-implementer agent
argument-hint:
  [optional: story reference and phase number, e.g., 'Epic 1 Story 1.1 Phase 1']
allowed-tools: Task, TodoWrite
---

# Implement Phase

Launch the **phase-implementer** agent to implement a single commit from phase documentation, one at a time with validation gates.

## What This Does

**Implements ONE atomic commit at a time** following phase documentation:

1. Reads the COMMIT_CHECKLIST.md for the current commit
2. Implements all files and features specified for that commit
3. Validates against project standards
4. Waits for user approval before committing
5. Stops and asks for next commit (never proceeds automatically)

This ensures quality control and allows for course correction at each step.

## How Invocation Works

⚡ **Model-invoked (Automatic)**: Claude can discover and use this agent automatically when you mention:

- "implement the phase"
- "code the documentation"
- "start implementation"
- "build commit 1"

🎯 **User-invoked (Manual)**: Or use this slash command to explicitly invoke the agent.

## Complete Workflow

The recommended workflow from documentation to deployment:

```
Step 1: Plan Story Phases
   /plan-story
   → Creates: PHASES_PLAN.md
   ↓
Step 2: Generate Phase Documentation
   /generate-phase-doc [for each phase]
   → Creates: phase_X/ (7 detailed docs)
   ↓
Step 3: Implement Each Phase [THIS COMMAND]
   /implement-phase [story reference] [phase number]
   → Implement commit 1/N
   → Wait for user validation
   → Repeat for each commit
   ↓
Step 4: Complete and Validate
   → All commits merged and tested
   → Update EPIC_TRACKING.md
```

This command is **Step 3** - the actual implementation.

## Instructions for Manual Invocation

When you use this command, the agent will guide you through implementing one commit at a time.

### Before You Start

Ensure you have these documents ready:

1. **Phase Documentation** (created by /generate-phase-doc):
   - `docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/INDEX.md`
   - `docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/COMMIT_CHECKLIST.md`
   - `docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/IMPLEMENTATION_PLAN.md`

2. **Story Context**:
   - `docs/specs/epics/epic_X/story_X_Y/story_X.Y.md`
   - `docs/specs/epics/epic_X/EPIC_TRACKING.md`

3. **Project Specifications**:
   - `docs/specs/Frontend_Specification.md`
   - `docs/specs/UX_UI_Spec.md`
   - `docs/specs/Brief.md`

### The Implementation Process

The agent will:

#### 1. **Gather Information**

Ask you for:

- **Story Reference** (e.g., "Epic 1 Story 1.1")
- **Phase Number** (e.g., "1", "2", "3")
- **Current Commit** (which commit are you implementing? 1/6? 2/6?)

#### 2. **Read Documentation**

The agent will:

- Read COMMIT_CHECKLIST.md for this specific commit
- Identify all files and features for THIS commit only
- Review project specifications (Frontend_Specification.md, UX_UI_Spec.md)
- Note any dependencies or prerequisites

#### 3. **Implement THIS COMMIT ONLY**

The agent will:

- Create all files specified in the checklist
- Follow the exact implementation sequence documented
- Write code following project standards
- Include comprehensive error handling
- Add JSDoc/TSDoc comments
- Create tests if this is the test commit

#### 4. **Validate**

The agent will:

- Run all validation commands from COMMIT_CHECKLIST.md
- Verify file structure matches documentation
- Check TypeScript, linting, tests pass
- Confirm all documented features are implemented

#### 5. **Request User Approval**

The agent will:

- Present a summary of all changes
- Show validation results
- Display the exact commit message
- Ask: "Ready to commit? Please review the changes above."
- **NOT commit automatically** - wait for explicit approval

#### 6. **Commit and Stop**

After user says "commit":

- Execute git add, git commit, git push
- Confirm the commit was successful
- **STOP** - wait for user to request next commit

## Single-Commit Workflow (Critical)

⚠️ **IMPORTANT**: The agent implements ONE commit at a time, then STOPS.

- ✅ Does: Implement commit 1, validate, ask for approval
- ❌ Does NOT: Automatically implement all commits
- ❌ Does NOT: Move to next commit without explicit user request
- ❌ Does NOT: Commit without user approval

This ensures:

- Quality gates at each step
- Ability to review and adjust course
- Clear progress tracking
- User control over implementation pace

## Project Context (sebc.dev)

This project uses **Next.js 15 with Cloudflare Workers**:

**Key Technical Stack**:

- **Framework**: Next.js 15 (App Router, RSC enabled)
- **Runtime**: Cloudflare Workers via @opennextjs/cloudflare
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Package Manager**: pnpm

**Key Commands**:

- `pnpm dev` - Start dev server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm build` - Build for production
- `pnpm deploy` - Deploy to Cloudflare

**Project Files**:

- `/app` - Next.js App Router pages
- `/components` - React components
- `/lib` - Utility functions
- `/tests` - E2E tests
- `CLAUDE.md` - Project standards and conventions

## Quality Standards

The agent ensures:

- ✅ Specification adherence (follows documentation exactly)
- ✅ Code quality (ESLint, TypeScript, project standards)
- ✅ Testing (unit tests for logic, E2E tests for features)
- ✅ Documentation (comments, JSDoc, clarity)
- ✅ Type safety (full TypeScript coverage)
- ✅ Error handling (comprehensive, user-friendly)
- ✅ Accessibility (WCAG 2.1 AA minimum)

## Example Session

```
User: /implement-phase Epic 0 Story 0.1 Phase 1

Agent: "I'm going to implement Phase 1 of Story 0.1 from Epic 0. Let me start with Commit 1/3."

Agent: "Implementing Commit 1/3: Database Schema Setup"
- Creating: /app/lib/db/schema.ts
- Creating: /app/lib/db/migrations.ts
- Creating: /tests/integration/db-setup.test.ts

Agent: [Implements all files...]
Agent: "Validation Results:
  ✅ TypeScript: No errors
  ✅ ESLint: Passed
  ✅ Tests: 8/8 passing
  ✅ Build: Succeeded"

Agent: "Ready to commit? Please review the changes above.
Type 'commit' to proceed, or request changes."

User: "commit"

Agent: [Creates git commit]
Agent: "✅ Commit 1/3 complete! Ready for next?"

User: "implement commit 2"

Agent: "Starting Commit 2/3: Migration and Seeding..."
[Process repeats]
```

## Typical Implementation Flow

### For a 5-Commit Phase:

```
Commit 1: Types & Database Schema
  ↓ (user validation)
Commit 2: Core Business Logic
  ↓ (user validation)
Commit 3: API Endpoints
  ↓ (user validation)
Commit 4: UI Components
  ↓ (user validation)
Commit 5: Tests & Documentation
  ↓ (user validation)
Phase Complete ✅
```

Each commit is independent, reviewable, and has a clear purpose.

## Common Questions

**Q: Can I request changes before committing?**
A: Yes! The agent stops and asks for approval. You can request changes to the implementation.

**Q: What if I want to skip to commit 3?**
A: You can specify: `/implement-phase Epic 1 Story 1.1 Phase 2 Commit 3`

**Q: How do I know what to implement?**
A: The COMMIT_CHECKLIST.md for each commit has a detailed checklist of what needs to be done.

**Q: What if validation fails?**
A: The agent will show validation errors. You can request fixes before committing.

**Q: Can I implement multiple phases at once?**
A: No - use this command once per phase. Once a phase is complete, use it again for the next phase.

## See Also

- **Plan Story**: `/plan-story` - Create phase breakdown
- **Generate Phase Docs**: `/generate-phase-doc` - Create implementation documentation
- **Phase Implementer Agent**: `.claude/agents/phase-implementer.md` - Full agent documentation
- **Project Standards**: `CLAUDE.md` - Coding standards and commands
- **Frontend Spec**: `docs/specs/Frontend_Specification.md` - Technical architecture
- **UX/UI Spec**: `docs/specs/UX_UI_Spec.md` - Design requirements

---

**Ready to implement? Provide the story and phase information, and the agent will guide you through implementing one commit at a time!**
