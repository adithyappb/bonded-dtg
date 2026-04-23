/**
 * ghostScoreEngine.js — Ghost score mutation engine
 *
 * Wraps all ghost-score business logic.
 * UI must ONLY call GhostScoreEngine.updateScore() — never mutate scores inline.
 *
 * Outcomes: 'SHOWED_UP' | 'FLAKED' | 'DISPUTED' | 'CANCELLED_EARLY'
 */
const GhostScoreEngine = (() => {
  const DELTA = {
    SHOWED_UP:       -3,  // Reliability up → ghost score down (good)
    FLAKED:          +12, // Major trust breach
    DISPUTED:        +4,  // Slight trust damage
    CANCELLED_EARLY: +2,  // Minor strike (cancelled >24h ahead)
  };

  const MIN_SCORE = 0;
  const MAX_SCORE = 100;

  /**
   * @param {object} user - User object with { id, displayName, ghostScore }
   * @param {'SHOWED_UP'|'FLAKED'|'DISPUTED'|'CANCELLED_EARLY'} outcome
   * @returns {{ userId, outcome, prevScore, newScore, delta }}
   */
  function updateScore(user, outcome) {
    if (!DELTA.hasOwnProperty(outcome)) {
      Logger.error('GhostScoreEngine: Unknown outcome', outcome);
      throw new Error(`Unknown outcome: "${outcome}"`);
    }

    const delta    = DELTA[outcome];
    const prev     = typeof user.ghostScore === 'number' ? user.ghostScore : 0;
    const newScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, prev + delta));

    // Persist back to user object (in-memory; demo uses DEMO_USERS array)
    user.ghostScore = newScore;

    const result = { userId: user.id, outcome, prevScore: prev, newScore, delta };
    Logger.info(`GhostScoreEngine: ${user.displayName} — ${outcome}`, result);

    // Notify state manager
    const { loggedInUser } = StateManager.readState();
    if (loggedInUser && loggedInUser.id === user.id) {
      StateManager.writeState({ loggedInUser: { ...loggedInUser, ghostScore: newScore } });
    }

    return result;
  }

  /**
   * Returns a human-readable risk label and CSS class for a score.
   * @param {number} score
   */
  function riskLabel(score) {
    if (score < 10) return { label: 'Highly Reliable', cls: 'ghost-excellent' };
    if (score < 25) return { label: 'Average Risk',    cls: 'ghost-medium'    };
    return             { label: 'High Risk',        cls: 'ghost-high'      };
  }

  return { updateScore, riskLabel, DELTA };
})();

window.GhostScoreEngine = GhostScoreEngine;
