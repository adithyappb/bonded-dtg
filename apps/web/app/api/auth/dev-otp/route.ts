import { devEmailAuthEnabled, issueOtp } from "@/lib/server/dev-email-auth";
import { NextResponse } from "next/server";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function sendOptionalSmtp(to: string, subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  if (!host || !port) {
    return;
  }
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "dev@localhost",
    to,
    subject,
    text,
  });
}

export async function POST(req: Request) {
  if (!devEmailAuthEnabled()) {
    return NextResponse.json({ error: { message: "Dev email auth is disabled." } }, { status: 403 });
  }

  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON body." } }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!emailOk(email)) {
    return NextResponse.json({ error: { message: "Enter a valid email address." } }, { status: 400 });
  }

  const code = issueOtp(email);
  console.info(`[Bonded dev auth] OTP for ${email}: ${code}`);

  try {
    await sendOptionalSmtp(email, "Bonded dev sign-in code", `Your code is: ${code}\n\nExpires in 10 minutes.`);
  } catch (err) {
    console.warn("[Bonded dev auth] SMTP send failed; OTP still printed above.", err);
  }

  return NextResponse.json({
    ok: true,
    hint: "Code printed in the Next.js terminal. If SMTP_* is set, also check Mailpit or your inbox.",
  });
}
