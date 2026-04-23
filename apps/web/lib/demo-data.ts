export type DemoProfile = {
  id: number;
  name: string;
  age: number;
  bio: string;
  location: string;
  trustScore: number;
  image: string;
};

export const DEMO_PROFILES: readonly DemoProfile[] = [
  {
    id: 1,
    name: "Sophia",
    age: 27,
    bio: "Coffee snob, trail runner, and DeFi degen. Looking for someone who stakes more than vibes.",
    location: "Brooklyn, NY",
    trustScore: 94,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Marcus",
    age: 31,
    bio: "Building in web3 by day, cooking pasta by night. Ghost Score minimal.",
    location: "Austin, TX",
    trustScore: 88,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    name: "Aisha",
    age: 25,
    bio: "Artist & smart contract auditor. Transparency in code and relationships.",
    location: "Miami, FL",
    trustScore: 96,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
  },
  {
    id: 4,
    name: "Kai",
    age: 29,
    bio: "Product designer at a DAO. I stake USDC on first dates because your time matters.",
    location: "San Francisco, CA",
    trustScore: 91,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
  },
  {
    id: 5,
    name: "Elena",
    age: 28,
    bio: "Climate tech PM — stakes small, shows up on time.",
    location: "Denver, CO",
    trustScore: 89,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
  },
  {
    id: 6,
    name: "Sam",
    age: 30,
    bio: "Lawyer by day, climbing gym regular.",
    location: "Chicago, IL",
    trustScore: 85,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  },
  {
    id: 7,
    name: "Priya",
    age: 26,
    bio: "Nurse + Solidity hobbyist.",
    location: "Seattle, WA",
    trustScore: 92,
    image: "https://images.unsplash.com/photo-1534528746826-dcdfa945d345?w=400&h=500&fit=crop",
  },
  {
    id: 8,
    name: "Riley",
    age: 32,
    bio: "Photographer. Calendar-first planning.",
    location: "Portland, OR",
    trustScore: 87,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
  },
];

export type DemoStake = {
  matchName: string;
  amount: string;
  status: "pending" | "active" | "completed" | "forfeited";
  date: string;
  avatar: string;
};

export const DEMO_STAKES: readonly DemoStake[] = [
  {
    matchName: "Sophia M.",
    amount: "$30 USDC",
    status: "active",
    date: "Tonight, 8 PM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    matchName: "Alex R.",
    amount: "$30 USDC",
    status: "completed",
    date: "Apr 8, 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    matchName: "Jordan K.",
    amount: "$30 USDC",
    status: "completed",
    date: "Apr 5, 2026",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    matchName: "Taylor S.",
    amount: "$30 USDC",
    status: "forfeited",
    date: "Mar 29, 2026",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
];

export type DemoMessage = { from: "them" | "me"; text: string; time: string };

export type DemoConversation = {
  id: number;
  name: string;
  /** Stable id for stake + escrow flows (pairs with demo peer participant). */
  peerStakeId: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: boolean;
  agreement: { label: string; percent: number; deadline: string };
  messages: DemoMessage[];
  showStakeCard: boolean;
};

export const DEMO_CONVERSATIONS: readonly DemoConversation[] = [
  {
    id: 1,
    name: "Sophia M.",
    peerStakeId: "peer-sophia-1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop",
    lastMsg: "Sounds great! Let's stake $15 each ($30 pot)?",
    time: "2m ago",
    unread: true,
    agreement: { label: "Date agreement", percent: 65, deadline: "QR window: Sat 8:00–9:00 PM" },
    messages: [
      { from: "them", text: "Hey! Love your trust score 🛡️", time: "10:30 AM" },
      { from: "me", text: "Thanks! Coffee this Saturday?", time: "10:32 AM" },
      { from: "them", text: "Sounds great! Let's stake $15 each ($30 pot)?", time: "10:33 AM" },
    ],
    showStakeCard: true,
  },
  {
    id: 2,
    name: "Alex R.",
    peerStakeId: "peer-alex-2",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
    lastMsg: "That was fun, confirming the date ✅",
    time: "1h ago",
    unread: false,
    agreement: { label: "Mutual release complete", percent: 100, deadline: "EAS attestation issued" },
    messages: [
      { from: "them", text: "Ready to confirm our date?", time: "9:00 AM" },
      { from: "me", text: "Yes! Scanning QR now.", time: "9:01 AM" },
      { from: "them", text: "That was fun, confirming the date ✅", time: "9:05 AM" },
    ],
    showStakeCard: false,
  },
  {
    id: 3,
    name: "Priya K.",
    peerStakeId: "peer-priya-7",
    avatar: "https://images.unsplash.com/photo-1534528746826-dcdfa945d345?w=60&h=60&fit=crop",
    lastMsg: "Locked $15 — see you at the café",
    time: "Yesterday",
    unread: false,
    agreement: { label: "Dual-funded escrow", percent: 100, deadline: "Meet window: Sun 2–4 PM" },
    messages: [
      { from: "them", text: "Sent my side of the stake ✅", time: "Mon 4:12 PM" },
      { from: "me", text: "Same — dual lock looks good.", time: "Mon 4:14 PM" },
      { from: "them", text: "Locked $15 — see you at the café", time: "Mon 4:15 PM" },
    ],
    showStakeCard: true,
  },
];

export const DEMO_LEADERBOARD = [
  { rank: 1, handle: "sarah.vouch", score: 99 },
  { rank: 2, handle: "marcus.base", score: 97 },
  { rank: 3, handle: "adithya.vouch", score: 96 },
] as const;
