import { z } from "zod";

export const checkoutSchema = z.object({
  planId: z.enum(["premium_monthly", "premium_yearly"]),
  chainId: z.coerce.number().int().positive().default(84532)
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
