import type { UnmatchRequest } from "./matches.schemas.js";
import { MatchesRepository } from "./matches.repository.js";

export class MatchesService {
  constructor(private readonly matches = new MatchesRepository()) {}

  listMatches() {
    return {
      matches: this.matches.listMatches()
    };
  }

  listLikesYou() {
    return {
      likes: this.matches.listLikesYou()
    };
  }

  unmatch(userId: string, matchId: string, input: UnmatchRequest) {
    return this.matches.unmatch(userId, matchId, input);
  }
}
