import type { ApiWalletSession } from "@/lib/injected-evm-wallet";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type ApiChain = {
  chainId: number;
  name: string;
  nativeCurrency: string;
  explorerUrl: string;
  rpcConfigured: boolean;
  escrowAddress?: string;
};

export type DevLoginResponse = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    primaryWalletAddress: string;
  };
  wallet: {
    id: string;
    address: string;
    chainId: number;
  };
};

export type WalletChallengeResponse = {
  address: string;
  chainId: number;
  nonce: string;
  message: string;
  expiresAt: string;
};

export type WalletProfileResponse = {
  userId: string;
  activeWallet: {
    id: string;
    address: string;
    chainId: number;
  };
  linkedWallets: Array<{
    id: string;
    address: string;
    chainId: number;
    isPrimary: boolean;
    displayWalletValue: boolean;
    balanceVisibility: "hidden" | "range" | "exact";
  }>;
};

export type BalanceResponse = {
  chainId: number;
  address: string;
  wei: string;
  ether: string;
  symbol: string;
  persistedSnapshot: boolean;
};

export type StakingConfigResponse = {
  networks: Array<{
    chainId: number;
    label: string;
    explorerUrl: string;
    rpcConfigured: boolean;
    escrowAddress?: string;
    readyForEscrow: boolean;
  }>;
};

export type PaymentIntentResponse = {
  intent: {
    id: string;
    purpose: string;
    chain_id: number;
    from_address: string;
    to_address: string;
    amount_wei: string;
    status: string;
    tx_hash: string | null;
  };
  paymentRequest: {
    chainId: number;
    fromAddress: string;
    toAddress: string;
    valueWei: string;
    valueEther: string;
    currency: "ETH";
    label: string;
    message: string;
  };
};

export type NftMintIntentResponse = {
  intent: {
    id: string;
    chain_id: number;
    recipient_address: string;
    contract_address: string | null;
    token_uri: string;
    status: string;
    mint_hash: string | null;
  };
  mintRequest: {
    chainId: number;
    ready: boolean;
    reason?: string;
    toAddress?: string;
    valueWei?: string;
    data?: string;
    recipientAddress: string;
    tokenUri: string;
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
    throw new ApiClientError(
      payload?.error?.message ?? `Request failed with ${response.status}.`,
      response.status,
      payload?.error?.code,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function authHeaders(session: ApiWalletSession): HeadersInit {
  return {
    Authorization: `Bearer ${session.token}`,
  };
}

export const apiClient = {
  createWalletChallenge(address: string, chainId: number) {
    return request<WalletChallengeResponse>("/v1/auth/wallet/challenge", {
      method: "POST",
      body: JSON.stringify({ address, chainId }),
    });
  },
  verifyWalletSignature(input: { address: string; chainId: number; nonce: string; signature: string }) {
    return request<DevLoginResponse>("/v1/auth/wallet/verify", {
      method: "POST",
      body: JSON.stringify({ ...input, signatureScheme: "personal-sign" }),
    });
  },
  devLogin(address: string, chainId: number) {
    return request<DevLoginResponse>("/v1/auth/wallet/dev-login", {
      method: "POST",
      body: JSON.stringify({ address, chainId }),
    });
  },
  chains() {
    return request<{ networks: ApiChain[] }>("/v1/chain/networks");
  },
  wallet(session: ApiWalletSession) {
    return request<WalletProfileResponse>("/v1/wallet/me", {
      headers: authHeaders(session),
    });
  },
  balance(session: ApiWalletSession, chainId: number) {
    return request<BalanceResponse>(`/v1/wallet/balance?chainId=${chainId}`, {
      headers: authHeaders(session),
    });
  },
  stakingConfig() {
    return request<StakingConfigResponse>("/v1/staking/config");
  },
  createPaymentIntent(
    session: ApiWalletSession,
    input: {
      purpose: string;
      relatedId?: string;
      chainId: number;
      toAddress?: string;
      amountWei: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return request<PaymentIntentResponse>("/v1/crypto/payment-intents", {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(input),
    });
  },
  attachPaymentTransaction(session: ApiWalletSession, intentId: string, input: { chainId: number; hash: string }) {
    return request(`/v1/crypto/payment-intents/${intentId}/transactions`, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(input),
    });
  },
  nftCollections() {
    return request("/v1/nft/collections");
  },
  createNftMintIntent(
    session: ApiWalletSession,
    input: {
      collectionType: "achievement_badge" | "reputation_anchor" | "relationship_agreement";
      profileId: string;
      achievementId?: string;
      chainId: number;
      recipientAddress?: string;
      tokenUri: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return request<NftMintIntentResponse>("/v1/nft/mint-intents", {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(input),
    });
  },
  attachNftMintTransaction(
    session: ApiWalletSession,
    intentId: string,
    input: { chainId: number; hash: string; tokenId?: string },
  ) {
    return request(`/v1/nft/mint-intents/${intentId}/transactions`, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(input),
    });
  },
};
