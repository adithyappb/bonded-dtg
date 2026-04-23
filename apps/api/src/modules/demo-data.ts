export const demoProfiles = [
  {
    id: "maya",
    name: "Maya",
    age: 29,
    city: "Brooklyn",
    bio: "Planner, gallery walker, and very pro-confirmed reservations.",
    interests: ["gallery nights", "trail runs", "ramen"],
    compatibility: 94,
    ghostScore: 6,
    walletValueVisible: false
  },
  {
    id: "eli",
    name: "Eli",
    age: 31,
    city: "Austin",
    bio: "Jazz, film cameras, and concrete plans over endless texting.",
    interests: ["live jazz", "film cameras", "tacos"],
    compatibility: 89,
    ghostScore: 9,
    walletValueVisible: false
  },
  {
    id: "nora",
    name: "Nora",
    age: 27,
    city: "Seattle",
    bio: "Bookstores, kayaking, and showing up when I say I will.",
    interests: ["bookstores", "kayaking", "coffee"],
    compatibility: 87,
    ghostScore: 4,
    walletValueVisible: false
  }
];

export const demoMatches = [
  {
    id: "match-maya",
    profileId: "maya",
    status: "matched",
    reason: "Both prefer planned weeknight dates and low-noise venues.",
    threadId: "maya"
  },
  {
    id: "match-eli",
    profileId: "eli",
    status: "matched",
    reason: "Shared food crawl list and aligned communication expectations.",
    threadId: "eli"
  }
];

export const demoThreads = [
  {
    id: "maya",
    matchId: "match-maya",
    messages: [
      { id: "msg-1", author: "Maya", body: "I like the stake idea. It makes scheduling feel intentional." },
      { id: "msg-2", author: "You", body: "Want to lock Thursday at 7 and keep the first date simple?" },
      { id: "msg-3", author: "Maya", body: "Yes. Coffee first, walk after if the conversation is good." }
    ]
  }
];

export const demoDate = {
  id: "demo-date",
  matchId: "match-maya",
  title: "Coffee and walk",
  place: "Devocion, Williamsburg",
  startsAt: "2026-04-18T23:00:00.000Z",
  stakeWei: "3000000000000000",
  status: "terms_proposed"
};

export const demoReputation = {
  profileId: "maya",
  ghostScore: 6,
  events: [
    { id: "rep-1", title: "Successful dinner date", proof: "App verified", impact: -3 },
    { id: "rep-2", title: "Fast response streak", proof: "App verified", impact: -1 },
    { id: "rep-3", title: "Stake terms accepted", proof: "Base Sepolia ready", impact: -2 }
  ]
};

export const demoAchievements = [
  { id: "first-stake", label: "First Stake", earned: true, proofState: "eligible" },
  { id: "on-time", label: "On Time", earned: true, proofState: "app_verified" },
  { id: "trusted-curator", label: "Trusted Curator", earned: false, proofState: "locked" }
];

export const demoSpark = {
  balance: 1240,
  ledger: [
    { id: "spark-1", amount: 300, reason: "Completed profile" },
    { id: "spark-2", amount: 500, reason: "Successful date" },
    { id: "spark-3", amount: -120, reason: "Discovery boost" }
  ]
};

export const demoNotifications = [
  { id: "notif-1", title: "Date stake ready", body: "Base Sepolia receiver is configured.", read: false },
  { id: "notif-2", title: "New compatible match", body: "Maya has a high alignment score.", read: false }
];
