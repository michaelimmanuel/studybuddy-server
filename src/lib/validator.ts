import { z } from 'zod';

// Generic validate function
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; errors?: string[]; data?: T } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.issues.map(e => e.message),
    };
  }
}
