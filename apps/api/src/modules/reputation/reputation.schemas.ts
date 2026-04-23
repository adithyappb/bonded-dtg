import { z } from "zod";

export const reputationParamsSchema = z.object({
  profileId: z.string().min(1)
});
