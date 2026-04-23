import { devEmailAuthEnabled, signDevEmailToken, verifyOtp } from "@/lib/server/dev-email-auth";
import { NextResponse } from "next/server";

const COOKIE = "bonded_dev_email";
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: Request) {
  if (!devEmailAuthEnabled()) {
    return NextResponse.json({ error: { message: "Dev email auth is disabled." } }, { status: 403 });
  }

  let body: { email?: string; code?: string };
  try {
    body = (await req.json()) as { email?: string; code?: string };
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON body." } }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code : "";
  if (!emailOk(email) || !/^\d{6}$/.test(code.trim())) {
    return NextResponse.json({ error: { message: "Valid email and 6-digit code required." } }, { status: 400 });
  }

  if (!verifyOtp(email, code)) {
    return NextResponse.json({ error: { message: "Invalid or expired code." } }, { status: 401 });
  }

  const token = signDevEmailToken(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
