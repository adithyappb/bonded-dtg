import {
  createPublicClient,
  formatEther,
  getAddress,
  http,
  isAddress,
  isHash,
  verifyMessage,
  type Address,
  type Chain,
  type Hex
} from "viem";
import { arbitrum, base, baseSepolia, foundry, mainnet, optimism, polygon, sepolia } from "viem/chains";
import type { AppEnv } from "../config/env.js";
import { ApiError } from "../http/errors.js";

export type EvmAddress = Address;
export type EvmTxHash = Hex;

export type ChainDetails = {
  chainId: number;
  name: string;
  nativeCurrency: string;
  explorerUrl: string;
  rpcConfigured: boolean;
  escrowAddress?: EvmAddress;
};

export type NativeBalance = {
  chainId: number;
  address: EvmAddress;
  wei: string;
  ether: string;
  symbol: string;
};

export type TransactionStatus = {
  chainId: number;
  hash: EvmTxHash;
  status: "pending" | "confirmed" | "failed";
  confirmed: boolean;
  blockNumber?: string;
  transactionIndex?: number;
};

const knownChains: Chain[] = [mainnet, sepolia, base, baseSepolia, optimism, polygon, arbitrum, foundry];

export class ChainClient {
  private readonly clients = new Map<number, ReturnType<typeof createPublicClient>>();

  constructor(private readonly env: AppEnv) {}

  getSupportedChains(): ChainDetails[] {
    return this.env.SUPPORTED_CHAIN_ID_LIST.map((chainId) => {
      const chain = this.getChain(chainId);

      return {
        chainId,
        name: chain.name,
        nativeCurrency: chain.nativeCurrency.symbol,
        explorerUrl: chain.blockExplorers?.default.url ?? "",
        rpcConfigured: Boolean(this.rpcUrlFor(chainId)),
        escrowAddress: this.getEscrowAddress(chainId)
      };
    });
  }

  normalizeChainId(chainId: number): number {
    if (!Number.isInteger(chainId) || chainId <= 0) {
      throw new ApiError(400, "invalid_chain_id", "Expected a positive EVM chain ID.");
    }

    this.assertSupportedChain(chainId);
    return chainId;
  }

  normalizeAddress(address: string): EvmAddress {
    if (!isAddress(address)) {
      throw new ApiError(400, "invalid_wallet_address", "Expected a valid EVM wallet address.");
    }

    return getAddress(address);
  }

  normalizeTxHash(hash: string): EvmTxHash {
    if (!isHash(hash)) {
      throw new ApiError(400, "invalid_transaction_hash", "Expected a 32-byte EVM transaction hash.");
    }

    return hash as EvmTxHash;
  }

  async verifyMessageSignature(input: {
    address: EvmAddress;
    message: string;
    signature: Hex;
  }): Promise<boolean> {
    try {
      return await verifyMessage({
        address: input.address,
        message: input.message,
        signature: input.signature
      });
    } catch {
      return false;
    }
  }

  async getNativeBalance(chainId: number, address: EvmAddress): Promise<NativeBalance> {
    const chain = this.getChain(chainId);
    const client = this.getPublicClient(chainId);
    const wei = await client.getBalance({ address });

    return {
      chainId,
      address,
      wei: wei.toString(),
      ether: formatEther(wei),
      symbol: chain.nativeCurrency.symbol
    };
  }

  async getTransactionStatus(chainId: number, hash: EvmTxHash): Promise<TransactionStatus> {
    const client = this.getPublicClient(chainId);

    try {
      const receipt = await client.getTransactionReceipt({ hash });

      return {
        chainId,
        hash,
        status: receipt.status === "success" ? "confirmed" : "failed",
        confirmed: receipt.status === "success",
        blockNumber: receipt.blockNumber.toString(),
        transactionIndex: receipt.transactionIndex
      };
    } catch {
      return {
        chainId,
        hash,
        status: "pending",
        confirmed: false
      };
    }
  }

  getEscrowAddress(chainId: number): EvmAddress | undefined {
    const configured = process.env[`CHAIN_${chainId}_ESCROW_ADDRESS`] ?? this.env.ESCROW_ADDRESS;

    if (!configured) {
      return undefined;
    }

    return this.normalizeAddress(configured);
  }

  private assertSupportedChain(chainId: number): void {
    if (!this.env.SUPPORTED_CHAIN_ID_LIST.includes(chainId)) {
      throw new ApiError(400, "unsupported_chain", `Chain ID ${chainId} is not enabled for RelationHack.`);
    }
  }

  private getPublicClient(chainId: number) {
    const existingClient = this.clients.get(chainId);

    if (existingClient) {
      return existingClient;
    }

    const chain = this.getChain(chainId);
    const rpcUrl = this.rpcUrlFor(chainId);

    if (!rpcUrl) {
      throw new ApiError(424, "rpc_not_configured", `No RPC URL configured for chain ID ${chainId}.`);
    }

    const client = createPublicClient({
      chain,
      transport: http(rpcUrl)
    });

    this.clients.set(chainId, client);
    return client;
  }

  private getChain(chainId: number): Chain {
    const chain = knownChains.find((candidate) => candidate.id === chainId);

    if (!chain) {
      throw new ApiError(400, "unknown_chain", `Chain ID ${chainId} is not known by the backend chain registry.`);
    }

    return chain;
  }

  private rpcUrlFor(chainId: number): string {
    return process.env[`CHAIN_${chainId}_RPC_URL`] ?? this.env.CHAIN_RPC_URL;
  }
}
