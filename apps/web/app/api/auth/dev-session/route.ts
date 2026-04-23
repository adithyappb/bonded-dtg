import { devEmailAuthEnabled, verifyDevEmailToken } from "@/lib/server/dev-email-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "bonded_dev_email";

export async function GET() {
  if (!devEmailAuthEnabled()) {
    return NextResponse.json({ authenticated: false });
  }
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ authenticated: false });
  }
  const session = verifyDevEmailToken(raw);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, email: session.email });
}
