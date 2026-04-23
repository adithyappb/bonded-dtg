import { createHash, randomBytes, randomUUID } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Hex } from "viem";
import type { AppEnv } from "../../config/env.js";
import type { SupabaseAdminClient } from "../../db/supabase-client.js";
import { assertSupabaseOk } from "../../db/supabase-client.js";
import type { AuthContext } from "../../http/auth-context.js";
import { ApiError } from "../../http/errors.js";
import { ChainClient, type EvmAddress } from "../../integrations/chain-client.js";
import { type AppUserRecord, type LinkedWalletRecord, WalletRepository } from "../wallet/wallet.repository.js";
import type { DevWalletLoginRequest, WalletChallengeRequest, WalletVerifyRequest } from "./auth.schemas.js";

type ChallengeRecord = {
  id: string;
  wallet_address: EvmAddress;
  address_lower: string;
  chain_id: number;
  nonce: string;
  message: string;
  expires_at: string;
  used_at: string | null;
};

type SessionJwtPayload = JwtPayload & {
  sid: string;
  sub: string;
  wid: string;
  address: EvmAddress;
  chainId: number;
};

type WalletSessionResponse = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    primaryWalletAddress: EvmAddress;
  };
  wallet: {
    id: string;
    address: EvmAddress;
    chainId: number;
  };
};

const sessionTtlSeconds = 60 * 60 * 24 * 7;
const challengeTtlMinutes = 10;

export class AuthService {
  private readonly wallets: WalletRepository;

  constructor(
    private readonly env: AppEnv,
    private readonly supabase: SupabaseAdminClient,
    private readonly chainClient: ChainClient
  ) {
    this.wallets = new WalletRepository(supabase);
  }

  async createWalletChallenge(input: WalletChallengeRequest) {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const address = this.chainClient.normalizeAddress(input.address);
    const nonce = randomBytes(16).toString("hex");
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + challengeTtlMinutes * 60 * 1000);
    const message = this.buildWalletSignInMessage({
      address,
      chainId,
      nonce,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    const { error } = await this.supabase.from("evm_auth_challenges").insert({
      wallet_address: address,
      address_lower: address.toLowerCase(),
      chain_id: chainId,
      nonce,
      message,
      expires_at: expiresAt.toISOString()
    });

    assertSupabaseOk(error, "create EVM wallet auth challenge");

    return {
      address,
      chainId,
      nonce,
      message,
      expiresAt: expiresAt.toISOString()
    };
  }

  async verifyWalletChallenge(input: WalletVerifyRequest): Promise<WalletSessionResponse> {
    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const address = this.chainClient.normalizeAddress(input.address);
    const challenge = await this.getChallenge(address, chainId, input.nonce);

    if (challenge.used_at) {
      throw new ApiError(409, "challenge_already_used", "This wallet challenge has already been used.");
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      throw new ApiError(409, "challenge_expired", "This wallet challenge has expired.");
    }

    const validSignature = await this.chainClient.verifyMessageSignature({
      address,
      message: challenge.message,
      signature: input.signature as Hex
    });

    if (!validSignature) {
      throw new ApiError(401, "invalid_wallet_signature", "Wallet signature did not match the issued challenge.");
    }

    const { user, wallet } = await this.wallets.getOrCreateUserForWallet(address, chainId);
    await this.markChallengeUsed(challenge.id);

    return this.issueWalletSession(user, wallet);
  }

  async devLoginWithWalletAddress(input: DevWalletLoginRequest): Promise<WalletSessionResponse> {
    if (!this.env.ENABLE_DEV_WALLET_AUTH || this.env.NODE_ENV === "production") {
      throw new ApiError(403, "dev_wallet_auth_disabled", "Development wallet address login is disabled.");
    }

    const chainId = this.chainClient.normalizeChainId(input.chainId);
    const address = this.chainClient.normalizeAddress(input.address);
    const { user, wallet } = await this.wallets.getOrCreateUserForWallet(address, chainId);

    return this.issueWalletSession(user, wallet);
  }

  async verifySessionToken(token: string): Promise<AuthContext> {
    let payload: SessionJwtPayload;

    try {
      payload = jwt.verify(token, this.env.API_JWT_SECRET, {
        issuer: "bonded-project-api",
        audience: "bonded-project-web"
      }) as SessionJwtPayload;
    } catch {
      throw new ApiError(401, "invalid_session", "Wallet session is missing, expired, or invalid.");
    }

    const { data, error } = await this.supabase
      .from("evm_auth_sessions")
      .select("*")
      .eq("id", payload.sid)
      .eq("token_hash", this.hashToken(token))
      .is("revoked_at", null)
      .maybeSingle();

    assertSupabaseOk(error, "verify EVM wallet auth session");

    if (!data || new Date(data.expires_at).getTime() < Date.now()) {
      throw new ApiError(401, "session_expired", "Wallet session is expired or revoked.");
    }

    const chainId = this.chainClient.normalizeChainId(payload.chainId);

    return {
      sessionId: payload.sid,
      userId: payload.sub,
      walletId: payload.wid,
      address: this.chainClient.normalizeAddress(payload.address),
      chainId
    };
  }

  async logout(token: string): Promise<void> {
    const auth = await this.verifySessionToken(token);
    const { error } = await this.supabase
      .from("evm_auth_sessions")
      .update({
        revoked_at: new Date().toISOString()
      })
      .eq("id", auth.sessionId);

    assertSupabaseOk(error, "revoke EVM wallet auth session");
  }

  private async issueWalletSession(user: AppUserRecord, wallet: LinkedWalletRecord): Promise<WalletSessionResponse> {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000).toISOString();
    const token = jwt.sign(
      {
        sid: sessionId,
        wid: wallet.id,
        address: wallet.address,
        chainId: wallet.chain_id
      },
      this.env.API_JWT_SECRET,
      {
        subject: user.id,
        expiresIn: sessionTtlSeconds,
        issuer: "bonded-project-api",
        audience: "bonded-project-web"
      }
    );

    const { error } = await this.supabase.from("evm_auth_sessions").insert({
      id: sessionId,
      user_id: user.id,
      wallet_id: wallet.id,
      token_hash: this.hashToken(token),
      expires_at: expiresAt
    });

    assertSupabaseOk(error, "create EVM wallet auth session");

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        primaryWalletAddress: user.primary_wallet_address
      },
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chain_id
      }
    };
  }

  private async getChallenge(address: EvmAddress, chainId: number, nonce: string): Promise<ChallengeRecord> {
    const { data, error } = await this.supabase
      .from("evm_auth_challenges")
      .select("*")
      .eq("address_lower", address.toLowerCase())
      .eq("chain_id", chainId)
      .eq("nonce", nonce)
      .maybeSingle();

    assertSupabaseOk(error, "load EVM wallet auth challenge");

    if (!data) {
      throw new ApiError(404, "challenge_not_found", "No matching wallet challenge was found.");
    }

    return data as ChallengeRecord;
  }

  private async markChallengeUsed(challengeId: string): Promise<void> {
    const { error } = await this.supabase
      .from("evm_auth_challenges")
      .update({
        used_at: new Date().toISOString()
      })
      .eq("id", challengeId);

    assertSupabaseOk(error, "mark EVM wallet auth challenge used");
  }

  private buildWalletSignInMessage(input: {
    address: EvmAddress;
    chainId: number;
    nonce: string;
    issuedAt: string;
    expiresAt: string;
  }): string {
    return [
      "RelationHack wants you to sign in with your Ethereum wallet:",
      input.address,
      "",
      "Only sign this message if you are trying to access RelationHack.",
      "",
      `URI: ${this.env.APP_ORIGIN}`,
      "Version: 1",
      `Chain ID: ${input.chainId}`,
      `Nonce: ${input.nonce}`,
      `Issued At: ${input.issuedAt}`,
      `Expiration Time: ${input.expiresAt}`
    ].join("\n");
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
