# Access Control (Per-User Permissions) — StudyBuddy

This document captures my understanding of the platform features and a proposed per-user access control design (permission grants can be global or resource-scoped). It summarizes the permission model, resolution rules, Prisma schema sketch, middleware contract, management endpoints, rollout notes, and testing guidance.

## Inventory (features to protect)
- Courses: create, update, publish, delete, enrollments
- Questions & Quizzes: create, update, publish, score, view answers
- Packages / Bundles: create, update, manage pricing
- Purchases: view, refund, confirm
- Users: view, update, suspend, manage roles/permissions
- Referral codes: create, redeem, revoke
- System / Admin: view reports, run maintenance tasks, manage seeds

These map to permissions below.

## Permission model
- Permission: atomic string like `courses.create`, `questions.publish`, `purchases.view`, `users.manage`.
- Scope: permissions may be `global` or `resource-scoped`.
  - Resource-scoped example: `courses.update` with `resourceType='course'` and `resourceId=123` allows only that course.
- Grant type: `allow` or `deny` (explicit deny supports overrides in emergency/admin cases).
- Default: deny (no implicit broad access unless granted).

## Effective resolution rules
1. If any explicit `deny` grant matches (resource-scoped or global), the result is deny.
2. Else if any explicit `allow` grant matches (resource-scoped exact match preferred, then global), result is allow.
3. Else deny.

Notes:
- Resource-specific grants are matched first (exact resourceId), then broader resourceType-global grants, then global permissions.
- Consider caching resolved effective permissions per-session (short TTL) to avoid repeated DB hits.

## Prisma schema sketch
Add models to `prisma/schema.prisma` (conceptual):

```prisma
model Permission {
  id        Int     @id @default(autoincrement())
  name      String  @unique
}

model UserPermission {
  id           Int      @id @default(autoincrement())
  userId       Int
  permissionId Int
  grant        String   // 'allow' | 'deny'
  resourceType String?  // e.g., 'course'
  resourceId   Int?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([permissionId])
  @@index([resourceType, resourceId])
}
```

Implementation note: you can also store `permission` as a string on `UserPermission` to avoid joins for reads.

## Session exposure
- During authentication/session creation, resolve the user's global `allow` grants and optionally a list of resource-scoped grants (or keep scoped grants only in DB and query at check time).
- Keep the session payload small: prefer exposing a list of global permission names and rely on DB checks for resource-scoped grants.

## Middleware API (server-side)
- `hasPermission(user, permission, { resourceType?, resourceId? }) -> boolean`
- `requirePermission(permission, { resourceType?, param?: 'id' })` Express middleware that:
  - reads `req.user` or session
  - if `param` supplied, reads `req.params[param]` as `resourceId`
  - calls `next()` on allow, otherwise `next(httpError(403, 'Forbidden'))`

Examples:
- Protect course update: `router.put('/courses/:id', requirePermission('courses.update', {resourceType: 'course', param: 'id'}), handler)`

## Management endpoints
- `GET /api/admin/user-permissions?userId=` — list grants
- `POST /api/admin/user-permissions` — create grant { userId, permission, grant, resourceType?, resourceId? }
- `DELETE /api/admin/user-permissions/:id` — revoke grant

Protect these endpoints with an administrative permission (e.g., `users.manage` or a specific `permissions.manage`).

## Migration & seed
- Migration tasks:
  1. Add `Permission` and `UserPermission` models to Prisma schema.
  2. Run `prisma migrate dev` to create tables.
  3. Add `prisma/seed.ts` that upserts canonical permissions and creates an initial admin user with global `allow` grants for bootstrapping.

Seeding considerations:
- Make seeds idempotent (use upsert) so deploys are safe.

## Auditability & logging
- Record `createdBy` and timestamps on `UserPermission` if audit trail is required.
- Emit audit events for create/delete grants.

## Tests & CI
- Unit tests for `hasPermission` resolution logic covering combinations of global/ scoped allow/deny.
- Integration tests that exercise protected routes with test users and seeded grants.
- CI: run migrations + seed before tests.

## Rollout plan
1. Add DB objects and seed permissions but do not enforce checks (add middleware but keep routes unprotected).
2. Run monitoring mode: log permission checks for a sample of requests (or use feature flag to run checks but not block).
3. Gradually protect low-risk routes and run smoke tests.
4. Protect critical admin routes last; keep an emergency admin grant script in DB for rollback.
