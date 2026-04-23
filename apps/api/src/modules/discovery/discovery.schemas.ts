import { z } from "zod";

export const discoveryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(25).default(10),
  maxGhostScore: z.coerce.number().int().min(0).max(100).default(25)
});

export const swipeSchema = z.object({
  profileId: z.string().min(1),
  decision: z.enum(["like", "pass"])
});

export const filtersSchema = z.object({
  minAge: z.number().int().min(18).default(24),
  maxAge: z.number().int().min(18).default(40),
  maxGhostScore: z.number().int().min(0).max(100).default(25),
  interests: z.array(z.string()).default([])
});

export type DiscoveryQuery = z.infer<typeof discoveryQuerySchema>;
export type SwipeRequest = z.infer<typeof swipeSchema>;
export type FiltersRequest = z.infer<typeof filtersSchema>;
