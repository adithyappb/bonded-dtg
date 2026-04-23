"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DateAgreementBar } from "@/components/messaging/DateAgreementBar";
import { MeetVerificationPanel } from "@/components/verification/MeetVerificationPanel";
import { ConversationStakeCard } from "@/components/messaging/ConversationStakeCard";
import { DEMO_CONVERSATIONS, type DemoMessage } from "@/lib/demo-data";
import { pickAutoReply } from "@/lib/messaging/autoReply";
import { parseThreadQueryParam, resolveInitialThreadId } from "@/lib/messaging/threadSelection";
import { cn } from "@/lib/cn";

/** Must match AppShell bottom padding so the composer is not covered by the fixed tab bar. */
const BOTTOM_NAV_RESERVE = "7.25rem";

export function MessagesView() {
  const searchParams = useSearchParams();
  const threadFromUrl = searchParams.get("thread");

  const [selectedId, setSelectedId] = useState<number | null>(() =>
    resolveInitialThreadId(threadFromUrl, DEMO_CONVERSATIONS),
  );

  useEffect(() => {
    const n = parseThreadQueryParam(threadFromUrl);
    if (n !== null && DEMO_CONVERSATIONS.some((c) => c.id === n)) {
      setSelectedId(n);
    }
  }, [threadFromUrl]);

  const [input, setInput] = useState("");
  const [extraMessages, setExtraMessages] = useState<DemoMessage[]>([]);
  const [dateRequestSent, setDateRequestSent] = useState(false);
  const autoReplyTimeoutsRef = useRef<Set<number>>(new Set());

  const conversation = useMemo(
    () => DEMO_CONVERSATIONS.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  useEffect(() => {
    autoReplyTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    autoReplyTimeoutsRef.current.clear();
    setExtraMessages([]);
    setDateRequestSent(false);
  }, [selectedId]);

  useEffect(() => {
    const pending = autoReplyTimeoutsRef.current;
    return () => {
      pending.forEach((tid) => window.clearTimeout(tid));
      pending.clear();
    };
  }, []);

  const messages = useMemo(() => {
    if (!conversation) return [];
    return [...conversation.messages, ...extraMessages];
  }, [conversation, extraMessages]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setExtraMessages((prev) => [...prev, { from: "me", text, time: "Just now" }]);
    setInput("");

    const replyBody = pickAutoReply(`${text}-${Date.now()}`);
    const id = window.setTimeout(() => {
      autoReplyTimeoutsRef.current.delete(id);
      setExtraMessages((prev) => [...prev, { from: "them", text: replyBody, time: "Just now" }]);
    }, 1100);
    autoReplyTimeoutsRef.current.add(id);
  }, [input]);

  return (
    <div className="min-h-0">
      <div
        className="container relative z-0 mx-auto flex px-0 md:px-4"
        style={{
          height: `calc(100dvh - 4rem - ${BOTTOM_NAV_RESERVE} - env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div
          className={`w-full md:w-80 border-r border-border flex-shrink-0 flex flex-col ${selectedId !== null ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-border">
            <h1 className="font-heading text-xl font-bold text-foreground">Messages</h1>
            <p className="text-xs text-muted-foreground mt-1">Wallet-bound · E2E encrypted (XMTP)</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {DEMO_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left ${selectedId === conv.id ? "bg-secondary/50" : ""}`}
              >
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image
                    src={conv.avatar}
                    alt={conv.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  {conv.unread ? (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-heading font-semibold text-sm text-foreground truncate">{conv.name}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-h-0 ${selectedId === null ? "hidden md:flex" : "flex"}`}>
          {conversation ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="md:hidden text-muted-foreground mr-1"
                  aria-label="Back"
                >
                  ←
                </button>
                <Image
                  src={conversation.avatar}
                  alt={conversation.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span className="font-heading font-semibold text-foreground">{conversation.name}</span>
                <button
                  type="button"
                  onClick={() => setDateRequestSent(true)}
                  disabled={dateRequestSent}
                  className={cn(
                    "ml-auto rounded-lg px-3 py-1.5 text-xs font-heading font-semibold transition-colors",
                    dateRequestSent
                      ? "cursor-default border border-border/80 bg-muted text-muted-foreground shadow-inner"
                      : "gradient-emerald text-primary-foreground hover:brightness-110",
                  )}
                >
                  {dateRequestSent ? "Date requested" : "Request date"}
                </button>
              </div>

              <DateAgreementBar
                label={conversation.agreement.label}
                percent={conversation.agreement.percent}
                deadlineLabel={conversation.agreement.deadline}
              />

              <MeetVerificationPanel
                threadId={`thread-${conversation.id}`}
                peerName={conversation.name}
                agreementComplete={conversation.agreement.percent >= 100}
              />

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversation.showStakeCard ? (
                  <div className="flex justify-start">
                    <ConversationStakeCard
                      key={conversation.id}
                      peerId={conversation.peerStakeId}
                      peerName={conversation.name}
                    />
                  </div>
                ) : null}
                {messages.map((msg, i) => (
                  <motion.div
                    key={`${selectedId}-${i}-${msg.time}-${msg.text}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${msg.from === "me" ? "gradient-emerald text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${msg.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Message..."
                    className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    className="gradient-emerald flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
