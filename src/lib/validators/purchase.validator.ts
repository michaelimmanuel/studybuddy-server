import { z } from 'zod';

export const purchasePackageSchema = z.object({
  body: z.object({
    packageId: z.string().uuid('Invalid package ID'),
  }),
});

export const purchaseBundleSchema = z.object({
  body: z.object({
    bundleId: z.string().uuid('Invalid bundle ID'),
  }),
});

export const checkPackageAccessSchema = z.object({
  params: z.object({
    packageId: z.string().uuid('Invalid package ID'),
  }),
});
