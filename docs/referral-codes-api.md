# 🎟️ Referral Codes API

Complete documentation for the StudyBuddy referral code system that enables discount codes for package and bundle purchases.

## Base URL
```
http://localhost:8000/api/referral-codes
```

## 🎯 Overview

The referral code system allows administrators to create discount codes with:
- **Discount Types**: Percentage or fixed amount discounts
- **Quota Management**: Limited usage per code
- **Expiration**: Time-based code validity
- **Usage Tracking**: Monitor code usage and statistics

Users can apply these codes during package or bundle purchases to receive discounts.

## 🔒 Authentication & Authorization

| Access Level | Endpoints | Description |
|--------------|-----------|-------------|
| **Public** | `POST /validate` | Anyone can validate a code |
| **Admin** | All other endpoints | Create, read, update, delete codes |

---

## 📋 Endpoints

### 1. Validate Referral Code (Public)

Validate a referral code and get discount information.

**Endpoint:** `POST /api/referral-codes/validate`

**Authentication:** None required

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Validation Rules:**
- `code`: Required, string (3-20 characters, alphanumeric and underscores only)

**Success Response (200):**
```json
{
  "valid": true,
  "referralCode": {
    "id": "cm3abc123xyz",
    "code": "SAVE20",
    "discountType": "PERCENTAGE",
    "discountValue": 20.0,
    "quota": 100,
    "usedCount": 45,
    "remainingUses": 55,
    "expiresAt": "2025-12-31T23:59:59Z",
    "isActive": true
  }
}
```

**Invalid Code Response (200):**
```json
{
  "valid": false,
  "message": "Referral code has been fully used"
}
```

**Error Responses:**
- `400`: Validation error (invalid code format)
- `500`: Server error

---

### 2. List All Referral Codes (Admin)

Get a paginated list of all referral codes with filtering.

**Endpoint:** `GET /api/referral-codes`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page (1-100), default: 10
- `isActive` (optional): Filter by active status (true/false)

**Example Request:**
```
GET /api/referral-codes?page=1&limit=20&isActive=true
```

**Success Response (200):**
```json
{
  "referralCodes": [
    {
      "id": "cm3abc123xyz",
      "code": "SAVE20",
      "discountType": "PERCENTAGE",
      "discountValue": 20.0,
      "quota": 100,
      "usedCount": 45,
      "remainingUses": 55,
      "isActive": true,
      "expiresAt": "2025-12-31T23:59:59Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "createdBy": "cm2admin456def",
      "creator": {
        "name": "Admin User",
        "email": "admin@studybuddy.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not admin)
- `400`: Invalid query parameters
- `500`: Server error

---

### 3. Get Referral Code by ID (Admin)

Get detailed information about a specific referral code.

**Endpoint:** `GET /api/referral-codes/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: Referral code ID

**Success Response (200):**
```json
{
  "id": "cm3abc123xyz",
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "discountValue": 20.0,
  "quota": 100,
  "usedCount": 45,
  "remainingUses": 55,
  "isActive": true,
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "createdBy": "cm2admin456def",
  "creator": {
    "name": "Admin User",
    "email": "admin@studybuddy.com"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Referral code not found
- `500`: Server error

---

### 4. Create Referral Code (Admin)

Create a new referral code with discount settings.

**Endpoint:** `POST /api/referral-codes`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "discountValue": 20.0,
  "quota": 100,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Validation Rules:**
- `code`: Required, string (3-20 characters, alphanumeric and underscores, will be converted to uppercase)
- `discountType`: Required, enum ("PERCENTAGE" or "FIXED_AMOUNT")
- `discountValue`: Required, number (positive)
  - For PERCENTAGE: Must be between 1 and 100
  - For FIXED_AMOUNT: Any positive number
- `quota`: Required, integer (minimum 1)
- `expiresAt`: Required, ISO date string (must be in the future)

**Success Response (201):**
```json
{
  "id": "cm3abc123xyz",
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "discountValue": 20.0,
  "quota": 100,
  "usedCount": 0,
  "remainingUses": 100,
  "isActive": true,
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2025-11-21T03:44:30Z",
  "createdBy": "cm2admin456def"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `400`: Validation error or duplicate code
- `500`: Server error

**Example Error (Duplicate Code):**
```json
{
  "message": "Referral code already exists"
}
```

---

### 5. Update Referral Code (Admin)

Update an existing referral code.

**Endpoint:** `PUT /api/referral-codes/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: Referral code ID

**Request Body (all fields optional):**
```json
{
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50.0,
  "quota": 200,
  "isActive": false,
  "expiresAt": "2026-01-31T23:59:59Z"
}
```

**Validation Rules:**
- All fields are optional (at least one must be provided)
- Same validation rules as create for each field
- Cannot update `code` or `usedCount`
- `expiresAt` must be in the future if provided

**Success Response (200):**
```json
{
  "id": "cm3abc123xyz",
  "code": "SAVE20",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50.0,
  "quota": 200,
  "usedCount": 45,
  "remainingUses": 155,
  "isActive": false,
  "expiresAt": "2026-01-31T23:59:59Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "createdBy": "cm2admin456def"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Referral code not found
- `400`: Validation error or no fields provided
- `500`: Server error

---

### 6. Delete Referral Code (Admin)

Delete a referral code. This is a soft delete that deactivates the code.

**Endpoint:** `DELETE /api/referral-codes/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: Referral code ID

**Success Response (200):**
```json
{
  "message": "Referral code deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: Referral code not found
- `500`: Server error

---

## 💰 Using Referral Codes in Purchases

### Package Purchase with Referral Code

**Endpoint:** `POST /api/purchases/package`

**Request Body:**
```json
{
  "packageId": "cm3pkg789ghi",
  "proofImageUrl": "https://example.com/payment-proof.jpg",
  "referralCode": "SAVE20"
}
```

The system will:
1. Validate the referral code
2. Calculate the discount based on package price
3. Apply the discount
4. Track original price and discount amount
5. Increment the code's usage count

**Response includes:**
```json
{
  "id": "cm3purchase123",
  "userId": "cm2user123abc",
  "packageId": "cm3pkg789ghi",
  "pricePaid": 80.0,
  "originalPrice": 100.0,
  "discountApplied": 20.0,
  "referralCodeId": "cm3abc123xyz",
  "status": "pending",
  "proofImageUrl": "https://example.com/payment-proof.jpg",
  "createdAt": "2025-11-21T03:44:30Z"
}
```

### Bundle Purchase with Referral Code

**Endpoint:** `POST /api/purchases/bundle`

**Request Body:**
```json
{
  "bundleId": "cm3bundle789",
  "proofImageUrl": "https://example.com/payment-proof.jpg",
  "referralCode": "SAVE20"
}
```

Same discount logic applies to bundle purchases.

---

## 📊 Discount Calculation

### Percentage Discount
```
discountAmount = (originalPrice × discountValue) / 100
finalPrice = originalPrice - discountAmount
```

**Example:**
- Original Price: $100
- Discount: 20% (PERCENTAGE)
- Discount Amount: $20
- Final Price: $80

### Fixed Amount Discount
```
discountAmount = min(discountValue, originalPrice)
finalPrice = originalPrice - discountAmount
```

**Example:**
- Original Price: $100
- Discount: $25 (FIXED_AMOUNT)
- Discount Amount: $25
- Final Price: $75

**Note:** Fixed discounts cannot exceed the original price.

---

## 🔍 Validation Rules

A referral code is considered **valid** when:
1. ✅ Code exists in the database
2. ✅ `isActive` is `true`
3. ✅ `expiresAt` is in the future (or null)
4. ✅ `usedCount < quota` (remaining uses available)

A referral code is **invalid** when:
- ❌ Code doesn't exist
- ❌ Code is inactive
- ❌ Code has expired
- ❌ Quota is fully used

---

## 📝 Examples

### Example 1: Create Percentage Discount Code

**Request:**
```bash
curl -X POST http://localhost:8000/api/referral-codes \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=your-token" \
  -d '{
    "code": "WELCOME10",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "quota": 50,
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

### Example 2: Create Fixed Amount Discount

**Request:**
```bash
curl -X POST http://localhost:8000/api/referral-codes \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=your-token" \
  -d '{
    "code": "FIRSTBUY",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 25,
    "quota": 100,
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

### Example 3: Validate Code Before Purchase

**Request:**
```bash
curl -X POST http://localhost:8000/api/referral-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10"
  }'
```

**Response:**
```json
{
  "valid": true,
  "referralCode": {
    "id": "cm3abc123xyz",
    "code": "WELCOME10",
    "discountType": "PERCENTAGE",
    "discountValue": 10.0,
    "quota": 50,
    "usedCount": 5,
    "remainingUses": 45,
    "expiresAt": "2025-12-31T23:59:59Z",
    "isActive": true
  }
}
```

### Example 4: Purchase Package with Code

**Request:**
```bash
curl -X POST http://localhost:8000/api/purchases/package \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=your-token" \
  -d '{
    "packageId": "cm3pkg789ghi",
    "proofImageUrl": "https://example.com/proof.jpg",
    "referralCode": "WELCOME10"
  }'
```

---

## ⚠️ Important Notes

1. **Code Uniqueness**: Referral codes must be unique across the system
2. **Case Insensitive**: Codes are stored and validated in uppercase
3. **Atomic Operations**: Purchase with referral code uses database transactions
4. **Usage Tracking**: Used count increments only after successful purchase
5. **No Retroactive Discounts**: Codes cannot be applied to existing purchases
6. **Admin Management**: Only admins can create, update, or delete codes
7. **Public Validation**: Anyone can validate a code before purchase

---

*Last updated: November 21, 2025*
