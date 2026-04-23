import type { SupabaseAdminClient } from "../../db/supabase-client.js";
import { assertSupabaseOk } from "../../db/supabase-client.js";
import { ApiError } from "../../http/errors.js";
import type { EvmAddress, EvmTxHash } from "../../integrations/chain-client.js";

export type EscrowIntentRecord = {
  id: string;
  user_id: string;
  wallet_id: string;
  date_id: string;
  counterparty_address: EvmAddress;
  counterparty_address_lower: string;
  chain_id: number;
  amount_wei: string;
  escrow_address: EvmAddress;
  status: "created" | "submitted" | "pending" | "funded" | "failed";
  funding_hash: EvmTxHash | null;
  created_at: string;
  updated_at: string;
};

export class EscrowRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createIntent(input: {
    id: string;
    userId: string;
    walletId: string;
    dateId: string;
    counterpartyAddress: EvmAddress;
    chainId: number;
    amountWei: string;
    escrowAddress: EvmAddress;
  }): Promise<EscrowIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_escrow_intents")
      .insert({
        id: input.id,
        user_id: input.userId,
        wallet_id: input.walletId,
        date_id: input.dateId,
        counterparty_address: input.counterpartyAddress,
        counterparty_address_lower: input.counterpartyAddress.toLowerCase(),
        chain_id: input.chainId,
        amount_wei: input.amountWei,
        escrow_address: input.escrowAddress,
        escrow_address_lower: input.escrowAddress.toLowerCase(),
        status: "created"
      })
      .select("*")
      .single();

    assertSupabaseOk(error, "create EVM escrow intent");
    return data as EscrowIntentRecord;
  }

  async getIntentForUser(intentId: string, userId: string): Promise<EscrowIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_escrow_intents")
      .select("*")
      .eq("id", intentId)
      .eq("user_id", userId)
      .maybeSingle();

    assertSupabaseOk(error, "get EVM escrow intent");

    if (!data) {
      throw new ApiError(404, "escrow_intent_not_found", "No EVM escrow intent exists for this wallet session.");
    }

    return data as EscrowIntentRecord;
  }

  async attachTransaction(input: {
    intentId: string;
    userId: string;
    hash: EvmTxHash;
    status: "submitted" | "pending" | "funded" | "failed";
  }): Promise<EscrowIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_escrow_intents")
      .update({
        funding_hash: input.hash,
        funding_hash_lower: input.hash.toLowerCase(),
        status: input.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.intentId)
      .eq("user_id", input.userId)
      .select("*")
      .maybeSingle();

    assertSupabaseOk(error, "attach EVM escrow transaction");

    if (!data) {
      throw new ApiError(404, "escrow_intent_not_found", "No EVM escrow intent exists for this wallet session.");
    }

    return data as EscrowIntentRecord;
  }

  async updateStatus(input: {
    intentId: string;
    userId: string;
    status: "created" | "submitted" | "pending" | "funded" | "failed";
  }): Promise<EscrowIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_escrow_intents")
      .update({
        status: input.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.intentId)
      .eq("user_id", input.userId)
      .select("*")
      .maybeSingle();

    assertSupabaseOk(error, "update EVM escrow intent status");

    if (!data) {
      throw new ApiError(404, "escrow_intent_not_found", "No EVM escrow intent exists for this wallet session.");
    }

    return data as EscrowIntentRecord;
  }
}
