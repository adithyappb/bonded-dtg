import type { SupabaseAdminClient } from "../../db/supabase-client.js";
import { assertSupabaseOk } from "../../db/supabase-client.js";
import { ApiError } from "../../http/errors.js";
import type { EvmAddress, EvmTxHash, TransactionStatus } from "../../integrations/chain-client.js";

export type LinkedWalletRecord = {
  id: string;
  user_id: string;
  address: EvmAddress;
  address_lower: string;
  chain_id: number;
  is_primary: boolean;
  display_wallet_value: boolean;
  balance_visibility: "hidden" | "range" | "exact";
  created_at: string;
  updated_at: string;
};

export type AppUserRecord = {
  id: string;
  primary_wallet_address: EvmAddress;
  created_at: string;
  updated_at: string;
};

export type UserWalletPair = {
  user: AppUserRecord;
  wallet: LinkedWalletRecord;
};

export class WalletRepository {
  constructor(private readonly supabase: SupabaseAdminClient) {}

  async findWalletByAddress(address: EvmAddress, chainId: number): Promise<LinkedWalletRecord | null> {
    const { data, error } = await this.supabase
      .from("evm_wallets")
      .select("*")
      .eq("address_lower", address.toLowerCase())
      .eq("chain_id", chainId)
      .maybeSingle();

    assertSupabaseOk(error, "find EVM wallet by address");
    return data as LinkedWalletRecord | null;
  }

  async getPrimaryWallet(userId: string): Promise<LinkedWalletRecord> {
    const { data, error } = await this.supabase
      .from("evm_wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();

    assertSupabaseOk(error, "get primary EVM wallet");

    if (!data) {
      throw new ApiError(404, "wallet_not_found", "No primary EVM wallet is linked to this account.");
    }

    return data as LinkedWalletRecord;
  }

  async listWallets(userId: string): Promise<LinkedWalletRecord[]> {
    const { data, error } = await this.supabase
      .from("evm_wallets")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    assertSupabaseOk(error, "list linked EVM wallets");
    return (data ?? []) as LinkedWalletRecord[];
  }

  async getOrCreateUserForWallet(address: EvmAddress, chainId: number): Promise<UserWalletPair> {
    const existingWallet = await this.findWalletByAddress(address, chainId);

    if (existingWallet) {
      const user = await this.getUser(existingWallet.user_id);
      return { user, wallet: existingWallet };
    }

    const { data: user, error: userError } = await this.supabase
      .from("app_users")
      .insert({
        primary_wallet_address: address
      })
      .select("*")
      .single();

    assertSupabaseOk(userError, "create EVM wallet user");

    const { data: wallet, error: walletError } = await this.supabase
      .from("evm_wallets")
      .insert({
        user_id: user.id,
        address,
        address_lower: address.toLowerCase(),
        chain_id: chainId,
        is_primary: true,
        display_wallet_value: false,
        balance_visibility: "hidden"
      })
      .select("*")
      .single();

    assertSupabaseOk(walletError, "create linked EVM wallet");

    return {
      user: user as AppUserRecord,
      wallet: wallet as LinkedWalletRecord
    };
  }

  async updateDisplayPreferences(
    userId: string,
    displayWalletValue: boolean,
    balanceVisibility: "hidden" | "range" | "exact"
  ): Promise<LinkedWalletRecord> {
    const wallet = await this.getPrimaryWallet(userId);
    const { data, error } = await this.supabase
      .from("evm_wallets")
      .update({
        display_wallet_value: displayWalletValue,
        balance_visibility: displayWalletValue ? balanceVisibility : "hidden",
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id)
      .select("*")
      .single();

    assertSupabaseOk(error, "update EVM wallet display preferences");
    return data as LinkedWalletRecord;
  }

  async insertBalanceSnapshot(input: {
    userId: string;
    walletId: string;
    address: EvmAddress;
    chainId: number;
    wei: string;
    ether: string;
    symbol: string;
  }): Promise<void> {
    const { error } = await this.supabase.from("evm_balance_snapshots").insert({
      user_id: input.userId,
      wallet_id: input.walletId,
      address: input.address,
      address_lower: input.address.toLowerCase(),
      chain_id: input.chainId,
      wei: input.wei,
      ether: input.ether,
      symbol: input.symbol
    });

    assertSupabaseOk(error, "insert EVM balance snapshot");
  }

  async recordTransaction(input: {
    userId: string;
    walletId: string;
    chainId: number;
    hash: EvmTxHash;
    purpose: string;
    relatedId?: string;
    status: "submitted" | "pending" | "confirmed" | "failed";
  }) {
    const { data, error } = await this.supabase
      .from("evm_transactions")
      .upsert(
        {
          user_id: input.userId,
          wallet_id: input.walletId,
          chain_id: input.chainId,
          hash: input.hash,
          hash_lower: input.hash.toLowerCase(),
          purpose: input.purpose,
          related_id: input.relatedId,
          status: input.status,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: "chain_id,hash_lower" }
      )
      .select("*")
      .single();

    assertSupabaseOk(error, "record EVM transaction");
    return data;
  }

  async updateTransactionStatus(input: TransactionStatus) {
    const { data, error } = await this.supabase
      .from("evm_transactions")
      .update({
        status: input.status,
        block_number: input.blockNumber,
        transaction_index: input.transactionIndex,
        confirmed_at: input.status === "confirmed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("chain_id", input.chainId)
      .eq("hash_lower", input.hash.toLowerCase())
      .select("*")
      .maybeSingle();

    assertSupabaseOk(error, "update EVM transaction status");
    return data;
  }

  private async getUser(userId: string): Promise<AppUserRecord> {
    const { data, error } = await this.supabase.from("app_users").select("*").eq("id", userId).single();

    assertSupabaseOk(error, "get user by EVM wallet");
    return data as AppUserRecord;
  }
}
