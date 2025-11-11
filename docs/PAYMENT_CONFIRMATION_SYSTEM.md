# Payment Confirmation System

## Overview

The StudyBuddy platform implements a manual payment confirmation system where all purchases (packages and bundles) require admin approval before users can access the content. This prevents unauthorized access and ensures payment verification.

## Key Features

- **Manual Approval Required**: All purchases default to `approved: false` and require admin confirmation
- **Access Control**: Users cannot access quiz content until their purchase is approved
- **Expiration Support**: Both packages and bundles support optional expiration dates
- **Bundle Inheritance**: Bundle purchases grant access to all included packages when approved
- **Frontend Feedback**: Clear status indicators show pending vs approved purchases

## Architecture

### Database Schema

Both `PackagePurchase` and `BundlePurchase` models include:

```prisma
approved    Boolean  @default(false) // Requires admin approval
expiresAt   DateTime? // Optional expiration
```

### Access Control Function

Location: `src/lib/access-control.ts`

The `userHasPackageAccess()` function checks:
1. Direct package purchase exists and is approved
2. Bundle purchase exists, is approved, and includes the package
3. Neither purchase has expired

```typescript
export const userHasPackageAccess = async (
  userId: string, 
  packageId: string
): Promise<boolean>
```

This function is used by:
- Purchase controller (checking duplicate purchases)
- Quiz controller (validating access before submission)
- Any future content access endpoints

## API Endpoints

### User Endpoints

#### Purchase Package
```
POST /api/purchases/package
Body: { packageId: string }
Response: { success: boolean, message: string, data: PackagePurchase }
```
Creates a purchase with `approved: false`. Users receive a message about waiting for approval.

#### Purchase Bundle
```
POST /api/purchases/bundle
Body: { bundleId: string }
Response: { success: boolean, message: string, data: BundlePurchase }
```
Creates a bundle purchase with `approved: false`.

#### Get My Purchases
```
GET /api/purchases/mine
Response: { 
  success: boolean, 
  data: { 
    packages: PackagePurchase[], 
    bundles: BundlePurchase[] 
  } 
}
```
Returns all purchases for the authenticated user, including approval status.

#### Check Package Access
```
GET /api/purchases/package/:packageId/access
Response: { success: boolean, data: { packageId: string, hasAccess: boolean } }
```
Checks if user has approved access to a specific package.

### Admin Endpoints

#### List All Purchases
```
GET /api/purchases/admin/all
Response: { 
  success: boolean, 
  data: { 
    packages: PackagePurchase[], 
    bundles: BundlePurchase[] 
  } 
}
```
Returns all purchases across all users.

#### Approve Purchase
```
POST /api/purchases/admin/:type/:id/approve
Params: type = 'package' | 'bundle', id = purchase ID
Response: { success: boolean, data: PackagePurchase | BundlePurchase }
```
Sets `approved: true` on the specified purchase. User can now access content.

#### Revoke Purchase
```
POST /api/purchases/admin/:type/:id/revoke
Params: type = 'package' | 'bundle', id = purchase ID
Response: { success: boolean, data: PackagePurchase | BundlePurchase }
```
Sets `approved: false`. User loses access to content.

#### Delete Purchase
```
DELETE /api/purchases/admin/:type/:id
Params: type = 'package' | 'bundle', id = purchase ID
Response: { success: boolean, data: PackagePurchase | BundlePurchase }
```
Permanently deletes the purchase record.

## Quiz Access Enforcement

Location: `src/controller/quiz/index.ts`

Before allowing quiz submission, the system checks:

```typescript
const hasAccess = await userHasPackageAccess(userId, packageId);
if (!hasAccess) {
  return res.status(403).json({
    success: false,
    message: 'You do not have access to this package. Please purchase and wait for admin approval.'
  });
}
```

This prevents:
- Unapproved users from submitting quizzes
- Expired access from being used
- Users without any purchase from accessing content

## Frontend Integration

### User Dashboard

Location: `studybuddy-web/src/app/(user)/dashboard/page.tsx`

Features:
- Yellow notice banner for pending approvals
- Status badges on each purchase (✓ Active / ⏳ Pending)
- Quiz buttons disabled until approved
- Clear messaging about waiting for approval

### Purchase Modal

Location: `studybuddy-web/src/components/user/BundleDetailsModal.tsx`

After purchase:
- Success message explains approval requirement
- Button text changes to "Request Submitted"
- User redirected to dashboard to check status

### Admin Panel

Location: `studybuddy-web/src/components/admin/PurchaseManagement.tsx`

Features:
- Filter tabs: All / Pending / Approved
- Pending count badge
- Visual indicators (yellow background for pending)
- One-click approve/revoke/delete actions
- Separate tables for packages and bundles

## Workflow

### User Purchase Flow

1. User browses bundles/packages
2. User clicks "Purchase Bundle/Package"
3. System creates purchase record with `approved: false`
4. User sees success message: "Purchase request submitted. Please wait for admin approval."
5. User dashboard shows purchase with "⏳ Pending" badge
6. Quiz/content buttons are disabled

### Admin Approval Flow

1. Admin opens Purchase Management panel
2. Admin sees pending purchases highlighted in yellow
3. Admin clicks "Pending" filter to see only unapproved
4. Admin reviews payment/user details
5. Admin clicks "Approve" button
6. Purchase status changes to `approved: true`
7. User can now access content immediately

### User Access Flow

1. User tries to start quiz or access content
2. System calls `userHasPackageAccess(userId, packageId)`
3. If not approved → 403 error with clear message
4. If approved and not expired → Access granted
5. User dashboard shows "✓ Active" badge
6. Quiz buttons enabled

## Migration

The schema change was applied via migration:
```
20251111071119_change_purchase_approval_default_to_false
```

This migration changes the default value of `approved` from `true` to `false`.

**Important**: Existing purchases created before this migration will retain their original `approved: true` value. Only new purchases after the migration will default to `false`.

To backfill existing purchases if needed:
```sql
-- Review purchases that need approval
SELECT * FROM package_purchase WHERE approved = true;
SELECT * FROM bundle_purchase WHERE approved = true;

-- Optionally revoke all for manual re-approval
UPDATE package_purchase SET approved = false WHERE approved = true;
UPDATE bundle_purchase SET approved = false WHERE approved = true;
```

## Security Considerations

1. **Server-Side Enforcement**: Access checks are always performed server-side. Frontend UI is for convenience only.

2. **Expiration Checks**: Both approved status AND expiration date are checked on every access.

3. **Bundle Access**: When a bundle is approved, all included packages become accessible. If bundle is revoked, access to all packages is removed.

4. **Admin Permissions**: Only users with `role: 'admin'` can approve/revoke/delete purchases.

5. **Audit Trail**: Purchase records include:
   - `purchasedAt`: When user initiated purchase
   - `pricePaid`: Amount paid (for accounting)
   - `approved`: Current approval status
   - User relationship for tracking

## Testing

### Manual Testing Checklist

**User Flow:**
- [ ] Purchase a package, verify status is "Pending"
- [ ] Try to start quiz, verify 403 error
- [ ] Check dashboard shows yellow warning banner
- [ ] Verify quiz buttons are disabled

**Admin Flow:**
- [ ] Open Purchase Management
- [ ] Verify pending purchases show in yellow
- [ ] Click "Pending" filter
- [ ] Approve a purchase
- [ ] Verify it moves to approved status

**Post-Approval:**
- [ ] User dashboard shows "Active" badge
- [ ] Quiz buttons become enabled
- [ ] User can successfully submit quiz
- [ ] Content is accessible

**Revocation:**
- [ ] Admin revokes an approved purchase
- [ ] User loses access to content
- [ ] Quiz submission returns 403
- [ ] Dashboard shows "Pending" again

## Future Enhancements

Potential improvements:
1. **Email Notifications**: Notify users when purchases are approved/revoked
2. **Bulk Actions**: Approve multiple purchases at once
3. **Payment Gateway Integration**: Auto-approve on successful payment
4. **Approval Comments**: Let admins add notes on why purchase was approved/denied
5. **Purchase History**: Track state changes (pending → approved → revoked)
6. **Refund Workflow**: Mark purchases as refunded
7. **Analytics**: Track approval times, pending purchase aging

## Troubleshooting

### User can't access content after approval

1. Check purchase status in database:
   ```sql
   SELECT * FROM package_purchase WHERE userId = 'USER_ID' AND approved = true;
   ```

2. Check expiration:
   ```sql
   SELECT *, NOW() > expiresAt as is_expired FROM package_purchase WHERE id = 'PURCHASE_ID';
   ```

3. Verify user session is valid

### Admin can't see pending purchases

1. Confirm admin role:
   ```sql
   SELECT id, email, role FROM "user" WHERE role = 'admin';
   ```

2. Check if purchases exist:
   ```sql
   SELECT COUNT(*) FROM package_purchase WHERE approved = false;
   ```

3. Verify API endpoint permissions

### Quiz submission fails with 403

This is expected behavior if:
- Purchase is not approved
- Purchase has expired
- No purchase exists for the package

Check access with:
```typescript
const hasAccess = await userHasPackageAccess(userId, packageId);
console.log('User has access:', hasAccess);
```

## Related Documentation

- [Bundles and Purchases API](./bundles-and-purchases-api.md)
- [Quiz Feature Guide](../../studybuddy-web/docs/QUIZ_FEATURE_GUIDE.md)
- [Admin Creation Feature](./admin-creation-feature.md)
