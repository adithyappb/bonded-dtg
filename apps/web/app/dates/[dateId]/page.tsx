"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { routes } from "@/lib/routes";

export default function DateDetailPage() {
  const params = useParams();
  const dateId = params.dateId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="font-heading text-2xl font-bold text-foreground">Staked date</h1>
      <p className="font-mono text-xs text-muted-foreground mt-2 break-all">{String(dateId)}</p>
      <Link href={routes.dashboard} className="inline-block mt-8 text-primary hover:underline">
        ← Dashboard
      </Link>
    </div>
  );
}
