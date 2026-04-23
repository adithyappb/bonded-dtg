import { routes } from "@/lib/routes";

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
