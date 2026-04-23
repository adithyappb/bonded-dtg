import type { AuthContext } from "../../http/auth-context.js";
import type { ChainClient, NativeBalance } from "../../integrations/chain-client.js";
import type { BalanceQuery, DisplayPreferencesRequest, RecordTransactionRequest } from "./wallet.schemas.js";
import { WalletRepository } from "./wallet.repository.js";

export class WalletService {
  constructor(
    private readonly wallets: WalletRepository,
    private readonly chainClient: ChainClient
  ) {}

  async getCurrentWalletProfile(auth: AuthContext) {
    const wallets = await this.wallets.listWallets(auth.userId);

    return {
      userId: auth.userId,
      activeWallet: {
        id: auth.walletId,
        address: auth.address,
        chainId: auth.chainId
      },
      linkedWallets: wallets.map((wallet) => ({
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chain_id,
        isPrimary: wallet.is_primary,
        displayWalletValue: wallet.display_wallet_value,
        balanceVisibility: wallet.balance_visibility
      }))
    };
  }

  async updateDisplayPreferences(auth: AuthContext, input: DisplayPreferencesRequest) {
    const wallet = await this.wallets.updateDisplayPreferences(
      auth.userId,
      input.displayWalletValue,
      input.balanceVisibility
    );

    return {
      walletId: wallet.id,
      address: wallet.address,
      chainId: wallet.chain_id,
      displayWalletValue: wallet.display_wallet_value,
      balanceVisibility: wallet.balance_visibility
    };
  }

  async getBalance(auth: AuthContext, query: BalanceQuery): Promise<NativeBalance & { persistedSnapshot: boolean }> {
    const chainId = this.chainClient.normalizeChainId(query.chainId);
    const wallet = await this.wallets.getPrimaryWallet(auth.userId);
    const address = this.chainClient.normalizeAddress(wallet.address);
    const balance = await this.chainClient.getNativeBalance(chainId, address);

    let persistedSnapshot = false;

    if (wallet.display_wallet_value) {
      await this.wallets.insertBalanceSnapshot({
        userId: auth.userId,
        walletId: wallet.id,
        address,
        chainId,
        wei: balance.wei,
        ether: balance.ether,
        symbol: balance.symbol
      });
      persistedSnapshot = true;
    }

    return {
      ...balance,
      persistedSnapshot
    };
  }

  async recordTransaction(auth: AuthContext, input: RecordTransactionRequest) {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const hash = this.chainClient.normalizeTxHash(input.hash);
    const wallet = await this.wallets.getPrimaryWallet(auth.userId);
    const chainStatus = await this.chainClient.getTransactionStatus(chainId, hash);

    const recorded = await this.wallets.recordTransaction({
      userId: auth.userId,
      walletId: wallet.id,
      chainId,
      hash,
      purpose: input.purpose,
      relatedId: input.relatedId,
      status: chainStatus.status
    });

    await this.wallets.updateTransactionStatus(chainStatus);

    return {
      transaction: recorded,
      chainStatus
    };
  }

  async getTransactionStatus(chainIdInput: number, hashInput: string) {
    const chainId = this.chainClient.normalizeChainId(chainIdInput);
    const hash = this.chainClient.normalizeTxHash(hashInput);
    const status = await this.chainClient.getTransactionStatus(chainId, hash);

    await this.wallets.updateTransactionStatus(status);
    return status;
  }
}
