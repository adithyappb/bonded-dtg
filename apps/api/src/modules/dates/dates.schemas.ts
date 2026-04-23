import { z } from "zod";

export const dateParamsSchema = z.object({
  dateId: z.string().min(1)
});

export const proposeDateSchema = z.object({
  matchId: z.string().min(1),
  title: z.string().min(1).max(120),
  place: z.string().min(1).max(180),
  startsAt: z.string().datetime(),
  stakeWei: z.string().regex(/^[0-9]+$/)
});

export const dateOutcomeSchema = z.object({
  outcome: z.enum(["attended", "flaked", "disputed"]),
  note: z.string().max(500).optional()
});

export type ProposeDateRequest = z.infer<typeof proposeDateSchema>;
export type DateOutcomeRequest = z.infer<typeof dateOutcomeSchema>;
