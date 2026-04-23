import { z } from "zod";

export const boostSchema = z.object({
  placement: z.enum(["discovery", "likes_you", "exclusive_pool"]).default("discovery"),
  costSpark: z.number().int().positive().default(300)
});

export type BoostRequest = z.infer<typeof boostSchema>;
