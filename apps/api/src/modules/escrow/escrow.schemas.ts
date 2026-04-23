import { z } from "zod";

export const createEscrowIntentSchema = z.object({
  dateId: z.string().min(1),
  counterpartyAddress: z.string().min(1),
  chainId: z.coerce.number().int().positive().default(84532),
  amountWei: z.string().regex(/^[0-9]+$/)
});

export const escrowIntentParamsSchema = z.object({
  intentId: z.string().uuid()
});

export const attachEscrowTransactionSchema = z.object({
  chainId: z.coerce.number().int().positive().default(84532),
  hash: z.string()
});

export type CreateEscrowIntentRequest = z.infer<typeof createEscrowIntentSchema>;
export type AttachEscrowTransactionRequest = z.infer<typeof attachEscrowTransactionSchema>;
