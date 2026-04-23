import { z } from "zod";

export const nftCollectionTypeSchema = z.enum(["achievement_badge", "reputation_anchor", "relationship_agreement"]);

export const createNftMintIntentSchema = z.object({
  collectionType: nftCollectionTypeSchema.default("achievement_badge"),
  profileId: z.string().min(1),
  achievementId: z.string().min(1).optional(),
  chainId: z.coerce.number().int().positive().default(84532),
  recipientAddress: z.string().min(1).optional(),
  tokenUri: z.string().url(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export const nftMintIntentParamsSchema = z.object({
  intentId: z.string().uuid()
});

export const nftOwnershipParamsSchema = z.object({
  profileId: z.string().min(1)
});

export const attachNftMintTransactionSchema = z.object({
  chainId: z.coerce.number().int().positive().default(84532),
  hash: z.string(),
  tokenId: z.string().min(1).optional()
});

export type NftCollectionType = z.infer<typeof nftCollectionTypeSchema>;
export type CreateNftMintIntentRequest = z.infer<typeof createNftMintIntentSchema>;
export type AttachNftMintTransactionRequest = z.infer<typeof attachNftMintTransactionSchema>;
