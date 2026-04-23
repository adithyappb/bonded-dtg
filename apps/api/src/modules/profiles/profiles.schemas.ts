import { z } from "zod";

export const profileParamsSchema = z.object({
  profileId: z.string().min(1)
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(80),
  age: z.number().int().min(18).max(99),
  city: z.string().min(1).max(120),
  bio: z.string().min(1).max(500),
  interests: z.array(z.string().min(1).max(40)).min(1).max(12),
  walletValueVisible: z.boolean().default(false)
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
