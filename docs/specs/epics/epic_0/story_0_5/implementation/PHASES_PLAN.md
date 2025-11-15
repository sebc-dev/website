²# Story 0.5 - Phases Implementation Plan

**Story**: Configurer wrangler.toml avec bindings
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-12
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_0/story_0_5/story_0.5.md`

**Story Objective**: Configurer complètement le fichier `wrangler.jsonc` avec tous les bindings requis pour le fonctionnement optimal de l'application Next.js sur Cloudflare Workers, en activant l'architecture cache OpenNext complète (R2 pour ISR, Durable Objects pour queue et tags, Service binding pour communication inter-composants).

**Acceptance Criteria**:

- CA1 : R2 Bucket pour cache incrémental configuré (`NEXT_INC_CACHE_R2_BUCKET`)
- CA2 : Durable Objects pour queue de révalidation configuré (`NEXT_CACHE_DO_QUEUE`)
- CA3 : Durable Objects pour cache de tags configuré (`NEXT_TAG_CACHE_DO_SHARDED`)
- CA4 : Service binding pour self-reference configuré (`WORKER_SELF_REFERENCE`)
- CA5 : Configuration OpenNext activée (cache R2 dans `open-next.config.ts`)
- CA6 : Validation locale réussie (build, wrangler dev, tests)
- CA7 : Documentation complète des bindings et de l'architecture cache

**User Value**: Pour les développeurs, cette configuration établit une infrastructure de cache performante et scalable. Pour les utilisateurs finaux, elle garantit des temps de réponse optimaux grâce au cache ISR distribué sur l'Edge network Cloudflare, avec une latence minimale partout dans le monde.

---

## 🎯 Phase Breakdown Strategy

### Why 3 Phases?

This story is decomposed into **3 atomic phases** based on:

✅ **Technical dependencies**:

- Phase 1 établit le stockage de base (R2) avant la logique de queue et tags
- Phase 2 ajoute les Durable Objects qui dépendent du bucket R2
- Phase 3 finalise avec le service binding et l'activation complète

✅ **Risk mitigation**:

- Phase 1 isole le risque de création de ressources Cloudflare
- Phase 2 isole la complexité des Durable Objects (migrations non-Drizzle)
- Phase 3 permet validation finale avant activation complète

✅ **Incremental value**:

- Phase 1 : Cache R2 opérationnel (même sans DO)
- Phase 2 : Support ISR complet avec queue et tags
- Phase 3 : Architecture OpenNext complète activée

✅ **Team capacity**:

- Phases dimensionnées pour 0.5-1 jour chacune
- Séparation claire entre création ressources (Phase 1) et configuration code (Phase 2-3)

✅ **Testing strategy**:

- Chaque phase testable indépendamment
- Validation progressive de l'architecture cache
- Tests E2E uniquement en Phase 3 (stack complète)

### Atomic Phase Principles

Each phase follows these principles:

- **Independent**: Can be implemented and tested separately
- **Deliverable**: Produces tangible, working functionality
- **Sized appropriately**: 0.5-1 day of work per phase
- **Low coupling**: Minimal dependencies on other phases
- **High cohesion**: All work in phase serves single objective

### Implementation Approach

```
[Phase 1] → [Phase 2] → [Phase 3]
    ↓           ↓           ↓
R2 Cache   Durable    Service +
Binding    Objects    OpenNext
```

---

## 📦 Phases Summary

### Phase 1: R2 Bucket Configuration

**Objective**: Configure R2 bucket binding for incremental cache storage

**Scope**:

- Create R2 bucket via `wrangler r2 bucket create`
- Add `NEXT_INC_CACHE_R2_BUCKET` binding to wrangler.jsonc
- Document R2 cache architecture and role
- Validate bucket creation and binding locally

**Dependencies**:

- Story 0.1 : Next.js initialized ✅
- Story 0.2 : OpenNext adapter configured ✅
- Story 0.6 : Compatibility flags set ✅

**Key Deliverables**:

- [ ] R2 bucket `next-cache` created in Cloudflare
- [ ] Binding `NEXT_INC_CACHE_R2_BUCKET` added to wrangler.jsonc
- [ ] Documentation: R2 cache architecture diagram
- [ ] Validation: `wrangler dev` starts without R2 binding errors

**Files Affected** (~3 files):

- `wrangler.jsonc` (modified - add r2_buckets section)
- `docs/architecture/CACHE_ARCHITECTURE.md` (new - R2 cache documentation)
- `docs/deployment/CLOUDFLARE_RESOURCES.md` (modified - R2 bucket creation guide)

**Estimated Complexity**: Low

**Estimated Duration**: 0.5-1 day (2-3 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- R2 bucket creation requires Cloudflare account permissions
- R2 naming conflicts possible if bucket exists
- R2 costs (storage + operations) need monitoring

**Mitigation Strategies**:

- Verify Cloudflare account permissions before starting
- Use unique bucket name with project prefix (`sebc-next-cache`)
- Document R2 pricing and monitoring strategy
- Test locally with `wrangler dev` before production

**Success Criteria**:

- [ ] R2 bucket visible in Cloudflare Dashboard
- [ ] `wrangler dev` starts without errors
- [ ] Logs show R2 binding available: `env.NEXT_INC_CACHE_R2_BUCKET`
- Tests: Manual validation (no automated tests for R2 binding alone)

**Technical Notes**:

- R2 bucket names are globally unique within your Cloudflare account
- R2 operations are eventually consistent (not strongly consistent)
- R2 costs: $0.015/GB/month storage + $0.36/million write ops + $4.50/million read ops
- R2 free tier: 10 GB storage + 1M write ops + 10M read ops per month

---

### Phase 2: Durable Objects Bindings

**Objective**: Configure Durable Objects bindings for ISR queue and tag cache

**Scope**:

- Add `NEXT_CACHE_DO_QUEUE` binding for ISR queue
- Add `NEXT_TAG_CACHE_DO_SHARDED` binding for tag cache
- Create Durable Objects migrations (non-Drizzle)
- Document DO architecture and DO vs D1 trade-offs
- Validate DO bindings locally

**Dependencies**:

- Phase 1: R2 bucket configured ✅

**Key Deliverables**:

- [ ] Binding `NEXT_CACHE_DO_QUEUE` added to wrangler.jsonc
- [ ] Binding `NEXT_TAG_CACHE_DO_SHARDED` added to wrangler.jsonc
- [ ] Durable Objects classes declared (`DOQueueHandler`, `DOTagCacheShard`)
- [ ] Documentation: DO architecture, sharding strategy, DO vs D1 comparison
- [ ] Validation: `wrangler dev` starts without DO binding errors

**Files Affected** (~4 files):

- `wrangler.jsonc` (modified - add durable_objects section)
- `migrations/durable-objects/` (new directory - DO migrations if needed)
- `docs/architecture/CACHE_ARCHITECTURE.md` (modified - add DO sections)
- `docs/architecture/DO_VS_D1_TAG_CACHE.md` (new - comparison guide)

**Estimated Complexity**: Medium

**Estimated Duration**: 1 day (3-4 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Durable Objects require separate migrations (not managed by Drizzle)
- DO classes provided by OpenNext (not custom code, but need validation)
- DO sharding configuration complex (multiple instances)
- DO costs higher than D1 for low traffic

**Mitigation Strategies**:

- Verify OpenNext provides DO class implementations (DOQueueHandler, DOTagCacheShard)
- Document DO migration process separately from Drizzle migrations
- Provide D1 alternative configuration for low-traffic scenarios
- Document DO pricing and when to use DO vs D1

**Success Criteria**:

- [ ] `wrangler dev` starts without DO binding errors
- [ ] Logs show DO bindings available: `env.NEXT_CACHE_DO_QUEUE`, `env.NEXT_TAG_CACHE_DO_SHARDED`
- [ ] OpenNext DO classes referenced correctly
- Tests: Manual validation (no automated tests for DO bindings alone)

**Technical Notes**:

- Durable Objects classes are provided by OpenNext adapter (`@opennextjs/cloudflare`)
- DO sharding spreads load across multiple DO instances (better performance)
- DO costs: $0.15/million requests + $12.50/million GB-seconds compute
- DO free tier: 1M requests + 400,000 GB-seconds per month
- For low traffic (<10k req/day), consider D1 alternative for tag cache

---

### Phase 3: Service Binding & OpenNext Activation

**Objective**: Complete configuration with service binding and activate OpenNext cache

**Scope**:

- Add `WORKER_SELF_REFERENCE` service binding
- Activate R2 cache in `open-next.config.ts`
- Import `r2IncrementalCache` from OpenNext
- Document complete architecture
- End-to-end validation and testing

**Dependencies**:

- Phase 1: R2 bucket configured ✅
- Phase 2: Durable Objects configured ✅

**Key Deliverables**:

- [ ] Binding `WORKER_SELF_REFERENCE` added to wrangler.jsonc
- [ ] `open-next.config.ts` updated with R2 cache enabled
- [ ] Complete architecture documentation with all bindings
- [ ] E2E tests validating ISR and cache revalidation
- [ ] Performance benchmarks (cache hit vs miss)

**Files Affected** (~5 files):

- `wrangler.jsonc` (modified - add services section)
- `open-next.config.ts` (modified - uncomment and configure R2 cache)
- `docs/architecture/CACHE_ARCHITECTURE.md` (modified - complete architecture)
- `docs/deployment/BINDINGS_REFERENCE.md` (new - all bindings reference)
- `tests/e2e/cache-revalidation.spec.ts` (new - E2E cache tests)

**Estimated Complexity**: Medium

**Estimated Duration**: 1 day (3-4 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- Service binding must reference correct worker name
- OpenNext cache configuration changes may affect build
- E2E tests require full stack operational

**Mitigation Strategies**:

- Verify worker name matches wrangler.jsonc `name` field
- Test build after OpenNext config changes
- Add E2E tests incrementally (basic first, complex later)
- Document rollback strategy if issues arise

**Success Criteria**:

- [ ] `wrangler dev` starts without service binding errors
- [ ] Build succeeds with R2 cache enabled
- [ ] E2E test: Page with `revalidate` is cached in R2
- [ ] E2E test: `revalidateTag()` invalidates cache correctly
- [ ] E2E test: `revalidatePath()` invalidates cache correctly
- Tests: E2E tests (Playwright) + manual validation

**Technical Notes**:

- `WORKER_SELF_REFERENCE` allows workers to communicate via service bindings
- Service name must match `wrangler.jsonc` `name` field (`website`)
- R2 cache activation in `open-next.config.ts` triggers OpenNext cache layer
- ISR pages (`revalidate` in `fetch` or `generateStaticParams`) automatically use R2 cache
- `revalidateTag()` and `revalidatePath()` require DO or D1 tag cache to work

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (R2 Bucket)
    ↓
Phase 2 (Durable Objects)
    ↓
Phase 3 (Service Binding + OpenNext Activation)
```

### Critical Path

**Must follow this order**:

1. Phase 1 → Phase 2 → Phase 3 (strict sequential dependency)

**Cannot be parallelized**:

- Phase 2 depends on R2 bucket existing (Phase 1)
- Phase 3 requires all bindings configured (Phase 1 + 2)

### Blocking Dependencies

**Phase 1 blocks**:

- Phase 2: DO bindings need R2 bucket reference
- Phase 3: Cannot activate OpenNext cache without R2

**Phase 2 blocks**:

- Phase 3: Service binding and E2E tests need full stack (R2 + DO)

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric                   | Estimate            | Notes                                        |
| ------------------------ | ------------------- | -------------------------------------------- |
| **Total Phases**         | 3                   | Atomic, sequential phases                    |
| **Total Duration**       | 2-3 days            | Sequential implementation (0.5-1d per phase) |
| **Parallel Duration**    | N/A                 | Cannot parallelize (strict dependencies)     |
| **Total Commits**        | ~8-11               | Phase 1: 2-3, Phase 2: 3-4, Phase 3: 3-4     |
| **Total Files**          | ~6 new, ~3 modified | Config + docs + tests                        |
| **Test Coverage Target** | N/A                 | Configuration story (E2E tests in Phase 3)   |

### Per-Phase Timeline

| Phase                         | Duration | Commits | Start After | Blocks     |
| ----------------------------- | -------- | ------- | ----------- | ---------- |
| 1. R2 Bucket Configuration    | 0.5-1d   | 2-3     | -           | Phase 2, 3 |
| 2. Durable Objects Bindings   | 1d       | 3-4     | Phase 1     | Phase 3    |
| 3. Service Binding & OpenNext | 1d       | 3-4     | Phase 2     | -          |

### Resource Requirements

**Team Composition**:

- 1 developer: Full-stack with Cloudflare Workers experience
- 1 reviewer: Familiar with OpenNext architecture and caching strategies

**External Dependencies**:

- Cloudflare Account with R2 and Durable Objects access
- Wrangler CLI v3+ installed
- Permissions to create R2 buckets and Durable Objects

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Phase 2: Durable Objects Bindings** 🟡

- **Risk**: DO migrations are non-Drizzle, manual process prone to errors
- **Impact**: Incorrect DO configuration breaks ISR queue and tag cache
- **Mitigation**: Rely on OpenNext-provided DO classes (no custom implementation), document migration process
- **Contingency**: Fallback to D1 tag cache if DO setup fails (documented alternative)

### Overall Story Risks

| Risk                                     | Likelihood | Impact | Mitigation                                                              |
| ---------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------- |
| R2 bucket creation fails (permissions)   | Low        | High   | Verify permissions before Phase 1, test in Cloudflare Dashboard         |
| DO configuration incorrect (class names) | Medium     | High   | Use exact class names from OpenNext docs, validate locally              |
| OpenNext cache activation breaks build   | Low        | Medium | Test build after config changes, rollback strategy documented           |
| E2E cache tests flaky (timing issues)    | Medium     | Low    | Add retry logic, increase timeouts, mock cache if needed                |
| Costs exceed budget (DO + R2 ops)        | Low        | Medium | Monitor Cloudflare usage, set budget alerts, document cost optimization |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase                         | Unit Tests | Integration Tests                | E2E Tests     |
| ----------------------------- | ---------- | -------------------------------- | ------------- |
| 1. R2 Bucket                  | -          | Manual validation (wrangler dev) | -             |
| 2. Durable Objects            | -          | Manual validation (wrangler dev) | -             |
| 3. Service Binding + OpenNext | -          | Build validation                 | 3-5 E2E tests |

### Test Milestones

- **After Phase 1**: R2 bucket exists, binding accessible in logs (`env.NEXT_INC_CACHE_R2_BUCKET`)
- **After Phase 2**: DO bindings accessible in logs, no startup errors
- **After Phase 3**: ISR caching works, `revalidateTag()` and `revalidatePath()` functional

### Quality Gates

Each phase must pass:

- [ ] `wrangler dev` starts without binding errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Logs confirm bindings available
- [ ] Manual QA: Verify bindings in Cloudflare Dashboard
- [ ] Code review approved
- **Phase 3 only**: E2E tests pass (ISR, revalidation)

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

For each phase, detailed documentation will be created in-line:

**Phase 1**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (R2 section)
- `docs/deployment/CLOUDFLARE_RESOURCES.md` (R2 bucket creation)

**Phase 2**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (DO sections)
- `docs/architecture/DO_VS_D1_TAG_CACHE.md` (comparison guide)

**Phase 3**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (complete architecture)
- `docs/deployment/BINDINGS_REFERENCE.md` (all bindings reference)
- `tests/e2e/cache-revalidation.spec.ts` (E2E tests with inline comments)

### Story-Level Documentation

**This document** (PHASES_PLAN.md):

- Strategic overview
- Phase coordination
- Cross-phase dependencies
- Overall timeline

**Phase-level documentation** (inline in code and docs):

- Specific binding configurations
- Architecture diagrams
- Comparison guides (DO vs D1)
- E2E test specifications

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Validate phase breakdown makes sense
   - Confirm Cloudflare account has necessary permissions (R2, DO)
   - Adjust estimates if needed

2. **Set up local environment**

   ```bash
   # Verify Wrangler CLI version
   wrangler --version  # Should be v3+

   # Verify Cloudflare account access
   wrangler whoami

   # Check current R2 buckets
   wrangler r2 bucket list
   ```

3. **Begin Phase 1 implementation**
   - Create R2 bucket: `wrangler r2 bucket create sebc-next-cache`
   - Update `wrangler.jsonc` with R2 binding
   - Document R2 architecture

### Implementation Workflow

For each phase:

1. **Implement**:
   - Follow commit-by-commit strategy (2-4 commits per phase)
   - Update configuration files
   - Create documentation

2. **Validate**:
   - Run `wrangler dev` (confirm no binding errors)
   - Run `pnpm build` (confirm build succeeds)
   - Check logs for binding availability

3. **Review**:
   - Self-review code changes
   - Verify documentation clarity
   - Ensure all success criteria met

4. **Move to next phase**:
   - Commit all changes
   - Update EPIC_TRACKING.md progress
   - Repeat process for next phase

### Progress Tracking

Update `docs/specs/epics/epic_0/EPIC_TRACKING.md` as phases complete:

- [ ] Phase 1: R2 Bucket Configuration - Status, Actual duration, Notes
- [ ] Phase 2: Durable Objects Bindings - Status, Actual duration, Notes
- [ ] Phase 3: Service Binding & OpenNext Activation - Status, Actual duration, Notes

Update Story 0.5 progress from **20%** → **40%** → **70%** → **100%**

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] All 3 phases implemented and validated
- [ ] R2 bucket created and binding configured
- [ ] Durable Objects bindings configured (queue + tag cache)
- [ ] Service binding configured for self-reference
- [ ] OpenNext cache activated in `open-next.config.ts`
- [ ] All bindings validated locally via `wrangler dev`
- [ ] Build succeeds with all bindings
- [ ] E2E tests pass (ISR caching, `revalidateTag()`, `revalidatePath()`)
- [ ] Complete architecture documentation published
- [ ] Bindings reference guide created

### Quality Metrics

| Metric                       | Target                         | Actual |
| ---------------------------- | ------------------------------ | ------ |
| Build Success                | 100%                           | -      |
| `wrangler dev` Success       | 100%                           | -      |
| E2E Tests Pass               | 100% (3-5 tests)               | -      |
| Documentation Complete       | 100% (all bindings documented) | -      |
| Cloudflare Resources Created | 100% (R2 bucket, DO bindings)  | -      |

---

## 📚 Reference Documents

### Story Specification

- Original spec: `docs/specs/epics/epic_0/story_0_5/story_0.5.md`

### Related Documentation

- Epic overview: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- PRD: `docs/specs/PRD.md` (lines 286-297 ENF3, 310-319 ENF5, 978-989 cache strategy)
- Brief: `docs/specs/Brief.md` (lines 99-100 cache architecture)

### External Resources

- OpenNext Cloudflare Caching: https://opennext.js.org/cloudflare/caching
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- Cloudflare Durable Objects Docs: https://developers.cloudflare.com/durable-objects/
- Cloudflare Service Bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/
- Next.js ISR Docs: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration

---

**Plan Created**: 2025-11-12
**Last Updated**: 2025-11-12
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING (ready for implementation)
