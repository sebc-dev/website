# Story 0.8 - Configurer Cloudflare Access

**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-12
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Description

Configurer Cloudflare Access (Zero Trust) pour protéger les routes administratives (`/admin/*`) du site sebc.dev. Cette story établit la couche de sécurité d'authentification pour l'accès au panneau d'administration en utilisant la solution Zero Trust native de Cloudflare.

### Context

Le panneau d'administration permet de créer, éditer et publier des articles. Il est critique de protéger ces routes contre tout accès non autorisé. Cloudflare Access fournit une solution de sécurité Zero Trust intégrée à l'infrastructure Edge, sans nécessiter de gestion de session côté application.

### Story Reference

- **PRD Section**: Epic 0, Story 0.8
- **PRD Line**: 635
- **Related ENF**: ENF23 - Sécurité infrastructure (CA1, CA2)

---

## 🎯 Objectives

1. **Configurer Cloudflare Access** pour protéger les routes `/admin/*`
2. **Implémenter la validation JWT** dans le middleware Next.js
3. **Garantir la sécurité** de l'accès administrateur avec authentification Zero Trust
4. **Documenter le processus** de configuration et d'opération

---

## ✅ Acceptance Criteria

### From PRD (ENF23 - Sécurité infrastructure)

**CA1: Cloudflare Access**
- ✅ Route `/admin` protégée par Cloudflare Access (Zero Trust)
- ✅ Politique d'accès configurée dans le dashboard Cloudflare
- ✅ Authentification obligatoire pour accéder aux routes administratives

**CA2: Validation JWT**
- ✅ Validation du token `Cf-Access-Jwt-Assertion` dans middleware Next.js (`middleware.ts`)
- ✅ Utilisation de la bibliothèque `jose` pour validation JWT
- ✅ Redirection vers page de connexion Cloudflare si token invalide ou absent

### Additional Acceptance Criteria

**Security**
- ✅ Toutes les routes sous `/admin/*` sont protégées (wildcards)
- ✅ Tentatives d'accès non autorisées sont bloquées et loggées
- ✅ JWT expiré ou invalide déclenche une redirection vers l'authentification
- ✅ Headers de sécurité appropriés configurés

**Testing**
- ✅ Tests E2E validant la protection des routes `/admin/*`
- ✅ Tests de validation JWT (token valide, invalide, expiré, absent)
- ✅ Tests de redirection vers Cloudflare Access

**Documentation**
- ✅ Guide de configuration Cloudflare Access
- ✅ Documentation du middleware de validation JWT
- ✅ Runbook opérationnel pour troubleshooting

---

## 🔗 Dependencies

### Depends On (Must Complete First)

**Story 0.5** (wrangler.toml avec bindings)
- Need: `wrangler.jsonc` configured with basic structure
- Reason: Cloudflare Access configuration requires a deployed Worker

**Story 0.1** (Next.js initialized)
- Need: Next.js project structure in place
- Reason: Middleware file must be created in project root

### Blocks (Cannot Start Until This Completes)

**Story 2.3** (Interface admin - routes)
- Reason: Admin routes need authentication to be in place first

**Story 2.4** (Panneau admin - création/édition)
- Reason: Admin panel requires secure access

### Related Stories

**Story 0.9** (Cloudflare WAF)
- Both contribute to overall security posture
- Can be developed in parallel

---

## 📦 Technical Scope

### Files to Create

```
src/
└── middleware.ts                    # Next.js middleware for JWT validation

docs/
└── deployment/
    ├── cloudflare-access-setup.md   # Configuration guide
    └── security-troubleshooting.md  # Operational runbook
```

### Files to Modify

```
package.json                         # Add jose dependency
wrangler.jsonc                       # (No changes needed, used for deployment)
```

### Configuration Required

**Cloudflare Dashboard (Zero Trust)**
- Create Access Application for sebc.dev
- Configure Access Policy for `/admin/*` routes
- Set up authentication provider (email, Google, GitHub, etc.)
- Configure session duration and policies

**Environment Variables**
- None required (JWT validation uses public Cloudflare keys)

---

## 🛠 Technical Details

### Cloudflare Access Architecture

```
User Request
    ↓
Cloudflare Edge
    ↓
Access Policy Check (/admin/* ?)
    ↓ (Yes)
    ├─→ Authenticated? → Allow + Inject Cf-Access-Jwt-Assertion header
    └─→ Not authenticated? → Redirect to Cloudflare login
    ↓
Next.js Middleware (middleware.ts)
    ↓
Validate Cf-Access-Jwt-Assertion JWT
    ↓
    ├─→ Valid JWT → Allow request to proceed
    └─→ Invalid/Missing JWT → 401 Unauthorized
    ↓
Protected Admin Route
```

### JWT Validation Flow

```typescript
// High-level validation logic
import { jwtVerify, createRemoteJWKSet } from 'jose';

// 1. Extract JWT from header
const jwt = request.headers.get('Cf-Access-Jwt-Assertion');

// 2. Verify JWT signature using Cloudflare's public keys
const JWKS = createRemoteJWKSet(
  new URL('https://<team-name>.cloudflareaccess.com/cdn-cgi/access/certs')
);

const { payload } = await jwtVerify(jwt, JWKS, {
  issuer: 'https://<team-name>.cloudflareaccess.com',
  audience: '<application-aud>',
});

// 3. Check expiration and claims
if (payload.exp < Date.now() / 1000) {
  throw new Error('JWT expired');
}

// 4. Allow request to proceed
return NextResponse.next();
```

### Middleware Configuration

```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/admin/:path*',           // Protect all admin routes
  ],
};
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

- JWT validation logic (valid, invalid, expired tokens)
- Header extraction logic
- Error handling

### Integration Tests (Vitest)

- Middleware execution with mock requests
- Redirection behavior

### E2E Tests (Playwright)

- Access to `/admin` without authentication → redirect to Cloudflare login
- Access to `/admin` with valid JWT → allowed
- Access to `/admin` with expired JWT → redirect
- Access to non-admin routes → no authentication required

---

## 📊 Estimated Complexity

**Overall Complexity**: 🟡 Medium

**Reasoning**:
- ✅ Cloudflare Access is mature and well-documented
- ✅ JWT validation with `jose` is straightforward
- ⚠️ Requires external dashboard configuration (outside codebase)
- ⚠️ Security-critical (must be tested thoroughly)
- ⚠️ Requires understanding of JWT, public key cryptography

**Risk Level**: 🟡 Medium
- Configuration errors could block legitimate access
- JWT validation bugs could create security vulnerabilities
- Dependency on Cloudflare infrastructure

---

## 🚀 User Value

### For Developers
- ✅ Secure admin panel without managing auth logic
- ✅ Zero Trust security model (no session cookies)
- ✅ Leverage Cloudflare's authentication infrastructure
- ✅ Single Sign-On (SSO) capabilities if needed

### For End Users
- ✅ Confidence that admin panel is secure
- ✅ No risk of unauthorized content manipulation
- ✅ Transparent security (no user-facing impact)

### For Operations
- ✅ Centralized access control in Cloudflare dashboard
- ✅ Audit logs of admin access
- ✅ Easy to revoke access or change policies
- ✅ Scalable authentication (no backend changes needed)

---

## 📝 Notes & Considerations

### Why Cloudflare Access?

1. **Zero Trust Model**: No implicit trust, every request validated
2. **Edge-Native**: Authentication happens at Cloudflare Edge (low latency)
3. **No Backend Session**: No need for session storage (KV, cookies)
4. **Integrated**: Part of Cloudflare infrastructure (no third-party services)
5. **Scalable**: Handles authentication for millions of requests
6. **Audit Trail**: Cloudflare provides access logs

### Why `jose` Library?

1. **Modern**: Industry-standard JWT library (IETF standards)
2. **Secure**: Cryptographically verified signatures
3. **TypeScript**: Full type safety
4. **Edge-Compatible**: Works in Cloudflare Workers runtime
5. **Maintained**: Active development and security updates

### Future Enhancements (Post-V1)

- **Multi-factor Authentication (MFA)**: Enable in Cloudflare Access
- **IP-based Restrictions**: Limit admin access by IP range
- **Time-based Access**: Restrict admin access to business hours
- **Better Auth Integration**: Story 9.1 (user authentication) for community features

---

## 📚 Reference Documentation

### Cloudflare Docs
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Access JWT Validation](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
- [Access Application Setup](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/)

### Next.js Docs
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Middleware Configuration](https://nextjs.org/docs/app/api-reference/file-conventions/middleware)

### Libraries
- [jose - JWT library](https://github.com/panva/jose)
- [jose Documentation](https://jose.readthedocs.io/)

---

**Story Created**: 2025-11-12
**Extracted From**: docs/specs/PRD.md (Epic 0, Story 0.8)
**Status**: 📋 PLANNING - Ready for phase breakdown
