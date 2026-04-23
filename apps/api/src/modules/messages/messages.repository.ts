import { randomUUID } from "node:crypto";
import { demoThreads } from "../demo-data.js";
import type { SendMessageRequest } from "./messages.schemas.js";

export class MessagesRepository {
  private readonly threads = new Map(demoThreads.map((thread) => [thread.id, structuredClone(thread)]));

  listThreads() {
    return Array.from(this.threads.values());
  }

  getThread(threadId: string) {
    return this.threads.get(threadId) ?? null;
  }

  sendMessage(threadId: string, input: SendMessageRequest) {
    const thread = this.threads.get(threadId) ?? {
      id: threadId,
      matchId: `match-${threadId}`,
      messages: []
    };
    const message = {
      id: randomUUID(),
      author: "You",
      body: input.body
    };
    thread.messages.push(message);
    this.threads.set(threadId, thread);
    return message;
  }
}
