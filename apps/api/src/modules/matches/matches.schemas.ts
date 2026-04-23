import { z } from "zod";

export const matchParamsSchema = z.object({
  matchId: z.string().min(1)
});

export const unmatchSchema = z.object({
  reason: z.string().min(1).max(240)
});

export type UnmatchRequest = z.infer<typeof unmatchSchema>;
