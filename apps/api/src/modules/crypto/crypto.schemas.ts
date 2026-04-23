import { z } from "zod";

export const cryptoPurposeSchema = z.enum([
  "premium_subscription",
  "profile_boost",
  "matchmaker_reward",
  "split_bill",
  "relationship_agreement",
  "date_stake",
  "generic_payment"
]);

export const createPaymentIntentSchema = z.object({
  purpose: cryptoPurposeSchema,
  relatedId: z.string().min(1).optional(),
  chainId: z.coerce.number().int().positive().default(84532),
  toAddress: z.string().min(1).optional(),
  amountWei: z.string().regex(/^[0-9]+$/),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export const paymentIntentParamsSchema = z.object({
  intentId: z.string().uuid()
});

export const attachPaymentTransactionSchema = z.object({
  chainId: z.coerce.number().int().positive().default(84532),
  hash: z.string()
});

export type CryptoPurpose = z.infer<typeof cryptoPurposeSchema>;
export type CreatePaymentIntentRequest = z.infer<typeof createPaymentIntentSchema>;
export type AttachPaymentTransactionRequest = z.infer<typeof attachPaymentTransactionSchema>;
