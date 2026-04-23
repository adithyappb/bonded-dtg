"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId;

  useEffect(() => {
    router.replace(`/messages${typeof threadId === "string" ? `?thread=${threadId}` : ""}`);
  }, [router, threadId]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
      Opening conversation…
    </div>
  );
}
