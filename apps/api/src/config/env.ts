import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const envDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(envDir, "../../../../.env") });
dotenv.config();

const booleanEnv = z
  .enum(["true", "false", "1", "0", "yes", "no", "on", "off"])
  .default("false")
  .transform((value) => ["true", "1", "yes", "on"].includes(value));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  API_JWT_SECRET: z.string().min(16).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPPORTED_CHAIN_IDS: z.string().default("84532,8453,11155111,1,31337"),
  CHAIN_RPC_URL: z.string().url().default("https://sepolia.base.org"),
  ESCROW_ADDRESS: z.string().optional(),
  ENABLE_DEV_WALLET_AUTH: booleanEnv
});

export type AppEnv = z.infer<typeof envSchema> & {
  SUPABASE_URL: string;
  API_JWT_SECRET: string;
  SUPPORTED_CHAIN_ID_LIST: number[];
};

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(process.env);
  const supabaseUrl =
    parsed.SUPABASE_URL ??
    (parsed.SUPABASE_PROJECT_ID ? `https://${parsed.SUPABASE_PROJECT_ID}.supabase.co` : undefined);

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL or SUPABASE_PROJECT_ID is required for Ethereum wallet backend storage.");
  }

  const supportedChainIds = parsed.SUPPORTED_CHAIN_IDS.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (supportedChainIds.length === 0) {
    throw new Error("SUPPORTED_CHAIN_IDS must contain at least one EVM chain ID.");
  }

  cachedEnv = {
    ...parsed,
    SUPABASE_URL: supabaseUrl,
    API_JWT_SECRET: parsed.API_JWT_SECRET ?? "bonded-project-dev-jwt-secret-change-before-real-users",
    SUPPORTED_CHAIN_ID_LIST: supportedChainIds
  };

  return cachedEnv;
}
