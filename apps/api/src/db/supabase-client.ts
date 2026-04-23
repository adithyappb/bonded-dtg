import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../config/env.js";
import { ApiError } from "../http/errors.js";

export type SupabaseAdminClient = SupabaseClient;

export function createSupabaseAdminClient(env: AppEnv): SupabaseAdminClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        "x-application-name": "bonded-project-api"
      }
    }
  });
}

export function assertSupabaseOk(error: { message: string; code?: string } | null, context: string): void {
  if (error) {
    throw new ApiError(500, "database_error", `${context}: ${error.message}`, {
      supabaseCode: error.code
    });
  }
}

