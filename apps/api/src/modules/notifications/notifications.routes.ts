import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { notificationParamsSchema } from "./notifications.schemas.js";
import { NotificationsService } from "./notifications.service.js";

export async function registerNotificationsRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; notificationsService?: NotificationsService }
): Promise<void> {
  const notificationsService = deps.notificationsService ?? new NotificationsService();

  app.get(routes.notifications.list, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return notificationsService.list();
  });

  app.post(routes.notifications.markRead, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const params = notificationParamsSchema.parse(request.params);
    return notificationsService.markRead(params.notificationId);
  });
}
