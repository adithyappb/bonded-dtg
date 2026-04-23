import { z } from "zod";

export const walletChallengeRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.coerce.number().int().positive().default(84532)
});

export const walletVerifyRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.coerce.number().int().positive().default(84532),
  nonce: z.string().min(16),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  signatureScheme: z.enum(["personal-sign"]).default("personal-sign")
});

export const devWalletLoginRequestSchema = z.object({
  address: z.string().min(1),
  chainId: z.coerce.number().int().positive().default(84532)
});

export type WalletChallengeRequest = z.infer<typeof walletChallengeRequestSchema>;
export type WalletVerifyRequest = z.infer<typeof walletVerifyRequestSchema>;
export type DevWalletLoginRequest = z.infer<typeof devWalletLoginRequestSchema>;
