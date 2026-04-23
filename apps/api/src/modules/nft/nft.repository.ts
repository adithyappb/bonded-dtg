import type { EvmAddress, EvmTxHash } from "../../integrations/chain-client.js";
import type { SupabaseAdminClient } from "../../db/supabase-client.js";
import { assertSupabaseOk } from "../../db/supabase-client.js";
import type { NftCollectionType } from "./nft.schemas.js";

export type NftCollectionRecord = {
  id: string;
  chain_id: number;
  name: string;
  symbol: string;
  contract_address: EvmAddress | null;
  collection_type: NftCollectionType;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NftMintIntentRecord = {
  id: string;
  user_id: string;
  wallet_id: string;
  profile_id: string;
  achievement_id: string | null;
  chain_id: number;
  recipient_address: EvmAddress;
  contract_address: EvmAddress | null;
  token_uri: string;
  status: "created" | "broadcast" | "minted" | "failed";
  mint_hash: EvmTxHash | null;
  token_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export class NftRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async upsertCollection(input: {
    chainId: number;
    name: string;
    symbol: string;
    contractAddress?: EvmAddress;
    collectionType: NftCollectionType;
    metadata: Record<string, unknown>;
  }): Promise<NftCollectionRecord> {
    const { data, error } = await this.supabase
      .from("nft_collections")
      .upsert(
        {
          chain_id: input.chainId,
          name: input.name,
          symbol: input.symbol,
          contract_address: input.contractAddress ?? null,
          collection_type: input.collectionType,
          metadata: input.metadata
        },
        { onConflict: "chain_id,collection_type" }
      )
      .select("*")
      .single();

    assertSupabaseOk(error, "upsert NFT collection");
    return data as NftCollectionRecord;
  }

  async listCollections(): Promise<NftCollectionRecord[]> {
    const { data, error } = await this.supabase.from("nft_collections").select("*").order("created_at");

    assertSupabaseOk(error, "list NFT collections");
    return (data ?? []) as NftCollectionRecord[];
  }

  async createMintIntent(input: {
    userId: string;
    walletId: string;
    profileId: string;
    achievementId?: string;
    chainId: number;
    recipientAddress: EvmAddress;
    contractAddress?: EvmAddress;
    tokenUri: string;
    metadata: Record<string, unknown>;
  }): Promise<NftMintIntentRecord> {
    const { data, error } = await this.supabase
      .from("nft_mint_intents")
      .insert({
        user_id: input.userId,
        wallet_id: input.walletId,
        profile_id: input.profileId,
        achievement_id: input.achievementId ?? null,
        chain_id: input.chainId,
        recipient_address: input.recipientAddress,
        contract_address: input.contractAddress ?? null,
        token_uri: input.tokenUri,
        metadata: input.metadata
      })
      .select("*")
      .single();

    assertSupabaseOk(error, "create NFT mint intent");
    return data as NftMintIntentRecord;
  }

  async getMintIntentForUser(intentId: string, userId: string): Promise<NftMintIntentRecord | null> {
    const { data, error } = await this.supabase
      .from("nft_mint_intents")
      .select("*")
      .eq("id", intentId)
      .eq("user_id", userId)
      .maybeSingle();

    assertSupabaseOk(error, "load NFT mint intent");
    return (data as NftMintIntentRecord | null) ?? null;
  }

  async attachMintTransaction(input: {
    intentId: string;
    userId: string;
    hash: EvmTxHash;
    status: NftMintIntentRecord["status"];
    tokenId?: string;
  }): Promise<NftMintIntentRecord> {
    const { data, error } = await this.supabase
      .from("nft_mint_intents")
      .update({
        mint_hash: input.hash,
        status: input.status,
        token_id: input.tokenId ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.intentId)
      .eq("user_id", input.userId)
      .select("*")
      .single();

    assertSupabaseOk(error, "attach NFT mint transaction");
    return data as NftMintIntentRecord;
  }

  async recordOwnership(input: NftMintIntentRecord): Promise<void> {
    if (!input.contract_address || !input.token_id) {
      return;
    }

    const { error } = await this.supabase.from("nft_ownership_claims").upsert(
      {
        profile_id: input.profile_id,
        wallet_address: input.recipient_address,
        chain_id: input.chain_id,
        contract_address: input.contract_address,
        token_id: input.token_id,
        token_uri: input.token_uri,
        source_mint_intent_id: input.id,
        metadata: input.metadata
      },
      { onConflict: "chain_id,contract_address,token_id" }
    );

    assertSupabaseOk(error, "record NFT ownership claim");
  }

  async listOwnership(profileId: string) {
    const { data, error } = await this.supabase
      .from("nft_ownership_claims")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    assertSupabaseOk(error, "list NFT ownership claims");
    return data ?? [];
  }
}
