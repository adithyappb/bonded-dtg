import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { sendMessageSchema, threadParamsSchema } from "./messages.schemas.js";
import { MessagesService } from "./messages.service.js";

export async function registerMessagesRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; messagesService?: MessagesService }
): Promise<void> {
  const messagesService = deps.messagesService ?? new MessagesService();

  app.get(routes.messages.threads, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return messagesService.listThreads();
  });

  app.get(routes.messages.thread, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const params = threadParamsSchema.parse(request.params);
    return messagesService.getThread(params.threadId);
  });

  app.post(routes.messages.send, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const params = threadParamsSchema.parse(request.params);
    const input = sendMessageSchema.parse(request.body);
    return messagesService.sendMessage(params.threadId, input);
  });
}
