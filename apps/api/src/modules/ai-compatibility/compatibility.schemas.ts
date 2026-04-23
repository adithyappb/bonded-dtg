import { z } from "zod";

export const compatibilityScoreSchema = z.object({
  profileA: z.object({
    interests: z.array(z.string()).default([]),
    prompt: z.string().default("")
  }),
  profileB: z.object({
    interests: z.array(z.string()).default([]),
    prompt: z.string().default("")
  })
});

export type CompatibilityScoreRequest = z.infer<typeof compatibilityScoreSchema>;
