# Phase X - [Phase Name]

**Epic**: [Epic Name/Number]
**Priority**: High | Medium | Low
**Estimated Duration**: [X-Y hours/days]
**Prerequisites**: [List of previous phases or dependencies]

---

## 🎯 Objective

[1-2 paragraph description of what this phase achieves and why it's important]

Example:
> Implement a comprehensive authentication system using JWT tokens with role-based access control. This phase establishes the security foundation for the application, enabling secure user login, session management, and protected routes with granular permissions.

---

## 📋 Scope

List all features/components to implement:

- [ ] Feature/Component 1
- [ ] Feature/Component 2
- [ ] Feature/Component 3
- [ ] Tests (unit + integration)
- [ ] Documentation

Example:
- [ ] User registration endpoint
- [ ] Login/logout endpoints
- [ ] JWT token generation and validation
- [ ] Authentication middleware
- [ ] Role-based permission system
- [ ] Password hashing with bcrypt
- [ ] Unit tests for auth utilities
- [ ] Integration tests for endpoints
- [ ] API documentation

---

## 📁 Files to Create/Modify

### New Files

List files to create with brief description:

```
path/to/file.ext - Description
```

Example:
```
src/auth/jwt.ts - JWT token utilities (generate, validate, refresh)
src/auth/password.ts - Password hashing and validation
src/middleware/auth.ts - Authentication middleware for protected routes
src/middleware/permissions.ts - Role-based permission checks
src/routes/auth.ts - Authentication endpoints (login, logout, register)
src/types/auth.ts - TypeScript types for authentication
__tests__/auth/jwt.test.ts - Unit tests for JWT utilities
__tests__/auth/integration.test.ts - Integration tests for auth flow
```

### Modified Files

List existing files to modify:

```
path/to/file.ext - What changes (add X, update Y, refactor Z)
```

Example:
```
src/types/user.ts - Add role and permissions fields
src/config/env.ts - Add JWT_SECRET and JWT_EXPIRY variables
src/app.ts - Register auth routes
src/middleware/index.ts - Export new auth middleware
```

---

## 📦 Dependencies

### New Packages to Install

List packages with version and purpose:

```
package-name@version - Purpose
```

Example:
```
jsonwebtoken@^9.0.0 - JWT token generation and verification
bcrypt@^5.1.0 - Password hashing
@types/jsonwebtoken@^9.0.0 - TypeScript types for jsonwebtoken
@types/bcrypt@^5.0.0 - TypeScript types for bcrypt
```

### External Services

List any external services needed:

Example:
- **Database**: PostgreSQL (users table with authentication fields)
- **Redis** (optional): Session storage for token blacklisting
- **Email Service**: For password reset emails (future phase)

---

## 🗄️ Data Models (if applicable)

### Database Schema

Describe database tables/collections needed:

Example:
```typescript
// Users table
interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

// Sessions table (if using database sessions)
interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}
```

---

## 🔧 Configuration

### Environment Variables

List required environment variables:

```
VARIABLE_NAME=description | example_value | required/optional
```

Example:
```
JWT_SECRET=Secret key for JWT signing | my-super-secret-key-change-in-production | required
JWT_EXPIRY=Token expiration time | 24h | optional (default: 24h)
JWT_REFRESH_EXPIRY=Refresh token expiration | 7d | optional (default: 7d)
BCRYPT_ROUNDS=Number of salt rounds for bcrypt | 10 | optional (default: 10)
```

### Application Config

Any configuration files to create/modify:

Example:
```typescript
// src/config/auth.ts
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};
```

---

## 🧪 Tests

### Unit Tests

List unit tests needed:

Example:
- **JWT Utilities**:
  - `generateToken()` creates valid JWT
  - `validateToken()` validates correct tokens
  - `validateToken()` rejects expired tokens
  - `validateToken()` rejects invalid signatures
  - `refreshToken()` generates new token from valid refresh token

- **Password Utilities**:
  - `hashPassword()` creates bcrypt hash
  - `comparePassword()` validates correct password
  - `comparePassword()` rejects incorrect password

### Integration Tests

List integration tests needed:

Example:
- **Registration Flow**:
  - POST /auth/register creates new user
  - Duplicate email returns 409
  - Invalid email returns 400

- **Login Flow**:
  - POST /auth/login with correct credentials returns token
  - POST /auth/login with wrong password returns 401
  - POST /auth/login with non-existent user returns 401

- **Protected Routes**:
  - Request with valid token succeeds
  - Request without token returns 401
  - Request with expired token returns 401
  - Request with invalid token returns 401

- **Permission Checks**:
  - Admin can access admin routes
  - Editor cannot access admin routes
  - Viewer has read-only access

### E2E Tests (if applicable)

List end-to-end tests:

Example:
- Complete user registration → login → access protected resource flow
- Token refresh flow
- Logout and session invalidation

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] Users can register with email and password
- [ ] Users can login and receive JWT token
- [ ] Users can logout (token invalidation)
- [ ] Protected routes require valid authentication
- [ ] Role-based permissions work correctly
- [ ] Passwords are securely hashed (never stored plain)
- [ ] Tokens expire after configured time

### Non-Functional Requirements

- [ ] All endpoints return proper HTTP status codes
- [ ] Error messages are clear but don't leak sensitive info
- [ ] Password requirements enforced (min length, complexity)
- [ ] Rate limiting on auth endpoints (prevent brute force)
- [ ] Logging for authentication events
- [ ] Performance: Auth check <10ms
- [ ] Security: No XSS, CSRF, or injection vulnerabilities

### Quality Requirements

- [ ] Test coverage >80%
- [ ] All TypeScript types defined (no `any`)
- [ ] Code follows project style guide
- [ ] All linting rules pass
- [ ] Documentation complete (API docs, README)

---

## 🔐 Security Considerations

List security concerns and how to address them:

Example:
- **Password Storage**: Use bcrypt with 10+ rounds
- **JWT Secret**: Store in environment variable, never commit
- **Token Expiry**: Set reasonable expiry (24h for access, 7d for refresh)
- **Input Validation**: Validate all inputs (email format, password strength)
- **Rate Limiting**: Limit login attempts (5 attempts per 15 min)
- **HTTPS Only**: Tokens only transmitted over HTTPS in production
- **SQL Injection**: Use parameterized queries or ORM
- **XSS Prevention**: Sanitize all outputs

---

## ⚠️ Known Limitations / Future Work

List any known limitations or features deferred to future phases:

Example:
- Email verification not included (Phase 4)
- Password reset flow not included (Phase 4)
- Two-factor authentication not included (Phase 5)
- OAuth/Social login not included (Phase 6)
- Token refresh rotation not implemented (Phase 7)

---

## 📊 Success Metrics

How to measure success of this phase:

Example:
- All 15 unit tests pass
- All 12 integration tests pass
- Test coverage >85%
- Authentication check latency <10ms
- Zero security vulnerabilities in scan
- All endpoints documented in API docs
- Code review approved by 2+ team members

---

## 🔗 Related Documentation

Links to relevant docs:

Example:
- [JWT Best Practices](https://auth0.com/blog/jwt-handbook/)
- [bcrypt Guide](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [API Design Guidelines](../../docs/api-guidelines.md)

---

## 📝 Implementation Notes

Any additional notes for implementation:

Example:
- Use existing `User` model from Phase 1, extend with auth fields
- Integrate with existing error handling middleware
- Follow REST conventions for auth endpoints
- Consider future migration to refresh token rotation
- Ensure compatibility with existing database migrations

---

## ❓ Open Questions

List any unresolved questions:

Example:
- Should we implement remember me functionality? → Decision: No, use refresh tokens
- Should we log failed login attempts? → Decision: Yes, for security monitoring
- Should we implement IP-based rate limiting? → Decision: Yes, at application level
- Should we use Redis for token blacklisting? → Decision: Optional, implement if needed

---

**Specification Status**: ✅ Ready for Implementation | 🚧 In Review | 📝 Draft
**Last Updated**: [Date]
**Author**: [Name]
**Reviewers**: [Names]
