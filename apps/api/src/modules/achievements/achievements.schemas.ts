import { z } from "zod";

export const proofRequestSchema = z.object({
  achievementId: z.string().min(1),
  chainId: z.coerce.number().int().positive().default(84532)
});

export type ProofRequest = z.infer<typeof proofRequestSchema>;
