"use client";

import { useEffect, useState } from "react";

/** True after mount; false on the server and on the first client render (keeps SSR + first paint aligned for hydration). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
