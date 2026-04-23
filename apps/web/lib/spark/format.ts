import { SPARK_TICKER } from "./constants";

/** Pretty-print Spark amount with ticker (no $ — Spark is not a fiat stablecoin). */
export function formatSparkAmount(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const s = n >= 10_000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : String(Math.round(n));
  return `${s} ${SPARK_TICKER}`;
}
