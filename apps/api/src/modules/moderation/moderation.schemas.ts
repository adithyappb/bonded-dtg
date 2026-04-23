import { z } from "zod";

export const reportSchema = z.object({
  targetId: z.string().min(1),
  reason: z.enum(["spam", "harassment", "fake_profile", "unsafe_behavior", "other"]),
  detail: z.string().max(1000).optional()
});

export const blockSchema = z.object({
  targetProfileId: z.string().min(1)
});

export type ReportRequest = z.infer<typeof reportSchema>;
export type BlockRequest = z.infer<typeof blockSchema>;
