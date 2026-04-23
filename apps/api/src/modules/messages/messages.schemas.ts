import { z } from "zod";

export const threadParamsSchema = z.object({
  threadId: z.string().min(1)
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000)
});

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
