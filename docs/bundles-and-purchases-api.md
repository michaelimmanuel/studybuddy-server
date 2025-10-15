# 📦 Bundles & Purchases API

This document describes the Bundle management and Purchase APIs you just added. Use these endpoints from the frontend to list bundles, manage them (admin), and let users purchase bundles or individual packages.

Base URL (local): `http://localhost:8000/api`
All endpoints require authentication (session cookie) unless otherwise noted. Admin-only endpoints are marked.

## 🔐 Auth & Access
- Auth is cookie-based via Better Auth already integrated.
- Attach `credentials: 'include'` in fetch/axios to send cookies.
- A user has access to a package if:
  1. They purchased the package directly (`package_purchase`)
  2. They purchased a bundle containing that package (`bundle_purchase` via `bundlePackages`)

---
## 📁 Data Models (Simplified)

### Bundle
```jsonc
{
  "id": "uuid",
  "title": "string",
  "description": "string|null",
  "price": 120000,          // Manual price (IDR or your chosen currency unit)
  "discount": 10,           // Optional percentage (0-100) – informational
  "isActive": true,
  "availableFrom": "2025-10-14T00:00:00.000Z" | null,
  "availableUntil": "2025-12-01T00:00:00.000Z" | null,
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "createdBy": "adminUserId",
  "bundlePackages": [
    {
      "id": "uuid",
      "packageId": "uuid",
      "order": 1,
      "package": { "id": "uuid", "title": "Package A", "price": 80000 }
    }
  ],
  "stats": {
    "totalOriginalPrice": 150000,
    "totalQuestions": 320,
    "savings": 30000,
    "savingsPercentage": 20,
    "packagesCount": 3
  }
}
```

### PackagePurchase
```jsonc
{
  "id": "uuid",
  "userId": "uuid",
  "packageId": "uuid",
  "pricePaid": 80000,
  "purchasedAt": "ISO date",
  "expiresAt": null
}
```

### BundlePurchase
```jsonc
{
  "id": "uuid",
  "userId": "uuid",
  "bundleId": "uuid",
  "pricePaid": 120000,
  "purchasedAt": "ISO date",
  "expiresAt": null
}
```

---
## 🧩 Bundle Endpoints
### GET `/api/bundles`
List bundles.
- Admin: sees all (active + inactive)
- User: sees only `isActive: true`

Response:
```jsonc
{
  "success": true,
  "data": [ Bundle, ... ]
}
```

### GET `/api/bundles/:id`
Fetch single bundle (respecting active filter for non-admins).

Response:
```jsonc
{ "success": true, "data": Bundle }
```

### POST `/api/bundles` (Admin)
Create a bundle.
Body:
```jsonc
{
  "title": "Premium Drill Set",
  "description": "Covers cardio, renal, endocrine cases",
  "price": 120000,
  "discount": 15,          // optional
  "availableFrom": "2025-10-20T00:00:00.000Z", // optional
  "availableUntil": null   // optional
}
```
Response:
```jsonc
{ "success": true, "message": "Bundle created successfully", "data": Bundle }
```

### PUT `/api/bundles/:id` (Admin)
Update selected fields.
Body (any subset):
```jsonc
{
  "title": "Updated Name",
  "price": 99000,
  "discount": 10,
  "isActive": false,
  "availableFrom": null,
  "availableUntil": "2025-12-31T00:00:00.000Z"
}
```
Response:
```jsonc
{ "success": true, "message": "Bundle updated successfully", "data": Bundle }
```

### DELETE `/api/bundles/:id` (Admin)
Hard delete the bundle.
Response:
```jsonc
{ "success": true, "message": "Bundle deleted successfully" }
```

### POST `/api/bundles/:bundleId/packages` (Admin)
Attach packages to a bundle.
Body:
```jsonc
{ "packageIds": ["pkg-uuid-1", "pkg-uuid-2"] }
```
Response:
```jsonc
{ "success": true, "message": "Packages added to bundle successfully", "data": { "added": 2 } }
```

### DELETE `/api/bundles/:bundleId/packages` (Admin)
Remove packages from a bundle.
Body:
```jsonc
{ "packageIds": ["pkg-uuid-1"] }
```
Response:
```jsonc
{ "success": true, "message": "Packages removed from bundle successfully", "data": { "removed": 1 } }
```

---
## 💳 Purchase Endpoints

### POST `/api/purchases/package`
Purchase single package (if not already owned directly or via a bundle).
Body:
```jsonc
{ "packageId": "pkg-uuid" }
```
Response:
```jsonc
{ "success": true, "message": "Package purchased successfully", "data": PackagePurchase }
```

### POST `/api/purchases/bundle`
Purchase a bundle (if not already owned).
Body:
```jsonc
{ "bundleId": "bundle-uuid" }
```
Response:
```jsonc
{ "success": true, "message": "Bundle purchased successfully", "data": BundlePurchase }
```

### GET `/api/purchases/mine`
Fetch all purchases for the current user.
Response:
```jsonc
{
  "success": true,
  "data": {
    "packages": [ PackagePurchase... ],
    "bundles": [ BundlePurchase... ]
  }
}
```

### GET `/api/purchases/package/:packageId/access`
Check whether the current user has access to a package.
Response:
```jsonc
{ "success": true, "data": { "packageId": "pkg-uuid", "hasAccess": true } }
```

---
## ✅ Frontend Usage Patterns

### 1. Fetch & Display Bundles
```ts
const bundles = await api.get<GetBundlesResponse>("/api/bundles");
```
Render `bundle.stats` for savings info.

### 2. Create Bundle (Admin)
```ts
await api.post("/api/bundles", { title, description, price, discount });
```
Then optionally call:
```ts
await api.post(`/api/bundles/${bundleId}/packages", { packageIds });
```

### 3. Purchase Flow
- Disable purchase button if already has access (pre-check access).
- After purchase, refetch purchases or access status.

Example:
```ts
await api.post("/api/purchases/bundle", { bundleId });
```

### 4. Check Access Before Showing Questions
```ts
const access = await api.get<CheckPackageAccessResponse>(`/api/purchases/package/${packageId}/access`);
if (!access.data.hasAccess) redirectToPurchase();
```

---
## 🔍 Error Cases
| Status | Scenario | Example Message |
|--------|----------|-----------------|
| 400 | Already owns package/bundle | "User already has access to this package" |
| 400 | Adding duplicate packages to bundle | "Some packages are already in this bundle: ..." |
| 404 | Bundle/Package not found | "Bundle not found" |
| 500 | Unexpected server error | "Internal server error" |

---
## 🧪 Postman / cURL Examples

Create bundle:
```bash
curl -X POST http://localhost:8000/api/bundles \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_TOKEN" \
  -d '{"title":"Premium Set","price":150000}'
```

Add packages to bundle:
```bash
curl -X POST http://localhost:8000/api/bundles/<bundleId>/packages \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=ADMIN_TOKEN" \
  -d '{"packageIds":["pkg1","pkg2"]}'
```

Purchase bundle:
```bash
curl -X POST http://localhost:8000/api/purchases/bundle \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=USER_TOKEN" \
  -d '{"bundleId":"..."}'
```

Check access:
```bash
curl -X GET http://localhost:8000/api/purchases/package/<packageId>/access \
  -H "Cookie: better-auth.session_token=USER_TOKEN"
```

---
## 🛠 Suggested Frontend Components To Build Next
| Component | Purpose |
|-----------|---------|
| `BundleManagement` (admin) | Already started; add edit/delete & attach packages |
| `CreateBundleModal` | Add package selection after creation (multi-select) |
| `EditBundleModal` | Update price/discount/status |
| `BundleList` (user) | Public display of active bundles with savings |
| `BundleDetail` (user) | Show included packages & access status |
| `PurchaseButton` | Unified purchase handler (package or bundle) |

---
## 🧭 Roadmap Enhancements (Optional)
- Soft delete / archive bundles
- Auto-compute `price` suggestion from child packages
- Time-limited access via `expiresAt`
- Bundle analytics (conversion, attach rate)
- Coupon / promo codes layer

---
Let me know if you want this merged into a single master API doc or auto-linked from `API_DOCUMENTATION.md`.
