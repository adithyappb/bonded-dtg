import { randomUUID } from "node:crypto";
import { demoDate } from "../demo-data.js";
import type { DateOutcomeRequest, ProposeDateRequest } from "./dates.schemas.js";

export class DatesRepository {
  private readonly dates = new Map([[demoDate.id, structuredClone(demoDate)]]);
  private readonly outcomes = new Map<string, DateOutcomeRequest & { recordedAt: string }>();

  listDates() {
    return Array.from(this.dates.values());
  }

  getDate(dateId: string) {
    return this.dates.get(dateId) ?? null;
  }

  proposeDate(input: ProposeDateRequest) {
    const date = {
      id: randomUUID(),
      ...input,
      status: "terms_proposed"
    };
    this.dates.set(date.id, date);
    return date;
  }

  recordOutcome(dateId: string, input: DateOutcomeRequest) {
    const record = {
      ...input,
      recordedAt: new Date().toISOString()
    };
    this.outcomes.set(dateId, record);
    return {
      dateId,
      ...record
    };
  }
}
