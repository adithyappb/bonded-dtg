import { ApiError } from "../../http/errors.js";
import type { DateOutcomeRequest, ProposeDateRequest } from "./dates.schemas.js";
import { DatesRepository } from "./dates.repository.js";

export class DatesService {
  constructor(private readonly dates = new DatesRepository()) {}

  listDates() {
    return {
      dates: this.dates.listDates()
    };
  }

  getDate(dateId: string) {
    const date = this.dates.getDate(dateId);

    if (!date) {
      throw new ApiError(404, "date_not_found", "No date exists for that ID.");
    }

    return date;
  }

  proposeDate(input: ProposeDateRequest) {
    return this.dates.proposeDate(input);
  }

  recordOutcome(dateId: string, input: DateOutcomeRequest) {
    return this.dates.recordOutcome(dateId, input);
  }
}
