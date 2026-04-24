"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type DatePlan = {
  amountEth: string;
  place: string;
  status: "draft" | "agreed" | "funded" | "completed";
};

type AppState = {
  likedProfileIds: string[];
  passedProfileIds: string[];
  matchProfileIds: string[];
  messagesByThread: Record<string, { id: string; author: string; body: string }[]>;
  datePlan: DatePlan;
  spark: number;
  userProfile: {
    name: string;
    age: number;
    bio: string;
    location: string;
    image: string;
    trustScore: number;
    interests: string[];
    intent: string;
    stakePreference: string;
  };
};

type AppStateContextValue = AppState & {
  likeProfile: (profileId: string) => void;
  passProfile: (profileId: string) => void;
  sendMessage: (threadId: string, body: string) => void;
  updateDatePlan: (plan: Pick<DatePlan, "amountEth" | "place">) => void;
  setDateStatus: (status: DatePlan["status"]) => void;
  updateUserProfile: (profile: Partial<AppState["userProfile"]>) => void;
};

const defaultState: AppState = {
  likedProfileIds: [],
  passedProfileIds: [],
  matchProfileIds: ["maya", "eli"],
  messagesByThread: {
    maya: [
      { id: "1", author: "Maya", body: "I like the stake idea. It makes scheduling feel intentional." },
      { id: "2", author: "You", body: "Same. Want to lock Thursday at 7 and keep the first date simple?" },
      { id: "3", author: "Maya", body: "Yes. Coffee first, walk after if the conversation is good." },
    ],
    eli: [
      { id: "1", author: "Eli", body: "I found a jazz bar that works for a low-pressure first round." },
      { id: "2", author: "You", body: "Send it. I am good with a small stake once the plan is clear." },
    ],
  },
  datePlan: {
    amountEth: "0.003",
    place: "Devocion, Williamsburg",
    status: "draft",
  },
  spark: 1240,
  userProfile: {
    name: "Jake W.",
    age: 28,
    bio: "Just a guy looking for a meaningful connection in the web3 world. Coffee, hiking, and exploring new chains.",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
    trustScore: 92,
    interests: ["Coffee", "Hiking", "Web3", "Tech", "Art"],
    intent: "Long-term relationships",
    stakePreference: "0.005 ETH",
  },
};

const storageKey = "bonded.app-state.v1";
const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setState({ ...defaultState, ...JSON.parse(stored) });
      }
    } catch {
      setState(defaultState);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      likeProfile: (profileId) =>
        setState((current) => ({
          ...current,
          likedProfileIds: [...new Set([...current.likedProfileIds, profileId])],
          matchProfileIds: [...new Set([...current.matchProfileIds, profileId])],
          spark: current.spark + 20,
        })),
      passProfile: (profileId) =>
        setState((current) => ({
          ...current,
          passedProfileIds: [...new Set([...current.passedProfileIds, profileId])],
        })),
      sendMessage: (threadId, body) =>
        setState((current) => ({
          ...current,
          messagesByThread: {
            ...current.messagesByThread,
            [threadId]: [
              ...(current.messagesByThread[threadId] ?? []),
              { id: crypto.randomUUID(), author: "You", body },
            ],
          },
          spark: current.spark + 5,
        })),
      updateDatePlan: (plan) =>
        setState((current) => ({
          ...current,
          datePlan: { ...current.datePlan, ...plan, status: "agreed" },
          spark: current.spark + 30,
        })),
      setDateStatus: (status) =>
        setState((current) => ({
          ...current,
          datePlan: { ...current.datePlan, status },
          spark: status === "completed" ? current.spark + 100 : current.spark,
        })),
      updateUserProfile: (profile) =>
        setState((current) => ({
          ...current,
          userProfile: { ...current.userProfile, ...profile },
        })),
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}
