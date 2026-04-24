import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const otpStore = new Map<string, { code: string; exp: number; attempts: number }>();

export function devEmailAuthEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.ALLOW_DEV_EMAIL_AUTH === "true";
}

export function authDevSecret(): string {
  const s = process.env.AUTH_DEV_SECRET?.trim();
  if (s) {
    return s;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_DEV_SECRET is required when dev email auth is enabled in production.");
  }
  return "bonded-dev-email-secret-change-me";
}

export function issueOtp(email: string): string {
  const key = email.toLowerCase().trim();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  otpStore.set(key, { code, exp: Date.now() + 10 * 60 * 1000, attempts: 0 });
  return code;
}

export function verifyOtp(email: string, code: string): boolean {
  const key = email.toLowerCase().trim();
  const row = otpStore.get(key);
  if (!row || row.exp < Date.now()) {
    otpStore.delete(key);
    return false;
  }

  // Increment attempts
  row.attempts += 1;
  if (row.attempts > 5) {
    otpStore.delete(key);
    return false;
  }

  const a = Buffer.from(row.code, "utf8");
  const b = Buffer.from(code.trim(), "utf8");
  
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return false;
  }

  otpStore.delete(key);
  return true;
}

export function signDevEmailToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = Buffer.from(JSON.stringify({ e: email.toLowerCase().trim(), exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", authDevSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyDevEmailToken(token: string): { email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [payload, sig] = parts;
  const expected = createHmac("sha256", authDevSecret()).update(payload).digest("base64url");
  let ok = false;
  try {
    ok = timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return null;
  }
  if (!ok) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e: string; exp: number };
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (typeof data.e !== "string" || !data.e.includes("@")) {
      return null;
    }
    return { email: data.e };
  } catch {
    return null;
  }
}
