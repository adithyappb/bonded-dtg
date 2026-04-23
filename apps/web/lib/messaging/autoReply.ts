const AUTO_REPLIES = [
  "Love that — let’s lock something in.",
  "Sounds good to me 🙌",
  "Haha yes, same here.",
  "Got it. I’ll check my calendar and ping you.",
  "Perfect. Want to stake so we both commit?",
  "On it — give me a few minutes to reply properly.",
] as const;

/** Deterministic pseudo-reply from a seed string (used for demo auto-responses). */
export function pickAutoReply(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AUTO_REPLIES[h % AUTO_REPLIES.length]!;
}

export const AUTO_REPLY_COUNT = AUTO_REPLIES.length;
