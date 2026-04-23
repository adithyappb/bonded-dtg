import { encodeFunctionData, type Abi } from "viem";
import type { AuthContext } from "../../http/auth-context.js";
import { ApiError } from "../../http/errors.js";
import type { ChainClient, EvmAddress } from "../../integrations/chain-client.js";
import type { WalletRepository } from "../wallet/wallet.repository.js";
import type { AttachNftMintTransactionRequest, CreateNftMintIntentRequest, NftCollectionType } from "./nft.schemas.js";
import type { NftMintIntentRecord, NftRepository } from "./nft.repository.js";

const mintAbi = [
  {
    type: "function",
    name: "safeMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "uri", type: "string" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }]
  }
] as const satisfies Abi;

export class NftService {
  constructor(
    private readonly nft: NftRepository,
    private readonly wallets: WalletRepository,
    private readonly chainClient: ChainClient
  ) {}

  async listCollections() {
    await this.ensureDefaultCollections();
    return {
      collections: await this.nft.listCollections()
    };
  }

  async createMintIntent(auth: AuthContext, input: CreateNftMintIntentRequest) {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const wallet = await this.wallets.getPrimaryWallet(auth.userId);
    const recipientAddress = input.recipientAddress
      ? this.chainClient.normalizeAddress(input.recipientAddress)
      : wallet.address;
    const contractAddress = this.getCollectionAddress(chainId, input.collectionType);
    const intent = await this.nft.createMintIntent({
      userId: auth.userId,
      walletId: wallet.id,
      profileId: input.profileId,
      achievementId: input.achievementId,
      chainId,
      recipientAddress,
      contractAddress,
      tokenUri: input.tokenUri,
      metadata: {
        collectionType: input.collectionType,
        ...input.metadata
      }
    });

    return {
      intent,
      mintRequest: this.toMintRequest(intent)
    };
  }

  async getMintIntent(auth: AuthContext, intentId: string) {
    const intent = await this.nft.getMintIntentForUser(intentId, auth.userId);

    if (!intent) {
      throw new ApiError(404, "nft_mint_intent_not_found", "No matching NFT mint intent was found.");
    }

    return {
      intent,
      mintRequest: this.toMintRequest(intent)
    };
  }

  async attachMintTransaction(auth: AuthContext, intentId: string, input: AttachNftMintTransactionRequest) {
    const intent = await this.nft.getMintIntentForUser(intentId, auth.userId);

    if (!intent) {
      throw new ApiError(404, "nft_mint_intent_not_found", "No matching NFT mint intent was found.");
    }

    const chainId = this.chainClient.normalizeChainId(input.chainId);

    if (chainId !== intent.chain_id) {
      throw new ApiError(400, "chain_mismatch", "Transaction chain does not match the NFT mint intent.");
    }

    const hash = this.chainClient.normalizeTxHash(input.hash);
    const chainStatus = await this.chainClient.getTransactionStatus(chainId, hash);
    const status = chainStatus.status === "confirmed" ? "minted" : chainStatus.status === "failed" ? "failed" : "broadcast";
    const updatedIntent = await this.nft.attachMintTransaction({
      intentId,
      userId: auth.userId,
      hash,
      status,
      tokenId: input.tokenId
    });

    await this.wallets.recordTransaction({
      userId: auth.userId,
      walletId: auth.walletId,
      chainId,
      hash,
      purpose: "nft_mint",
      relatedId: intent.id,
      status: chainStatus.status
    });
    await this.wallets.updateTransactionStatus(chainStatus);

    if (status === "minted") {
      await this.nft.recordOwnership(updatedIntent);
    }

    return {
      intent: updatedIntent,
      chainStatus
    };
  }

  async listOwnership(profileId: string) {
    return {
      profileId,
      tokens: await this.nft.listOwnership(profileId)
    };
  }

  private async ensureDefaultCollections() {
    await Promise.all(
      this.chainClient.getSupportedChains().map((chain) =>
        Promise.all([
          this.upsertDefaultCollection(chain.chainId, "achievement_badge"),
          this.upsertDefaultCollection(chain.chainId, "reputation_anchor"),
          this.upsertDefaultCollection(chain.chainId, "relationship_agreement")
        ])
      )
    );
  }

  private upsertDefaultCollection(chainId: number, collectionType: NftCollectionType) {
    const names = {
      achievement_badge: ["RelationHack Achievement Badges", "RHAB"],
      reputation_anchor: ["RelationHack Reputation Anchors", "RHRA"],
      relationship_agreement: ["RelationHack Relationship Agreements", "RHRAA"]
    } as const;
    const [name, symbol] = names[collectionType];

    return this.nft.upsertCollection({
      chainId,
      name,
      symbol,
      collectionType,
      contractAddress: this.getCollectionAddress(chainId, collectionType),
      metadata: { app: "RelationHack", collectionType }
    });
  }

  private toMintRequest(intent: NftMintIntentRecord) {
    if (!intent.contract_address) {
      return {
        chainId: intent.chain_id,
        ready: false,
        reason: "NFT contract address is not configured for this chain.",
        recipientAddress: intent.recipient_address,
        tokenUri: intent.token_uri
      };
    }

    return {
      chainId: intent.chain_id,
      ready: true,
      toAddress: intent.contract_address,
      valueWei: "0",
      data: encodeFunctionData({
        abi: mintAbi,
        functionName: "safeMint",
        args: [intent.recipient_address, intent.token_uri]
      }),
      recipientAddress: intent.recipient_address,
      tokenUri: intent.token_uri
    };
  }

  private getCollectionAddress(chainId: number, collectionType: NftCollectionType): EvmAddress | undefined {
    const scoped = process.env[`CHAIN_${chainId}_${collectionType.toUpperCase()}_NFT_ADDRESS`];
    const generic = process.env[`CHAIN_${chainId}_NFT_CONTRACT_ADDRESS`] ?? process.env.NFT_CONTRACT_ADDRESS;
    const configured = scoped ?? generic;

    return configured ? this.chainClient.normalizeAddress(configured) : undefined;
  }
}
