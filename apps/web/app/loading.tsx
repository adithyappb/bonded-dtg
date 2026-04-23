/**
 * Shown during route segment transitions — reduces blank flashes and reassures navigation worked.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4" role="status" aria-live="polite">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
