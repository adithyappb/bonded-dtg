import { z } from "zod";

export const recommendationSchema = z.object({
  candidateProfileId: z.string().min(1),
  targetProfileId: z.string().min(1),
  rationale: z.string().min(1).max(500),
  successFeeWei: z.string().regex(/^[0-9]+$/)
});

export type RecommendationRequest = z.infer<typeof recommendationSchema>;
