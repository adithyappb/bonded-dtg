import { Navbar } from "@/components/layout/Navbar";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark relative min-h-screen bonded-app-bg">
      <div className="bonded-app-grid pointer-events-none fixed inset-0 z-0 opacity-[0.65]" aria-hidden />
      <Navbar />
      <div className="relative z-10 pt-16 pb-[calc(7.25rem+env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}
