import type { LucideIcon } from "lucide-react";
import { Shield, Flame, MessageCircle, User, Wallet, LayoutDashboard } from "lucide-react";
import { routes } from "@/lib/routes";

export type NavItem = { path: string; label: string; icon: LucideIcon };

/** Core destinations — Profile is kept separate so it always renders last in the thumb zone */
export const primaryNavItems: readonly NavItem[] = [
  { path: routes.home, label: "Home", icon: Shield },
  { path: routes.discover, label: "Discover", icon: Flame },
  { path: routes.dashboard, label: "Commit", icon: LayoutDashboard },
  { path: routes.messages, label: "Chat", icon: MessageCircle },
  { path: routes.wallet, label: "Wallet", icon: Wallet },
];

export const profileNavItem: NavItem = {
  path: routes.profile,
  label: "Profile",
  icon: User,
};

export const allNavItems: readonly NavItem[] = [...primaryNavItems, profileNavItem];
