"use client";

/**
 * Root-level error UI — must define <html> and <body> (App Router requirement).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[hsl(150_12%_5%)] text-[hsl(210_20%_95%)] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <h1 className="font-sans text-xl font-semibold">Bonded hit a critical error</h1>
          <p className="mt-2 max-w-md text-center text-sm text-neutral-400">
            Refresh the page. If this persists, clear the site cache or run{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5 text-xs">npm run clean</code> then restart dev.
          </p>
          {process.env.NODE_ENV === "development" && error.message ? (
            <pre className="mt-4 max-h-40 max-w-lg overflow-auto rounded border border-neutral-700 bg-neutral-900/80 p-3 text-left text-xs text-neutral-400">
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
