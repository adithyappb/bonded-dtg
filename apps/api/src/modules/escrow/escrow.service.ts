import { randomUUID } from "node:crypto";
import { formatEther } from "viem";
import type { AuthContext } from "../../http/auth-context.js";
import { ApiError } from "../../http/errors.js";
import type { ChainClient } from "../../integrations/chain-client.js";
import { WalletRepository } from "../wallet/wallet.repository.js";
import type { AttachEscrowTransactionRequest, CreateEscrowIntentRequest } from "./escrow.schemas.js";
import { EscrowRepository } from "./escrow.repository.js";

export class EscrowService {
  constructor(
    private readonly escrow: EscrowRepository,
    private readonly wallets: WalletRepository,
    private readonly chainClient: ChainClient
  ) {}

  getEscrowConfig() {
    return {
      networks: this.chainClient.getSupportedChains().map((chain) => ({
        chainId: chain.chainId,
        label: chain.name,
        explorerUrl: chain.explorerUrl,
        rpcConfigured: chain.rpcConfigured,
        escrowAddress: chain.escrowAddress,
        readyForEscrow: Boolean(chain.escrowAddress && chain.rpcConfigured)
      }))
    };
  }

  async createIntent(auth: AuthContext, input: CreateEscrowIntentRequest) {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const escrowAddress = this.chainClient.getEscrowAddress(chainId);

    if (!escrowAddress) {
      throw new ApiError(424, "escrow_address_missing", `Escrow address is not configured for chain ID ${chainId}.`);
    }

    const wallet = await this.wallets.getPrimaryWallet(auth.userId);
    const counterparty = this.chainClient.normalizeAddress(input.counterpartyAddress);
    const amount = BigInt(input.amountWei);

    if (amount <= 0n) {
      throw new ApiError(400, "invalid_escrow_amount", "amountWei must be greater than zero.");
    }

    const intent = await this.escrow.createIntent({
      id: randomUUID(),
      userId: auth.userId,
      walletId: wallet.id,
      dateId: input.dateId,
      counterpartyAddress: counterparty,
      chainId,
      amountWei: input.amountWei,
      escrowAddress
    });

    return {
      intent,
      paymentRequest: {
        chainId,
        toAddress: escrowAddress,
        valueWei: input.amountWei,
        valueEther: formatEther(amount),
        label: "RelationHack date stake",
        message: `Fund date stake intent ${intent.id}`
      },
      notes: [
        "The backend does not custody private keys; the connected wallet must create and broadcast the transaction.",
        "Submit the funding transaction hash back to the intent transaction endpoint after broadcast."
      ]
    };
  }

  async attachTransaction(auth: AuthContext, intentId: string, input: AttachEscrowTransactionRequest) {
    const intent = await this.escrow.getIntentForUser(intentId, auth.userId);
    const chainId = this.chainClient.normalizeChainId(input.chainId);

    if (intent.chain_id !== chainId) {
      throw new ApiError(400, "chain_mismatch", "Transaction chain does not match the escrow intent.");
    }

    const hash = this.chainClient.normalizeTxHash(input.hash);
    const status = await this.chainClient.getTransactionStatus(chainId, hash);
    const nextIntentStatus = this.toIntentStatus(status.status);

    await this.wallets.recordTransaction({
      userId: auth.userId,
      walletId: auth.walletId,
      chainId,
      hash,
      purpose: "date_stake_funding",
      relatedId: intent.id,
      status: status.status
    });
    await this.wallets.updateTransactionStatus(status);

    const updatedIntent = await this.escrow.attachTransaction({
      intentId,
      userId: auth.userId,
      hash,
      status: nextIntentStatus
    });

    return {
      intent: updatedIntent,
      chainStatus: status
    };
  }

  async getIntentStatus(auth: AuthContext, intentId: string) {
    const intent = await this.escrow.getIntentForUser(intentId, auth.userId);

    if (!intent.funding_hash) {
      return {
        intent,
        chainStatus: null
      };
    }

    const chainStatus = await this.chainClient.getTransactionStatus(intent.chain_id, intent.funding_hash);
    const updatedIntent = await this.escrow.updateStatus({
      intentId,
      userId: auth.userId,
      status: this.toIntentStatus(chainStatus.status)
    });
    await this.wallets.updateTransactionStatus(chainStatus);

    return {
      intent: updatedIntent,
      chainStatus
    };
  }

  private toIntentStatus(status: "pending" | "confirmed" | "failed"): "pending" | "funded" | "failed" {
    if (status === "confirmed") {
      return "funded";
    }

    return status;
  }
}
