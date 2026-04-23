import { formatEther } from "viem";
import type { AuthContext } from "../../http/auth-context.js";
import { ApiError } from "../../http/errors.js";
import type { ChainClient } from "../../integrations/chain-client.js";
import type { WalletRepository } from "../wallet/wallet.repository.js";
import type { AttachPaymentTransactionRequest, CreatePaymentIntentRequest } from "./crypto.schemas.js";
import type { CryptoRepository, PaymentIntentRecord } from "./crypto.repository.js";

export class CryptoService {
  constructor(
    private readonly crypto: CryptoRepository,
    private readonly wallets: WalletRepository,
    private readonly chainClient: ChainClient
  ) {}

  getConfig() {
    return {
      networks: this.chainClient.getSupportedChains(),
      paymentPurposes: [
        "premium_subscription",
        "profile_boost",
        "matchmaker_reward",
        "split_bill",
        "relationship_agreement",
        "date_stake",
        "generic_payment"
      ]
    };
  }

  async createPaymentIntent(auth: AuthContext, input: CreatePaymentIntentRequest) {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const wallet = await this.wallets.getPrimaryWallet(auth.userId);
    const toAddress = input.toAddress
      ? this.chainClient.normalizeAddress(input.toAddress)
      : this.chainClient.getEscrowAddress(chainId);
    const amount = BigInt(input.amountWei);

    if (!toAddress) {
      throw new ApiError(424, "payment_receiver_missing", `No receiver configured for chain ID ${chainId}.`);
    }

    if (amount <= 0n) {
      throw new ApiError(400, "invalid_payment_amount", "amountWei must be greater than zero.");
    }

    const intent = await this.crypto.createPaymentIntent({
      userId: auth.userId,
      walletId: wallet.id,
      purpose: input.purpose,
      relatedId: input.relatedId,
      chainId,
      fromAddress: wallet.address,
      toAddress,
      amountWei: input.amountWei,
      metadata: input.metadata
    });

    return {
      intent,
      paymentRequest: this.toPaymentRequest(intent)
    };
  }

  async getPaymentIntent(auth: AuthContext, intentId: string) {
    const intent = await this.crypto.getPaymentIntentForUser(intentId, auth.userId);

    if (!intent) {
      throw new ApiError(404, "payment_intent_not_found", "No matching payment intent was found.");
    }

    return {
      intent,
      paymentRequest: this.toPaymentRequest(intent)
    };
  }

  async attachTransaction(auth: AuthContext, intentId: string, input: AttachPaymentTransactionRequest) {
    const intent = await this.crypto.getPaymentIntentForUser(intentId, auth.userId);

    if (!intent) {
      throw new ApiError(404, "payment_intent_not_found", "No matching payment intent was found.");
    }

    const chainId = this.chainClient.normalizeChainId(input.chainId);

    if (chainId !== intent.chain_id) {
      throw new ApiError(400, "chain_mismatch", "Transaction chain does not match the payment intent.");
    }

    const hash = this.chainClient.normalizeTxHash(input.hash);
    const chainStatus = await this.chainClient.getTransactionStatus(chainId, hash);
    const status = chainStatus.status === "pending" ? "broadcast" : chainStatus.status;

    await this.wallets.recordTransaction({
      userId: auth.userId,
      walletId: auth.walletId,
      chainId,
      hash,
      purpose: intent.purpose,
      relatedId: intent.id,
      status: chainStatus.status
    });
    await this.wallets.updateTransactionStatus(chainStatus);

    const updatedIntent = await this.crypto.attachTransaction({
      intentId,
      userId: auth.userId,
      hash,
      status
    });

    return {
      intent: updatedIntent,
      chainStatus
    };
  }

  private toPaymentRequest(intent: PaymentIntentRecord) {
    const amount = BigInt(intent.amount_wei);

    return {
      chainId: intent.chain_id,
      fromAddress: intent.from_address,
      toAddress: intent.to_address,
      valueWei: intent.amount_wei,
      valueEther: formatEther(amount),
      currency: "ETH",
      label: `RelationHack ${intent.purpose.replaceAll("_", " ")}`,
      message: `Pay RelationHack intent ${intent.id}`
    };
  }
}
