import { randomUUID } from "node:crypto";
import type { BlockRequest, ReportRequest } from "./moderation.schemas.js";

export class ModerationRepository {
  private readonly reports: Array<ReportRequest & { id: string; userId: string; status: string }> = [];
  private readonly blocks: Array<BlockRequest & { id: string; userId: string }> = [];

  report(userId: string, input: ReportRequest) {
    const report = {
      id: randomUUID(),
      userId,
      status: "queued",
      ...input
    };
    this.reports.push(report);
    return report;
  }

  block(userId: string, input: BlockRequest) {
    const block = {
      id: randomUUID(),
      userId,
      ...input
    };
    this.blocks.push(block);
    return block;
  }
}
