**Permissions — Missing Implementation Checklist**

- **Controller Enforcement**: Add `hasPermission` / `requirePermission` checks inside controllers for resource-scoped actions (e.g., `course`, `package`, `question`). Files to update: [studybuddy-server/src/controller](studybuddy-server/src/controller).

- **Audit `requireAdmin` Usage**: Replace or complement `requireAdmin` guards with `requirePermission('<category>.manage')` where appropriate while preserving existing behavior. Helper: search for `requireAdmin` in [studybuddy-server/src](studybuddy-server/src).

- **Scoped Grants Support**: Implement handling for `UserPermission` rows with `resourceType`/`resourceId` (scoped ALLOW/DENY) in middleware helpers and `hasPermission(userId, perm, {resourceType, resourceId})` logic.

- **Session Resolution Robustness**: Improve `attachPermissionsToRequest` to reliably resolve sessions in all environments (cookie names, token encoding, DB instance mismatch). Verify the server and auth service use the same `DATABASE_URL` and `BETTER_AUTH_URL`.

- **Persisting Permissions to Session Store**: Ensure attached permissions persist where a session store is used (call `req.session.save()` only when available and test behavior across restarts).

- **Protect Admin Permission Endpoints**: Ensure routes under [studybuddy-server/src/routes/admin.permissions.ts](studybuddy-server/src/routes/admin.permissions.ts) require `permissions.manage` server-side (not only `requireAdmin`).

- **Frontend: Page & Action Gating**: Audit frontend admin pages/components to hide/disable actions based on the `permissions` array from `/api/users/me`. Files to review: [studybuddy-web/src/app/admin](studybuddy-web/src/app/admin), [studybuddy-web/src/components](studybuddy-web/src/components).

- **Remove/Gate Dev Debug Endpoints**: Remove or gate debug routes such as `/api/debug/*` from production routing and the main `src/routes/index.ts` mount.

- **Seeding & Bootstrap Verification**: Confirm `prisma/seed.mjs` uses a correct `BOOTSTRAP_ADMIN_ID` for your current admin user, and provide a small script to grant the current user the canonical `*.manage` permissions if needed.

- **Tests & Smoke Scripts**: Add integration tests that simulate a logged-in session and assert that `/api/users/me` returns expected `permissions`, and that protected endpoints enforce permissions.

- **Docs & Examples**: Update `studybuddy-server/docs` with concrete examples: how to add a new permission, how to grant a scoped permission, and how to call `hasPermission` in controllers. Reference files: [studybuddy-server/docs](studybuddy-server/docs).

- **Migration Plan**: If moving from `requireAdmin` to permission-based guards, prepare a staged rollout plan and migration notes in `docs/`.

If you want, I can: (A) implement one of these items (pick one), (B) add automated tests scaffold, or (C) create a small script to grant the current admin all seeded permissions. Which should I do next?