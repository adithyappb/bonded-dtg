import type { BlockRequest, ReportRequest } from "./moderation.schemas.js";
import { ModerationRepository } from "./moderation.repository.js";

export class ModerationService {
  constructor(private readonly moderation = new ModerationRepository()) {}

  report(userId: string, input: ReportRequest) {
    return this.moderation.report(userId, input);
  }

  block(userId: string, input: BlockRequest) {
    return this.moderation.block(userId, input);
  }
}
