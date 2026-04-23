import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { AppShell } from "@/components/common/AppShell";

export const metadata: Metadata = {
  title: "Bonded - Proof-of-Commitment Dating",
  description: "Stake-to-date on Base, wallet-native chat, and on-chain reputation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
