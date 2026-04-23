import { z } from "zod";

export const balanceQuerySchema = z.object({
  chainId: z.coerce.number().int().positive().default(84532)
});

export const displayPreferencesSchema = z.object({
  displayWalletValue: z.boolean(),
  balanceVisibility: z.enum(["hidden", "range", "exact"]).default("hidden")
});

export const recordTransactionSchema = z.object({
  chainId: z.coerce.number().int().positive().default(84532),
  hash: z.string(),
  purpose: z
    .enum([
      "wallet_auth",
      "date_stake_funding",
      "date_stake_claim",
      "matchmaker_escrow",
      "spark_reward_anchor",
      "achievement_anchor",
      "subscription_payment",
      "other"
    ])
    .default("other"),
  relatedId: z.string().uuid().optional()
});

export const transactionStatusParamsSchema = z.object({
  chainId: z.coerce.number().int().positive(),
  hash: z.string()
});

export type BalanceQuery = z.infer<typeof balanceQuerySchema>;
export type DisplayPreferencesRequest = z.infer<typeof displayPreferencesSchema>;
export type RecordTransactionRequest = z.infer<typeof recordTransactionSchema>;
