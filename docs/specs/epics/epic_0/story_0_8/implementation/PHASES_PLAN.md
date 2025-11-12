# Story 0.8 - Phases Implementation Plan

**Story**: Configurer Cloudflare Access
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-12
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_0/story_0_8/story_0.8.md`

**Story Objective**

Configurer Cloudflare Access (Zero Trust) pour sécuriser les routes administratives (`/admin/*`) du site sebc.dev. Cette story établit la couche d'authentification et d'autorisation pour le panneau d'administration en utilisant la solution Zero Trust native de Cloudflare, sans gestion de session côté application.

**Acceptance Criteria**:

- Route `/admin` protégée par Cloudflare Access (Zero Trust) configuré dans le dashboard Cloudflare
- Validation du token JWT `Cf-Access-Jwt-Assertion` dans middleware Next.js avec la bibliothèque `jose`
- Redirection automatique vers Cloudflare Access login si JWT invalide ou absent
- Tests E2E validant la protection complète des routes administratives
- Documentation opérationnelle complète (configuration, troubleshooting, runbook)

**User Value**

Pour les développeurs et mainteneurs, cette story fournit une sécurité robuste et Zero Trust pour le panneau d'administration, sans avoir à gérer la logique d'authentification complexe. Pour les utilisateurs finaux, cela garantit que le contenu du site ne peut être modifié que par des administrateurs autorisés, renforçant la confiance dans l'intégrité du contenu.

---

## 🎯 Phase Breakdown Strategy

### Why 4 Phases?

This story is decomposed into **4 atomic phases** based on:

✅ **Technical dependencies**: Configuration Cloudflare doit précéder l'implémentation du middleware
✅ **Risk mitigation**: Séparer configuration externe (dashboard) du code applicatif (middleware)
✅ **Incremental value**: Chaque phase livre une couche de sécurité testable
✅ **Team capacity**: Phases dimensionnées pour 1-2.5 jours de travail focalisé
✅ **Testing strategy**: Tests progressifs (config → code → intégration → docs)

### Atomic Phase Principles

Each phase follows these principles:

- **Independent**: Peut être implémentée et testée séparément
- **Deliverable**: Produit une fonctionnalité de sécurité tangible
- **Sized appropriately**: 1-2.5 jours de travail (3-6 commits)
- **Low coupling**: Dépendances minimales entre phases
- **High cohesion**: Tout le travail de la phase sert un objectif unique de sécurité

### Implementation Approach

```
[Phase 1] → [Phase 2] → [Phase 3] → [Phase 4]
    ↓           ↓           ↓           ↓
Dashboard   Middleware   E2E Tests  Ops Docs
Config      JWT Valid.   Security   Runbook
```

**Sequential Flow**:
1. Phase 1 établit la protection au niveau Edge
2. Phase 2 valide les requêtes au niveau application
3. Phase 3 vérifie l'intégration bout-en-bout
4. Phase 4 documente l'opération et le troubleshooting

---

## 📦 Phases Summary

### Phase 1: Configuration Cloudflare Zero Trust & Access Policies

**Objective**: Configurer Cloudflare Access dans le dashboard Zero Trust pour protéger les routes `/admin/*`

**Scope**:

- Créer une application Access dans le dashboard Cloudflare Zero Trust
- Configurer les politiques d'accès pour les routes `/admin/*` (wildcards)
- Définir les méthodes d'authentification (email OTP, Google, GitHub, etc.)
- Tester l'accès via le dashboard et vérifier les redirections
- Récupérer les valeurs critiques (Team Domain, Application AUD) pour le middleware

**Dependencies**:

- Requires: Cloudflare account avec accès au dashboard Zero Trust
- Requires: Site déployé sur Cloudflare Workers (Story 0.5, 0.6)
- Blocks: Phase 2 (besoin du Team Domain et Application AUD)

**Key Deliverables**:

- [ ] Application Cloudflare Access créée et configurée
- [ ] Politique d'accès pour `/admin/*` active
- [ ] Méthode d'authentification configurée et testée
- [ ] Team Domain et Application AUD documentés
- [ ] Tests manuels de redirection vers login Cloudflare réussis

**Files Affected** (~2 files):

- `docs/deployment/cloudflare-access-setup.md` (new) - Guide de configuration
- `.env.example` (modified) - Ajout des variables pour le middleware (Phase 2)

**Estimated Complexity**: Medium

**Estimated Duration**: 1-1.5 days (4 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Configuration dashboard peut varier selon version Cloudflare
- Erreurs de configuration pourraient bloquer l'accès légitime
- Dépendance sur infrastructure externe (Cloudflare dashboard)

**Mitigation Strategies**:

- Suivre la documentation officielle Cloudflare (liens fournis)
- Tester avec plusieurs méthodes d'authentification
- Prendre des captures d'écran de chaque étape de configuration
- Documenter les valeurs critiques immédiatement

**Success Criteria**:

- [ ] Accès à `https://<domain>/admin` redirige vers Cloudflare login
- [ ] Après authentification réussie, utilisateur peut accéder à `/admin`
- [ ] Header `Cf-Access-Jwt-Assertion` présent dans les requêtes authentifiées
- [ ] Documentation de configuration complète et vérifiée

**Technical Notes**:

- Team Domain format: `<team-name>.cloudflareaccess.com`
- Application AUD: UUID unique généré par Cloudflare
- Session duration recommandée: 24 heures (configurable)
- Wildcard `/admin/*` protège toutes les sous-routes automatiquement

---

### Phase 2: Middleware Next.js + Validation JWT

**Objective**: Implémenter le middleware Next.js pour valider le JWT Cloudflare Access et protéger les routes administratives au niveau application

**Scope**:

- Installer la dépendance `jose` pour validation JWT
- Créer `src/middleware.ts` avec logique de validation
- Implémenter la vérification du JWT `Cf-Access-Jwt-Assertion`
- Configurer le matcher pour protéger `/admin/*`
- Gérer les cas d'erreur (JWT invalide, expiré, absent)
- Ajouter logging structuré pour audit et debugging
- Tests unitaires de la logique de validation JWT

**Dependencies**:

- Requires: Phase 1 (Team Domain, Application AUD)
- Requires: Story 0.1 (Next.js initialized)
- Blocks: Phase 3 (tests E2E nécessitent le middleware fonctionnel)

**Key Deliverables**:

- [ ] Dépendance `jose` installée (`package.json`)
- [ ] Middleware `src/middleware.ts` créé et configuré
- [ ] Validation JWT fonctionnelle avec JWKS Cloudflare
- [ ] Gestion d'erreurs robuste (401, logging)
- [ ] Matcher configuré pour `/admin/*`
- [ ] Tests unitaires passent (>85% coverage)

**Files Affected** (~4 files):

- `package.json` (modified) - Ajout de `jose`
- `src/middleware.ts` (new) - Middleware de validation JWT
- `src/lib/auth/jwt-validation.ts` (new) - Logique de validation réutilisable
- `src/lib/auth/jwt-validation.test.ts` (new) - Tests unitaires

**Estimated Complexity**: High

**Estimated Duration**: 2-2.5 days (6 commits)

**Risk Level**: 🔴 High

**Risk Factors**:

- Security-critical code (bugs could allow unauthorized access)
- JWT validation complexe (public key, JWKS, claims)
- Edge runtime constraints (Workers compatibilité)
- Middleware Next.js peut avoir des subtilités

**Mitigation Strategies**:

- Utiliser `jose` (bibliothèque éprouvée et sécurisée)
- Tests unitaires exhaustifs (tokens valides, invalides, expirés)
- Code review approfondi (focus sécurité)
- Tester en local avec tokens mockés avant déploiement
- Suivre les exemples officiels Cloudflare

**Success Criteria**:

- [ ] JWT valide → requête autorisée (200)
- [ ] JWT invalide → 401 Unauthorized
- [ ] JWT expiré → 401 Unauthorized
- [ ] JWT absent → 401 Unauthorized (ou redirect)
- [ ] Logs structurés pour chaque tentative d'accès
- [ ] Tests unitaires passent avec >85% coverage
- [ ] Middleware compatible avec Cloudflare Workers runtime

**Technical Notes**:

- JWKS URL: `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/certs`
- JWT claims requis: `iss` (issuer), `aud` (audience), `exp` (expiration)
- Edge runtime: `jose` est compatible (ESM, Web Crypto API)
- Logging: Utiliser `console.log({ level, context, data })` pour observabilité

---

### Phase 3: Tests E2E de Sécurité

**Objective**: Valider l'intégration complète Cloudflare Access + Middleware avec tests E2E Playwright

**Scope**:

- Tests Playwright pour accès aux routes `/admin/*` sans authentification
- Tests de validation JWT (mock tokens valides, invalides, expirés)
- Tests de redirection vers Cloudflare Access login
- Tests de cas limites (header manquant, token malformé)
- Tests de routes non protégées (pas d'impact sur `/` et autres routes)
- Documentation des scénarios de test et résultats attendus

**Dependencies**:

- Requires: Phase 2 (middleware fonctionnel)
- Requires: Story 0.10 (Playwright configuré)
- Requires: Phase 1 (Cloudflare Access configuré pour tests)

**Key Deliverables**:

- [ ] Tests E2E pour routes protégées (`/admin/*`)
- [ ] Tests de validation JWT avec différents scénarios
- [ ] Tests de redirection (401 ou redirect à Cloudflare)
- [ ] Tests de routes non protégées (baseline)
- [ ] Documentation des scénarios de test
- [ ] Tous les tests passent en local et CI

**Files Affected** (~3 files):

- `tests/e2e/admin-access.spec.ts` (new) - Tests E2E routes admin
- `tests/e2e/jwt-validation.spec.ts` (new) - Tests validation JWT
- `tests/fixtures/mock-jwt.ts` (new) - Utilitaires pour générer mock JWT

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5-2 days (4 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Mock JWT peut ne pas refléter exactement les vrais tokens Cloudflare
- Tests E2E dépendent d'infrastructure externe (Cloudflare)
- Peut être difficile de tester tous les cas limites

**Mitigation Strategies**:

- Utiliser des fixtures JWT réalistes (basés sur vrais tokens)
- Tester en local avec `wrangler dev` (bindings disponibles)
- Documenter les limitations des mocks
- Inclure tests manuels avec vrais tokens si nécessaire

**Success Criteria**:

- [ ] Test: Accès `/admin` sans auth → 401 ou redirect
- [ ] Test: Accès `/admin` avec JWT valide → 200
- [ ] Test: Accès `/admin` avec JWT expiré → 401
- [ ] Test: Accès `/admin` avec JWT invalide → 401
- [ ] Test: Accès `/` (non protégé) → 200 sans JWT
- [ ] Tests E2E passent en local et CI
- [ ] Coverage E2E >80% des scénarios critiques

**Technical Notes**:

- Mock JWT: Utiliser `jose` pour générer des tokens de test
- Playwright: Configurer headers `Cf-Access-Jwt-Assertion` manuellement
- CI: Peut nécessiter secrets Cloudflare pour tests réels (optionnel)
- Baseline: Vérifier que routes publiques fonctionnent toujours

---

### Phase 4: Documentation Opérationnelle & Guides

**Objective**: Créer la documentation complète pour configurer, déployer et troubleshooter Cloudflare Access

**Scope**:

- Guide de configuration Cloudflare Access (step-by-step)
- Guide de déploiement et mise à jour du middleware
- Documentation des variables d'environnement requises
- Runbook opérationnel pour troubleshooting
- Guide de debugging (logs, headers, JWT inspection)
- Procédures de récupération en cas de problème d'accès

**Dependencies**:

- Requires: Phases 1, 2, 3 (implémentation et tests complets)

**Key Deliverables**:

- [ ] Guide de configuration Cloudflare Access
- [ ] Guide de déploiement du middleware
- [ ] Runbook de troubleshooting
- [ ] Documentation des variables d'environnement
- [ ] Procédures de récupération (emergency access)
- [ ] Exemples de logs et headers pour debugging

**Files Affected** (~4 files):

- `docs/deployment/cloudflare-access-setup.md` (modified) - Guide détaillé
- `docs/deployment/middleware-deployment.md` (new) - Déploiement middleware
- `docs/deployment/security-troubleshooting.md` (new) - Troubleshooting
- `docs/deployment/emergency-access.md` (new) - Procédures de récupération

**Estimated Complexity**: Low

**Estimated Duration**: 1 day (3 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- Documentation peut devenir obsolète si Cloudflare change l'interface
- Manque de clarté pourrait causer des problèmes opérationnels

**Mitigation Strategies**:

- Inclure des captures d'écran datées
- Documenter la version de l'interface Cloudflare utilisée
- Fournir des commandes CLI alternatives si disponibles
- Tester la documentation avec une nouvelle personne

**Success Criteria**:

- [ ] Un développeur peut configurer Cloudflare Access en suivant le guide
- [ ] Le runbook couvre les 5 problèmes les plus courants
- [ ] Documentation des variables d'environnement complète
- [ ] Procédures de récupération testées et validées
- [ ] Exemples de logs clairs et annotés

**Technical Notes**:

- Inclure des commandes `wrangler` pour inspection locale
- Documenter les endpoints Cloudflare pour debugging
- Fournir des exemples de `curl` avec headers JWT
- Référencer la documentation officielle Cloudflare (liens)

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Cloudflare Config)
    ↓
Phase 2 (Middleware JWT)
    ↓
Phase 3 (E2E Tests)
    ↓
Phase 4 (Documentation)
```

### Critical Path

**Must follow this order**:

1. Phase 1 (Config) → Phase 2 (Middleware) → Phase 3 (Tests) → Phase 4 (Docs)

**Cannot be parallelized**:

- Phase 2 needs Team Domain and AUD from Phase 1
- Phase 3 needs functional middleware from Phase 2
- Phase 4 documents the complete implementation

### Blocking Dependencies

**Phase 1 blocks**:

- Phase 2: Needs Team Domain and Application AUD for JWT validation
- Phase 3: Needs Cloudflare Access active for E2E tests
- Phase 4: Needs configuration experience for documentation

**Phase 2 blocks**:

- Phase 3: Needs middleware functional for E2E tests
- Phase 4: Needs middleware code for deployment guide

**Phase 3 blocks**:

- Phase 4: Needs test results for troubleshooting scenarios

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric                   | Estimate      | Notes                                  |
| ------------------------ | ------------- | -------------------------------------- |
| **Total Phases**         | 4             | Sequential, security-focused phases    |
| **Total Duration**       | 6-7.5 days    | Based on sequential implementation     |
| **Parallel Duration**    | N/A           | Phases must be sequential              |
| **Total Commits**        | ~17           | Across all phases                      |
| **Total Files**          | ~8 new        | Middleware, tests, docs                |
| **Test Coverage Target** | >85%          | Critical security code                 |

### Per-Phase Timeline

| Phase | Duration | Commits | Start After | Blocks     |
| ----- | -------- | ------- | ----------- | ---------- |
| 1. Cloudflare Config | 1-1.5d | 4 | - | Phase 2, 3, 4 |
| 2. Middleware JWT | 2-2.5d | 6 | Phase 1 | Phase 3, 4 |
| 3. E2E Tests | 1.5-2d | 4 | Phase 2 | Phase 4 |
| 4. Documentation | 1d | 3 | Phase 3 | - |

### Resource Requirements

**Team Composition**:

- 1 developer: Security experience, Next.js, JWT/OAuth knowledge
- 1 reviewer: Security-focused code review, Cloudflare expertise
- DevOps: Cloudflare dashboard access (ou même développeur)

**External Dependencies**:

- Cloudflare Account with Zero Trust access
- Deployed Cloudflare Worker (from Story 0.5, 0.6)
- Node.js 18+ with npm/pnpm

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Phase 2: Middleware JWT** 🔴

- **Risk**: Security vulnerability si JWT validation incorrecte
- **Impact**: Accès non autorisé au panneau admin → compromission du site
- **Mitigation**: Tests unitaires exhaustifs, code review approfondi, utiliser `jose` (éprouvé)
- **Contingency**: Rollback immédiat si bug détecté, monitoring des logs d'accès

**Phase 1: Cloudflare Config** 🟡

- **Risk**: Configuration incorrecte pourrait bloquer tout accès admin
- **Impact**: Impossibilité de gérer le contenu du site
- **Mitigation**: Tester avec plusieurs méthodes d'authentification, documenter chaque étape
- **Contingency**: Procédure de récupération via Cloudflare CLI ou dashboard

### Overall Story Risks

| Risk                          | Likelihood | Impact | Mitigation                              |
| ----------------------------- | ---------- | ------ | --------------------------------------- |
| JWT validation bug            | Low        | High   | Tests exhaustifs, code review, `jose`   |
| Cloudflare config error       | Medium     | Medium | Documentation détaillée, tests manuels  |
| Middleware perf impact        | Low        | Low    | JWT validation est très rapide (<10ms)  |
| Incompatibilité Workers       | Low        | High   | `jose` compatible Edge, tests en local  |
| Loss of admin access          | Low        | High   | Procédure de récupération documentée    |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase       | Unit Tests | Integration Tests | E2E Tests  |
| ----------- | ---------- | ----------------- | ---------- |
| 1. Config   | -          | -                 | Manual (dashboard) |
| 2. Middleware | 8+ tests | 5+ tests          | -          |
| 3. E2E Tests | -         | -                 | 10+ tests  |
| 4. Docs     | -          | -                 | -          |

### Test Milestones

- **After Phase 1**: Accès manuel à `/admin` redirige vers Cloudflare login
- **After Phase 2**: Tests unitaires passent (JWT valid, invalid, expired, missing)
- **After Phase 3**: Tests E2E passent (protection complète validée)
- **After Phase 4**: Documentation validée par test avec nouvelle personne

### Quality Gates

Each phase must pass:

- [ ] Tous les tests unitaires (>85% coverage pour Phase 2)
- [ ] Tous les tests E2E (Phase 3)
- [ ] Linter avec zéro erreur
- [ ] Type checking TypeScript
- [ ] Code review approuvé (focus sécurité pour Phase 2)
- [ ] Documentation complète et testée

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

For each phase, use the `phase-doc-generator` skill to create:

1. **INDEX.md** - Navigation hub et overview de la phase
2. **IMPLEMENTATION_PLAN.md** - Plan d'implémentation avec commits atomiques
3. **COMMIT_CHECKLIST.md** - Checklist détaillée par commit
4. **ENVIRONMENT_SETUP.md** - Configuration environnement et dépendances
5. **guides/REVIEW.md** - Guide de code review (focus sécurité)
6. **guides/TESTING.md** - Stratégie de test de la phase
7. **validation/VALIDATION_CHECKLIST.md** - Checklist de validation finale

**Estimated documentation**: ~3400 lines per phase × 4 phases = **~13,600 lines**

### Story-Level Documentation

**This document** (PHASES_PLAN.md):

- Strategic overview de la story
- Coordination entre phases
- Dépendances inter-phases
- Timeline globale

**Phase-level documentation** (generated separately):

- Détails tactiques d'implémentation
- Checklists commit par commit
- Validations techniques spécifiques

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Valider la décomposition en 4 phases
   - Ajuster les estimations si nécessaire
   - Identifier les risques manquants

2. **Set up Cloudflare account**
   ```bash
   # Ensure Cloudflare account has Zero Trust access
   # Navigate to https://one.dash.cloudflare.com/
   # Verify access to Access application creation
   ```

3. **Generate detailed documentation for Phase 1**
   - Use command: `/generate-phase-doc Epic 0 Story 0.8 Phase 1`
   - Or request: "Generate implementation docs for Story 0.8 Phase 1"
   - Provide this PHASES_PLAN.md as context

### Implementation Workflow

For each phase:

1. **Plan** (if not done):
   - Read PHASES_PLAN.md for phase overview
   - Generate detailed docs with `phase-doc-generator`

2. **Implement**:
   - Follow IMPLEMENTATION_PLAN.md
   - Use COMMIT_CHECKLIST.md for each commit
   - Validate after each commit

3. **Review**:
   - Use guides/REVIEW.md (focus sécurité)
   - Ensure all success criteria met

4. **Validate**:
   - Complete validation/VALIDATION_CHECKLIST.md
   - Update this plan with actual metrics

5. **Move to next phase**:
   - Repeat process for next phase

### Progress Tracking

Update this document as phases complete:

- [ ] Phase 1: Cloudflare Config - Status: ⏳, Actual duration: TBD
- [ ] Phase 2: Middleware JWT - Status: ⏳, Actual duration: TBD
- [ ] Phase 3: E2E Tests - Status: ⏳, Actual duration: TBD
- [ ] Phase 4: Documentation - Status: ⏳, Actual duration: TBD

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] All 4 phases implemented and validated
- [ ] Cloudflare Access protects `/admin/*` routes
- [ ] Middleware validates JWT correctement
- [ ] All acceptance criteria from original spec met
- [ ] Test coverage >85% achieved for security code
- [ ] No critical bugs or security vulnerabilities
- [ ] Documentation complete and reviewed
- [ ] Manual testing with real Cloudflare Access successful
- [ ] Deployed to production (or staging if applicable)

### Quality Metrics

| Metric               | Target | Actual |
| -------------------- | ------ | ------ |
| Test Coverage (Middleware) | >85% | - |
| E2E Test Coverage    | >80%   | -      |
| Type Safety          | 100%   | -      |
| Code Review Approval | 100%   | -      |
| JWT Validation Time  | <10ms  | -      |
| Security Audit       | Pass   | -      |

---

## 📚 Reference Documents

### Story Specification

- Original spec: `docs/specs/epics/epic_0/story_0_8/story_0.8.md`

### Related Documentation

- Epic overview: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- PRD: `docs/specs/PRD.md` (Epic 0, Story 0.8, ENF23)
- Brief: `docs/specs/Brief.md` (Principes architecturaux)

### External References

- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [JWT Validation Guide](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
- [jose Library](https://github.com/panva/jose)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### Generated Phase Documentation

- Phase 1: `docs/specs/epics/epic_0/story_0_8/implementation/phase_1/INDEX.md` (to be generated)
- Phase 2: `docs/specs/epics/epic_0/story_0_8/implementation/phase_2/INDEX.md` (to be generated)
- Phase 3: `docs/specs/epics/epic_0/story_0_8/implementation/phase_3/INDEX.md` (to be generated)
- Phase 4: `docs/specs/epics/epic_0/story_0_8/implementation/phase_4/INDEX.md` (to be generated)

[Links will be added as phases are documented]

---

**Plan Created**: 2025-11-12
**Last Updated**: 2025-11-12
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING - Ready for Phase 1 implementation
