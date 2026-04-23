export type DatingIntent = "Long-term" | "Intentional dating" | "See where it goes";

export type MatchPreferences = {
  ageMin: number;
  ageMax: number;
  interests: readonly string[];
  dealbreakers: readonly string[];
  preferredIntent: readonly DatingIntent[];
  values: readonly string[];
};

export type MatchProfile = {
  id: number;
  name: string;
  age: number;
  bio: string;
  location: string;
  trustScore: number;
  image: string;
  interests: readonly string[];
  traits: readonly string[];
  values: readonly string[];
  intent: DatingIntent;
  /** What this person is looking for — used for mutual matchmaker pairing. */
  preferences: MatchPreferences;
  stakePreference: string;
  responseRate: number;
  verifiedHuman: boolean;
  lastActive: string;
};

export const MATCH_USER_PREFERENCES: MatchPreferences = {
  ageMin: 24,
  ageMax: 31,
  interests: ["Travel", "Fitness", "Tech", "Coffee", "Design"],
  dealbreakers: ["Smoking"],
  preferredIntent: ["Long-term", "Intentional dating"],
  values: ["Consistency", "Transparency", "Curiosity"],
};

export const MATCH_PROFILES: readonly MatchProfile[] = [
  {
    id: 1,
    name: "Sophia",
    age: 27,
    bio: "Coffee snob, trail runner, and DeFi degen. Looking for someone who stakes more than vibes.",
    location: "Brooklyn, NY",
    trustScore: 94,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    interests: ["Travel", "Coffee", "Fitness", "Tech"],
    traits: ["Non-Smoker", "Verified Human", "Prompt texter"],
    values: ["Consistency", "Curiosity", "Transparency"],
    intent: "Long-term",
    preferences: {
      ageMin: 26,
      ageMax: 34,
      interests: ["Travel", "Coffee", "Fitness", "Tech"],
      dealbreakers: ["Smoking"],
      preferredIntent: ["Long-term", "Intentional dating"],
      values: ["Consistency", "Transparency", "Curiosity"],
    },
    stakePreference: "$15 each ($30 pot)",
    responseRate: 97,
    verifiedHuman: true,
    lastActive: "Active now",
  },
  {
    id: 2,
    name: "Marcus",
    age: 31,
    bio: "Building in web3 by day, cooking pasta by night. Ghost Score minimal.",
    location: "Austin, TX",
    trustScore: 88,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    interests: ["Food", "Tech", "Travel", "Music"],
    traits: ["Non-Smoker", "Reliable planner", "Base native"],
    values: ["Transparency", "Ambition", "Playfulness"],
    intent: "Intentional dating",
    preferences: {
      ageMin: 24,
      ageMax: 36,
      interests: ["Food", "Tech", "Travel", "Music"],
      dealbreakers: [],
      preferredIntent: ["Intentional dating", "See where it goes"],
      values: ["Transparency", "Ambition", "Playfulness"],
    },
    stakePreference: "$30-50 USDC",
    responseRate: 91,
    verifiedHuman: true,
    lastActive: "12m ago",
  },
  {
    id: 3,
    name: "Aisha",
    age: 25,
    bio: "Artist and smart contract auditor. Transparency in code and relationships.",
    location: "Miami, FL",
    trustScore: 96,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    interests: ["Art", "Tech", "Travel", "Design"],
    traits: ["Non-Smoker", "Verified Human", "Thoughtful replies"],
    values: ["Transparency", "Consistency", "Growth"],
    intent: "Long-term",
    preferences: {
      ageMin: 24,
      ageMax: 32,
      interests: ["Art", "Tech", "Travel", "Design"],
      dealbreakers: ["Smoking"],
      preferredIntent: ["Long-term"],
      values: ["Transparency", "Consistency", "Growth"],
    },
    stakePreference: "$15 each ($30)",
    responseRate: 95,
    verifiedHuman: true,
    lastActive: "Active now",
  },
  {
    id: 4,
    name: "Kai",
    age: 29,
    bio: "Product designer at a DAO. I stake USDC on first dates because your time matters.",
    location: "San Francisco, CA",
    trustScore: 91,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    interests: ["Fitness", "Design", "Tech", "Coffee"],
    traits: ["Non-Smoker", "Punctual", "Strong communicator"],
    values: ["Curiosity", "Consistency", "Transparency"],
    intent: "Intentional dating",
    preferences: {
      ageMin: 25,
      ageMax: 33,
      interests: ["Fitness", "Design", "Tech", "Coffee"],
      dealbreakers: ["Smoking"],
      preferredIntent: ["Long-term", "Intentional dating"],
      values: ["Curiosity", "Consistency", "Transparency"],
    },
    stakePreference: "$15 each ($30 pot)",
    responseRate: 93,
    verifiedHuman: true,
    lastActive: "37m ago",
  },
  {
    id: 5,
    name: "Elena",
    age: 28,
    bio: "Climate tech PM — stakes small, shows up on time, prefers Base for gas.",
    location: "Denver, CO",
    trustScore: 89,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
    interests: ["Hiking", "Tech", "Coffee", "Travel"],
    traits: ["Non-Smoker", "Verified Human", "Early bird"],
    values: ["Transparency", "Consistency", "Curiosity"],
    intent: "Long-term",
    preferences: {
      ageMin: 26,
      ageMax: 35,
      interests: ["Hiking", "Tech", "Coffee", "Fitness"],
      dealbreakers: ["Smoking"],
      preferredIntent: ["Long-term", "Intentional dating"],
      values: ["Transparency", "Consistency", "Curiosity"],
    },
    stakePreference: "$15 each ($30 pot)",
    responseRate: 94,
    verifiedHuman: true,
    lastActive: "5m ago",
  },
  {
    id: 6,
    name: "Sam",
    age: 30,
    bio: "Lawyer by day, climbing gym regular. Ghost score stays low — I don’t no-show.",
    location: "Chicago, IL",
    trustScore: 85,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    interests: ["Fitness", "Food", "Music", "Travel"],
    traits: ["Non-Smoker", "Reliable planner"],
    values: ["Ambition", "Playfulness", "Transparency"],
    intent: "See where it goes",
    preferences: {
      ageMin: 24,
      ageMax: 36,
      interests: ["Fitness", "Food", "Music"],
      dealbreakers: [],
      preferredIntent: ["Intentional dating", "See where it goes"],
      values: ["Ambition", "Transparency", "Playfulness"],
    },
    stakePreference: "$20 each ($40 pot)",
    responseRate: 88,
    verifiedHuman: true,
    lastActive: "22m ago",
  },
  {
    id: 7,
    name: "Priya",
    age: 26,
    bio: "Nurse + Solidity hobbyist. Mutual stakes and QR check-ins only.",
    location: "Seattle, WA",
    trustScore: 92,
    image: "https://images.unsplash.com/photo-1534528746826-dcdfa945d345?w=400&h=500&fit=crop",
    interests: ["Design", "Tech", "Coffee", "Art"],
    traits: ["Non-Smoker", "Verified Human", "Night shift friendly"],
    values: ["Growth", "Transparency", "Consistency"],
    intent: "Intentional dating",
    preferences: {
      ageMin: 24,
      ageMax: 34,
      interests: ["Design", "Tech", "Coffee", "Art"],
      dealbreakers: ["Smoking"],
      preferredIntent: ["Long-term", "Intentional dating"],
      values: ["Transparency", "Growth", "Consistency"],
    },
    stakePreference: "$15 each ($30)",
    responseRate: 96,
    verifiedHuman: true,
    lastActive: "Active now",
  },
  {
    id: 8,
    name: "Riley",
    age: 32,
    bio: "Photographer. I’ll match your stake if you match my calendar.",
    location: "Portland, OR",
    trustScore: 87,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    interests: ["Travel", "Coffee", "Music", "Design"],
    traits: ["Non-Smoker", "Flexible schedule"],
    values: ["Curiosity", "Playfulness", "Transparency"],
    intent: "See where it goes",
    preferences: {
      ageMin: 26,
      ageMax: 38,
      interests: ["Travel", "Coffee", "Music", "Design"],
      dealbreakers: [],
      preferredIntent: ["Intentional dating", "See where it goes"],
      values: ["Curiosity", "Transparency", "Playfulness"],
    },
    stakePreference: "$15–25 USDC",
    responseRate: 90,
    verifiedHuman: false,
    lastActive: "3h ago",
  },
];
