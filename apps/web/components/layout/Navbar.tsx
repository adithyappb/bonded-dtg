"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useAppSessionEntered } from "@/lib/app-session";
import { useWallet } from "@/lib/wallet";
import { routes } from "@/lib/routes";
import { isRouteActive } from "@/lib/nav-utils";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { primaryNavItems, profileNavItem, type NavItem } from "./nav-config";

function MobileTab({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isRouteActive(pathname, item.path);
  return (
    <Link
      href={item.path}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-colors ${active ? "text-primary" : "text-muted-foreground active:bg-secondary/50"}`}
    >
      <item.icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="truncate text-[10px] font-medium leading-none">{item.label}</span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { status, identity } = useWallet();
  const appSessionEntered = useAppSessionEntered();

  const identityLabel =
    status === "connected" && identity.address
      ? identity.displayName || identity.connectorName || "Wallet connected"
      : null;

  const isSignedIn = status === "connected" && Boolean(identity.address);
  const showAppNav = isSignedIn || appSessionEntered;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/15 bg-card/45 backdrop-blur-2xl shadow-lg shadow-black/25">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={routes.home} className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-emerald">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground truncate">Bonded</span>
          </Link>



          <div className="hidden items-center gap-3 lg:flex">
            {identityLabel ? (
              <div className="min-w-0 text-right">
                <p className="max-w-[160px] truncate text-xs font-semibold text-foreground" title={identityLabel}>
                  {identityLabel}
                </p>
                <p className="text-[11px] text-muted-foreground">{identity.chainName ?? "Network pending"}</p>
              </div>
            ) : null}
            <WalletConnectButton showAddress={!identityLabel} />
          </div>
        </div>
      </header>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/15 bg-background/75 backdrop-blur-2xl pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.55)]"
        role="navigation"
        aria-label="Mobile wallet and tabs"
      >

        {showAppNav ? (
          <nav
            className="mx-auto flex max-w-lg justify-around px-0.5 pt-1 pb-1 lg:pb-3 lg:pt-3 lg:gap-8"
            aria-label="Primary"
          >
            {primaryNavItems.map((item) => (
              <MobileTab key={item.path} item={item} pathname={pathname} />
            ))}
            <MobileTab item={profileNavItem} pathname={pathname} />
          </nav>
        ) : null}
      </div>
    </>
  );
}
