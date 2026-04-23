import { Suspense } from "react";
import { MessagesView } from "./MessagesView";

function MessagesFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground text-sm">
      Loading messages…
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesView />
    </Suspense>
  );
}
