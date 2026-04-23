import { ApiError } from "../../http/errors.js";
import type { SendMessageRequest } from "./messages.schemas.js";
import { MessagesRepository } from "./messages.repository.js";

export class MessagesService {
  constructor(private readonly messages = new MessagesRepository()) {}

  listThreads() {
    return {
      threads: this.messages.listThreads()
    };
  }

  getThread(threadId: string) {
    const thread = this.messages.getThread(threadId);

    if (!thread) {
      throw new ApiError(404, "thread_not_found", "No message thread exists for that ID.");
    }

    return thread;
  }

  sendMessage(threadId: string, input: SendMessageRequest) {
    return this.messages.sendMessage(threadId, input);
  }
}
