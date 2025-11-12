import { z } from 'zod';

export const purchasePackageSchema = z.object({
  body: z.object({
    packageId: z.string().uuid('Invalid package ID'),
    proofImageUrl: z.string().url('Invalid image URL').optional(),
  }),
});

export const purchaseBundleSchema = z.object({
  body: z.object({
    bundleId: z.string().uuid('Invalid bundle ID'),
    proofImageUrl: z.string().url('Invalid image URL').optional(),
  }),
});

export const checkPackageAccessSchema = z.object({
  params: z.object({
    packageId: z.string().uuid('Invalid package ID'),
  }),
});
