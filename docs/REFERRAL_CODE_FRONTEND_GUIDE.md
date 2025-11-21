# 🎨 Frontend Implementation Guide: Referral Code System

Complete copy-paste instructions for implementing the referral code system in your frontend application.

## 📋 Table of Contents
1. [API Integration Setup](#api-integration-setup)
2. [Type Definitions](#type-definitions)
3. [Admin Components](#admin-components)
4. [User Components](#user-components)
5. [API Service Functions](#api-service-functions)
6. [Usage Examples](#usage-examples)

---

## 🔧 API Integration Setup

### Base Configuration
```typescript
// lib/api.ts or utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  post: async <T>(endpoint: string, body?: any): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  put: async <T>(endpoint: string, body?: any): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
```

---

## 📝 Type Definitions

```typescript
// types/referral.ts

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface ReferralCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  quota: number;
  usedCount: number;
  remainingUses: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  creator?: {
    name: string;
    email: string;
  };
}

export interface CreateReferralCodeInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  quota: number;
  expiresAt: string; // ISO date string
}

export interface UpdateReferralCodeInput {
  discountType?: DiscountType;
  discountValue?: number;
  quota?: number;
  isActive?: boolean;
  expiresAt?: string | null;
}

export interface ValidateReferralCodeResponse {
  valid: boolean;
  referralCode?: ReferralCode;
  message?: string;
}

export interface ReferralCodesListResponse {
  referralCodes: ReferralCode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Purchase types with referral code support
export interface PackagePurchaseInput {
  packageId: string;
  proofImageUrl: string;
  referralCode?: string; // Optional referral code
}

export interface BundlePurchaseInput {
  bundleId: string;
  proofImageUrl: string;
  referralCode?: string; // Optional referral code
}

export interface Purchase {
  id: string;
  userId: string;
  pricePaid: number;
  originalPrice: number;
  discountApplied: number;
  referralCodeId?: string;
  status: 'pending' | 'approved' | 'rejected';
  proofImageUrl?: string;
  createdAt: string;
}
```

---

## 🎯 API Service Functions

```typescript
// services/referralCodeService.ts

import { apiClient } from '@/lib/api';
import type {
  ReferralCode,
  CreateReferralCodeInput,
  UpdateReferralCodeInput,
  ValidateReferralCodeResponse,
  ReferralCodesListResponse
} from '@/types/referral';

export const referralCodeService = {
  // PUBLIC: Validate a referral code
  validate: async (code: string): Promise<ValidateReferralCodeResponse> => {
    return apiClient.post('/api/referral-codes/validate', { code });
  },

  // ADMIN: List all referral codes
  list: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ReferralCodesListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', params.isActive.toString());
    }
    
    const query = queryParams.toString();
    return apiClient.get(`/api/referral-codes${query ? `?${query}` : ''}`);
  },

  // ADMIN: Get referral code by ID
  getById: async (id: string): Promise<ReferralCode> => {
    return apiClient.get(`/api/referral-codes/${id}`);
  },

  // ADMIN: Create new referral code
  create: async (data: CreateReferralCodeInput): Promise<ReferralCode> => {
    return apiClient.post('/api/referral-codes', data);
  },

  // ADMIN: Update referral code
  update: async (
    id: string,
    data: UpdateReferralCodeInput
  ): Promise<ReferralCode> => {
    return apiClient.put(`/api/referral-codes/${id}`, data);
  },

  // ADMIN: Delete referral code
  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/api/referral-codes/${id}`);
  }
};

// services/purchaseService.ts - Updated with referral code support

export const purchaseService = {
  // Purchase package with optional referral code
  purchasePackage: async (data: PackagePurchaseInput) => {
    return apiClient.post('/api/purchases/package', data);
  },

  // Purchase bundle with optional referral code
  purchaseBundle: async (data: BundlePurchaseInput) => {
    return apiClient.post('/api/purchases/bundle', data);
  },

  // Get user's purchases
  getMyPurchases: async () => {
    return apiClient.get('/api/purchases/mine');
  }
};
```

---

## 👨‍💼 Admin Components

### 1. Create Referral Code Modal

```tsx
// components/admin/CreateReferralCodeModal.tsx
'use client';

import { useState } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import type { DiscountType } from '@/types/referral';

interface CreateReferralCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReferralCodeModal({
  isOpen,
  onClose,
  onSuccess
}: CreateReferralCodeModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 10,
    quota: 100,
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await referralCodeService.create(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        quota: 100,
        expiresAt: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create referral code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Referral Code</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              className="w-full px-3 py-2 border rounded-lg"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Z0-9_-]+"
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters, uppercase letters, numbers, underscores, hyphens
            </p>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ 
                ...formData, 
                discountType: e.target.value as DiscountType,
                discountValue: e.target.value === 'PERCENTAGE' ? 10 : 25000
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (IDR)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Value *
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
              min={formData.discountType === 'PERCENTAGE' ? 1 : 1000}
              max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
              step={formData.discountType === 'PERCENTAGE' ? 1 : 1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.discountType === 'PERCENTAGE' 
                ? '1-100% discount' 
                : 'Fixed amount in IDR'}
            </p>
          </div>

          {/* Quota */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Usage Quota *
            </label>
            <input
              type="number"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
              min={1}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of times this code can be used
            </p>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Expiration Date *
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 2. Referral Codes Management Page

```tsx
// app/admin/referral-codes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import CreateReferralCodeModal from '@/components/admin/CreateReferralCodeModal';
import type { ReferralCode } from '@/types/referral';

export default function ReferralCodesManagementPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await referralCodeService.list({
        page,
        limit: 20,
        isActive: filter === 'all' ? undefined : filter === 'active'
      });
      setCodes(response.referralCodes);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch referral codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page, filter]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await referralCodeService.update(id, { isActive: !currentStatus });
      fetchCodes();
    } catch (error) {
      alert('Failed to update referral code');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete referral code "${code}"?`)) return;
    
    try {
      await referralCodeService.delete(id);
      fetchCodes();
    } catch (error) {
      alert('Failed to delete referral code');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDiscount = (code: ReferralCode) => {
    return code.discountType === 'PERCENTAGE'
      ? `${code.discountValue}%`
      : `Rp ${code.discountValue.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Referral Codes Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Code
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => {
              setFilter(filterOption);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Codes Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No referral codes found
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-lg">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-semibold">
                        {formatDiscount(code)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {code.usedCount} / {code.quota}
                        </div>
                        <div className="text-gray-500">
                          {code.remainingUses} remaining
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          code.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleToggleActive(code.id, code.isActive)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(code.id, code.code)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CreateReferralCodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCodes}
      />
    </div>
  );
}
```

---

## 👤 User Components

### 3. Referral Code Input Component (for Purchase Flow)

```tsx
// components/purchase/ReferralCodeInput.tsx
'use client';

import { useState } from 'react';
import { referralCodeService } from '@/services/referralCodeService';
import type { ReferralCode } from '@/types/referral';

interface ReferralCodeInputProps {
  onCodeApplied: (code: ReferralCode) => void;
  onCodeRemoved: () => void;
  originalPrice: number;
}

export default function ReferralCodeInput({
  onCodeApplied,
  onCodeRemoved,
  originalPrice
}: ReferralCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCode, setAppliedCode] = useState<ReferralCode | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await referralCodeService.validate(code.toUpperCase());
      
      if (response.valid && response.referralCode) {
        setAppliedCode(response.referralCode);
        onCodeApplied(response.referralCode);
        setError('');
      } else {
        setError(response.message || 'Invalid referral code');
        setAppliedCode(null);
      }
    } catch (err: any) {
      setError('Failed to validate code');
      setAppliedCode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setAppliedCode(null);
    setError('');
    onCodeRemoved();
  };

  const calculateDiscount = (referralCode: ReferralCode): number => {
    if (referralCode.discountType === 'PERCENTAGE') {
      return Math.round((originalPrice * referralCode.discountValue) / 100);
    }
    return Math.min(referralCode.discountValue, originalPrice);
  };

  const calculateFinalPrice = (referralCode: ReferralCode): number => {
    return originalPrice - calculateDiscount(referralCode);
  };

  if (appliedCode) {
    const discount = calculateDiscount(appliedCode);
    const finalPrice = calculateFinalPrice(appliedCode);

    return (
      <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓ Code Applied</span>
              <span className="font-mono font-bold text-lg">{appliedCode.code}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {appliedCode.discountType === 'PERCENTAGE' 
                ? `${appliedCode.discountValue}% discount` 
                : `Rp ${appliedCode.discountValue.toLocaleString()} discount`}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
        
        <div className="space-y-1 text-sm mt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Original Price:</span>
            <span className="line-through">Rp {originalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Discount:</span>
            <span>- Rp {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Final Price:</span>
            <span className="text-green-600">Rp {finalPrice.toLocaleString()}</span>
          </div>
        </div>

        {appliedCode.remainingUses <= 10 && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Only {appliedCode.remainingUses} uses remaining
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <label className="block text-sm font-medium mb-2">
        Have a referral code?
      </label>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          placeholder="Enter code"
          className="flex-1 px-3 py-2 border rounded-lg uppercase"
          disabled={loading}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !code.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Apply'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 4. Enhanced Purchase Modal with Referral Code

```tsx
// components/purchase/PurchaseModal.tsx
'use client';

import { useState } from 'react';
import { purchaseService } from '@/services/purchaseService';
import ReferralCodeInput from './ReferralCodeInput';
import type { ReferralCode } from '@/types/referral';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemType: 'package' | 'bundle';
  itemId: string;
  itemTitle: string;
  itemPrice: number;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  itemType,
  itemId,
  itemTitle,
  itemPrice
}: PurchaseModalProps) {
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [appliedCode, setAppliedCode] = useState<ReferralCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateFinalPrice = (): number => {
    if (!appliedCode) return itemPrice;

    if (appliedCode.discountType === 'PERCENTAGE') {
      const discount = (itemPrice * appliedCode.discountValue) / 100;
      return itemPrice - Math.round(discount);
    }
    
    return Math.max(0, itemPrice - appliedCode.discountValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const purchaseData = {
        [itemType === 'package' ? 'packageId' : 'bundleId']: itemId,
        proofImageUrl,
        ...(appliedCode && { referralCode: appliedCode.code })
      };

      if (itemType === 'package') {
        await purchaseService.purchasePackage(purchaseData);
      } else {
        await purchaseService.purchaseBundle(purchaseData);
      }

      onSuccess();
      onClose();
      
      // Reset form
      setProofImageUrl('');
      setAppliedCode(null);
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const finalPrice = calculateFinalPrice();
  const hasSavings = appliedCode && finalPrice < itemPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          Purchase {itemType === 'package' ? 'Package' : 'Bundle'}
        </h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-2">{itemTitle}</h3>
          <div className="space-y-1">
            {hasSavings ? (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Original Price:</span>
                  <span className="line-through">Rp {itemPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount:</span>
                  <span>- Rp {(itemPrice - finalPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Final Price:</span>
                  <span className="text-green-600">Rp {finalPrice.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xl font-bold">
                <span>Price:</span>
                <span>Rp {itemPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Referral Code Input */}
          <ReferralCodeInput
            onCodeApplied={setAppliedCode}
            onCodeRemoved={() => setAppliedCode(null)}
            originalPrice={itemPrice}
          />

          {/* Payment Proof URL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Proof Image URL *
            </label>
            <input
              type="url"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
              placeholder="https://example.com/payment-proof.jpg"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your payment proof to an image hosting service and paste the URL here
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">Payment Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Transfer Rp {finalPrice.toLocaleString()} to Bank Account: 1234567890 (BCA)</li>
              <li>Take a screenshot of the transfer confirmation</li>
              <li>Upload the screenshot to an image hosting service</li>
              <li>Paste the image URL above</li>
              <li>Click Purchase to submit your order</li>
            </ol>
            <p className="mt-2 text-gray-600">
              Your purchase will be reviewed by admin within 24 hours.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading || !proofImageUrl}
            >
              {loading ? 'Processing...' : `Purchase (Rp ${finalPrice.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 📚 Usage Examples

### Example 1: Admin Creating a Referral Code

```tsx
// In your admin dashboard
import CreateReferralCodeModal from '@/components/admin/CreateReferralCodeModal';

function AdminDashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Create Referral Code
      </button>
      
      <CreateReferralCodeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          alert('Referral code created!');
          // Refresh your codes list
        }}
      />
    </>
  );
}
```

### Example 2: User Purchasing with Referral Code

```tsx
// In your package/bundle listing page
import PurchaseModal from '@/components/purchase/PurchaseModal';

function PackagePage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <>
      <button 
        onClick={() => {
          setSelectedPackage(pkg);
          setShowPurchaseModal(true);
        }}
      >
        Buy Now
      </button>

      {selectedPackage && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => {
            alert('Purchase submitted!');
            // Redirect or refresh
          }}
          itemType="package"
          itemId={selectedPackage.id}
          itemTitle={selectedPackage.title}
          itemPrice={selectedPackage.price}
        />
      )}
    </>
  );
}
```

### Example 3: Validating Code Before Purchase

```tsx
// Standalone validation
import { referralCodeService } from '@/services/referralCodeService';

async function checkCode(code: string) {
  const result = await referralCodeService.validate(code);
  
  if (result.valid) {
    console.log('Valid code:', result.referralCode);
    // Show discount info
  } else {
    console.log('Invalid:', result.message);
  }
}
```

---

## 🎨 Styling Notes

The components above use Tailwind CSS classes. If you're using a different CSS framework:

- Replace `className` with your framework's class names
- The color scheme uses:
  - Blue for primary actions (`bg-blue-600`)
  - Green for success/discounts (`bg-green-600`)
  - Red for errors/delete (`bg-red-600`)
  - Gray for disabled/secondary (`bg-gray-400`)

---

## ✅ Implementation Checklist

### Backend (Already Done)
- [x] Referral code API endpoints
- [x] Purchase API with referral code support
- [x] Database schema and migrations
- [x] Validation and business logic

### Frontend (To Implement)
- [ ] Copy type definitions to your project
- [ ] Create API service functions
- [ ] Implement admin referral code management page
- [ ] Create referral code input component
- [ ] Update purchase modal to include referral code
- [ ] Add referral code section to admin sidebar/menu
- [ ] Test complete flow: create code → apply code → purchase

---

## 🚀 Quick Start Steps

1. **Copy Type Definitions**: Create `types/referral.ts` with the provided types

2. **Add API Services**: Create `services/referralCodeService.ts` and update `services/purchaseService.ts`

3. **Create Admin Components**:
   - `components/admin/CreateReferralCodeModal.tsx`
   - `app/admin/referral-codes/page.tsx`

4. **Create User Components**:
   - `components/purchase/ReferralCodeInput.tsx`
   - Update your existing `PurchaseModal.tsx` or create new one

5. **Test the Flow**:
   - Login as admin → Create referral code
   - Login as user → Browse packages → Apply code → Purchase

---

## 💡 Pro Tips

1. **Validation**: The code input automatically converts to uppercase
2. **User Experience**: Show remaining uses when < 10 to create urgency
3. **Error Handling**: Always display validation errors clearly
4. **Loading States**: Use loading indicators for async operations
5. **Success Feedback**: Show confirmation after successful purchase
6. **Mobile Responsive**: Ensure modals work well on mobile devices

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
- **Solution**: Check that `API_BASE_URL` is correctly set and server is running

### Issue: "Unauthorized"
- **Solution**: Ensure `credentials: 'include'` is set in fetch calls

### Issue: "Code already exists"
- **Solution**: Check existing codes before creating new ones

### Issue: Discount not applying
- **Solution**: Verify `referralCode` is passed in purchase request body

---

## 📞 Support

For questions or issues:
1. Check API documentation: `/docs/referral-codes-api.md`
2. Verify backend is running and endpoints are accessible
3. Check browser console for errors
4. Ensure authentication cookies are being sent

---

*Last updated: November 21, 2025*
