import type { EvmAddress, EvmTxHash } from "../../integrations/chain-client.js";
import type { SupabaseAdminClient } from "../../db/supabase-client.js";
import { assertSupabaseOk } from "../../db/supabase-client.js";
import type { CryptoPurpose } from "./crypto.schemas.js";

export type PaymentIntentRecord = {
  id: string;
  user_id: string;
  wallet_id: string;
  purpose: CryptoPurpose;
  related_id: string | null;
  chain_id: number;
  from_address: EvmAddress;
  to_address: EvmAddress;
  amount_wei: string;
  currency: "ETH";
  status: "created" | "broadcast" | "confirmed" | "failed";
  tx_hash: EvmTxHash | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export class CryptoRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async createPaymentIntent(input: {
    userId: string;
    walletId: string;
    purpose: CryptoPurpose;
    relatedId?: string;
    chainId: number;
    fromAddress: EvmAddress;
    toAddress: EvmAddress;
    amountWei: string;
    metadata: Record<string, unknown>;
  }): Promise<PaymentIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_payment_intents")
      .insert({
        user_id: input.userId,
        wallet_id: input.walletId,
        purpose: input.purpose,
        related_id: input.relatedId ?? null,
        chain_id: input.chainId,
        from_address: input.fromAddress,
        to_address: input.toAddress,
        amount_wei: input.amountWei,
        metadata: input.metadata
      })
      .select("*")
      .single();

    assertSupabaseOk(error, "create EVM payment intent");
    return data as PaymentIntentRecord;
  }

  async getPaymentIntentForUser(intentId: string, userId: string): Promise<PaymentIntentRecord | null> {
    const { data, error } = await this.supabase
      .from("evm_payment_intents")
      .select("*")
      .eq("id", intentId)
      .eq("user_id", userId)
      .maybeSingle();

    assertSupabaseOk(error, "load EVM payment intent");
    return (data as PaymentIntentRecord | null) ?? null;
  }

  async attachTransaction(input: {
    intentId: string;
    userId: string;
    hash: EvmTxHash;
    status: PaymentIntentRecord["status"];
  }): Promise<PaymentIntentRecord> {
    const { data, error } = await this.supabase
      .from("evm_payment_intents")
      .update({
        tx_hash: input.hash,
        status: input.status,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.intentId)
      .eq("user_id", input.userId)
      .select("*")
      .single();

    assertSupabaseOk(error, "attach EVM payment transaction");
    return data as PaymentIntentRecord;
  }
}
