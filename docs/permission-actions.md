# Permission Actions Reference

This document maps the canonical permission names to what a user with that permission can do in the system, plus example API endpoints or UI effects. Use this as a reference for admins and for frontend components that render UI based on permission grants.

Notes
- Permissions are granted per-user in `user_permission` and can be global (no `resourceType/resourceId`) or scoped to a resource.
- Explicit `DENY` grants take precedence over `ALLOW` in resolution logic. Scoped grants are checked before global grants.

## General format
- Permission name: `category.action` (e.g. `courses.view`)
- Description: short, what it enables
- Example endpoints / UI: where this permission is checked

---


## Simplified model — `manage` only

We now use a single permission per functional category: `category.manage`.

`category.manage` grants the holder the ability to view, create, read, update, and delete resources in that category. There are no separate `view` permissions — if a user lacks `category.manage`, they cannot access the category's management or viewing pages in the admin UI.

Below are the canonical `manage` permissions and example endpoints.

## Users


- `users.manage`
  - Description: View, create, update, and delete users and change roles (admin-level user management).
  - Example endpoints/UI: `GET /api/users/:id`, admin user list, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`.

## Courses


- `courses.manage`
  - Description: View, create, edit, publish, and delete courses.
  - Example endpoints/UI: `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses`, `PUT /api/courses/:id`, `DELETE /api/courses/:id`.

## Questions


- `questions.manage`
  - Description: View, create, edit, publish, and delete questions.
  - Example endpoints/UI: `GET /api/questions/:id`, `POST /api/courses/:id/questions`, `PUT /api/questions/:id`, `DELETE /api/questions/:id`.

## Quizzes


- `quizzes.manage`
  - Description: View, create, and modify quizzes and scoring rules.
  - Example endpoints/UI: `GET /api/quizzes/:id`, `POST /api/quizzes`, `PUT /api/quizzes/:id`.

## Packages & Bundles


- `packages.manage`
  - Description: View, create, and edit paid packages and bundle contents.
  - Example endpoints/UI: `GET /api/packages`, `POST /api/packages`, `PUT /api/packages/:id`.

## Purchases & Payments


- `purchases.manage`
  - Description: View purchases and perform admin sales/refund flows (create purchases, issue refunds).
  - Example endpoints/UI: `GET /api/purchases`, `POST /api/purchases`, `POST /api/purchases/:id/refund`.

## Referrals


- `referral.manage`
  - Description: View and manage referral codes and usage.
  - Example endpoints/UI: `GET /api/referral-codes`, `POST /api/referral-codes`, `DELETE /api/referral-codes/:id`.

## System & Admin


- `system.manage`
  - Description: View and manage system-level settings and admin-only operations.
  - Example endpoints/UI: `GET /api/health`, system config endpoints used by the ops team.

- `permissions.manage`
  - Description: Manage permission definitions and grants (use with caution).
  - Example endpoints/UI: `POST /api/admin/user-permissions`, admin permission UI.

## Notes for frontend implementers
- Use the `api` helper with `credentials: include` (already configured) to call the admin endpoints; then show/hide actions based on returned effective permissions (call `/api/debug/permissions` during development or compute via `hasPermission` on the server).
- Prefer checking permissions server-side before performing actions — the frontend checks are only for UX.

## Extending the list
- If you add new features, add a canonical permission name to `prisma/seed.mjs` and list it here with a short description and example endpoints.

---

Reference: see `studybuddy-server/prisma/seed.mjs` for canonical permission names seeded into the DB.
