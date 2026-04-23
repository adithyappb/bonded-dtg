/**
 * stakeEngine.js — CogcoinStakeEngine (sync, mirrors apps/web/lib/stake/CogcoinStakeEngine.ts)
 *
 * $15 per side · $30 full pot. Sequential fundSide, or lockStake for both at once.
 * claimPeerNeverFunded when only one side funded.
 */
const CogcoinStakeEngine = (() => {
  const _stakes = new Map();

  function _generateId() {
    return 'stk_cog_' + Math.random().toString(36).slice(2, 10);
  }

  function pid(id) {
    return String(id);
  }

  function _idx(stake, participantId) {
    const p = pid(participantId);
    if (pid(stake.participants[0].id) === p) return 0;
    if (pid(stake.participants[1].id) === p) return 1;
    throw new Error(`Participant ${participantId} is not in this stake`);
  }

  function _sum(c) {
    return c[0] + c[1];
  }

  function _full(stake) {
    return stake.contributions[0] >= stake.amountPerSide && stake.contributions[1] >= stake.amountPerSide;
  }

  function _nextGhost(prev, outcome) {
    const DELTA = { SHOWED_UP: -3, FLAKED: 12, DISPUTED: 4, CANCELLED_EARLY: 2 };
    const p = typeof prev === 'number' ? prev : 0;
    const n = Math.max(0, Math.min(100, p + DELTA[outcome]));
    return n;
  }

  function _deltaRow(u, outcome) {
    const prev = u.ghostScore ?? 0;
    const newScore = _nextGhost(prev, outcome);
    return { userId: String(u.id), outcome, prevScore: prev, newScore };
  }

  function createStake(amountPerSide, participants) {
    if (!amountPerSide || amountPerSide <= 0) throw new Error('Stake amount per side must be positive');
    if (!participants || participants.length < 2) throw new Error('Stake requires 2 participants');

    const id = _generateId();
    const record = {
      id,
      amountPerSide,
      contributions: [0, 0],
      totalLocked: 0,
      participants,
      status: 'proposed',
      outcome: null,
      winner: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    _stakes.set(id, record);
    Logger.info('CogcoinStakeEngine: createStake', record);
    return record;
  }

  /** Fund both sides at once (legacy / tests). */
  function lockStake(stakeId) {
    const stake = _stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== 'proposed' && stake.status !== 'awaiting_peer') {
      throw new Error(`Cannot lock stake with status "${stake.status}"`);
    }

    stake.contributions = [stake.amountPerSide, stake.amountPerSide];
    stake.totalLocked = _sum(stake.contributions);
    stake.status = 'locked';
    _stakes.set(stakeId, stake);
    WalletManager.deductBalance(stake.amountPerSide * 2);
    Logger.success('CogcoinStakeEngine: lockStake', { stakeId, totalLocked: stake.totalLocked });
    return stake;
  }

  function fundSide(stakeId, participantId) {
    const stake = _stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== 'proposed' && stake.status !== 'awaiting_peer') {
      throw new Error(`Cannot fund side with status "${stake.status}"`);
    }

    const idx = _idx(stake, participantId);
    if (stake.contributions[idx] > 0) throw new Error('This side already funded');

    stake.contributions[idx] = stake.amountPerSide;
    stake.totalLocked = _sum(stake.contributions);
    stake.status = _full(stake) ? 'locked' : 'awaiting_peer';
    WalletManager.deductBalance(stake.amountPerSide);
    _stakes.set(stakeId, stake);
    return stake;
  }

  function claimPeerNeverFunded(stakeId, claimantId) {
    const stake = _stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== 'awaiting_peer') {
      throw new Error(`claimPeerNeverFunded requires status "awaiting_peer", got "${stake.status}"`);
    }
    if (_full(stake)) throw new Error('Both sides funded — use resolveStake instead');

    const idx = _idx(stake, claimantId);
    if (stake.contributions[idx] === 0) throw new Error('Claimant has not funded their side');
    const otherIdx = 1 - idx;
    if (stake.contributions[otherIdx] !== 0) throw new Error('Counterparty already funded');

    const fullPot = stake.amountPerSide * 2;
    const winnerId = String(stake.participants[idx].id);
    const loser = stake.participants[otherIdx];

    const ghostUpdates = [_deltaRow(stake.participants[idx], 'SHOWED_UP'), _deltaRow(loser, 'FLAKED')];
    ghostUpdates.forEach((g) => {
      const u = stake.participants.find((p) => String(p.id) === g.userId);
      if (u) u.ghostScore = g.newScore;
    });

    stake.status = 'resolved';
    stake.outcome = 'FLAKED';
    stake.winner = winnerId;
    stake.totalLocked = fullPot;
    stake.resolvedAt = new Date().toISOString();
    _stakes.set(stakeId, stake);

    WalletManager.creditBalance(fullPot);

    const payoutNote = `They never funded their $${stake.amountPerSide} — you receive $${fullPot} USDC. ${loser.displayName}'s Ghost Score reflects backing out.`;
    const result = { stake, payoutNote, ghostUpdates };
    Logger.success('CogcoinStakeEngine: claimPeerNeverFunded', result);
    return result;
  }

  function resolveStake(stakeId, outcome, options) {
    const stake = _stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== 'locked') throw new Error(`Cannot resolve stake with status "${stake.status}"`);
    if (!_full(stake)) throw new Error('Escrow incomplete');

    const flakedId = options && options.flakedParticipantId;
    if (outcome === 'FLAKED' && !flakedId) {
      throw new Error('resolveStake(FLAKED) requires options.flakedParticipantId');
    }

    const [a, b] = stake.participants;
    let ghostUpdates = [];
    let winner = null;

    if (outcome === 'SUCCESS') {
      ghostUpdates = [_deltaRow(a, 'SHOWED_UP'), _deltaRow(b, 'SHOWED_UP')];
      WalletManager.creditBalance(stake.amountPerSide);
    } else if (outcome === 'FLAKED') {
      const flakeIdx = pid(flakedId) === pid(a.id) ? 0 : 1;
      const winnerIdx = 1 - flakeIdx;
      winner = String(stake.participants[winnerIdx].id);
      ghostUpdates = [_deltaRow(stake.participants[winnerIdx], 'SHOWED_UP'), _deltaRow(stake.participants[flakeIdx], 'FLAKED')];
      WalletManager.creditBalance(stake.amountPerSide * 2);
    } else if (outcome === 'DISPUTED') {
      ghostUpdates = [_deltaRow(a, 'DISPUTED'), _deltaRow(b, 'DISPUTED')];
      WalletManager.creditBalance(stake.amountPerSide * 0.75);
    }

    ghostUpdates.forEach((g) => {
      const u = stake.participants.find((p) => String(p.id) === g.userId);
      if (u) u.ghostScore = g.newScore;
    });

    stake.status = 'resolved';
    stake.outcome = outcome;
    stake.winner = winner;
    stake.resolvedAt = new Date().toISOString();
    _stakes.set(stakeId, stake);

    const fullPot = stake.amountPerSide * 2;
    let payoutNote = '';
    if (outcome === 'SUCCESS') {
      payoutNote = `Each participant receives ${stake.amountPerSide} ETH back.`;
    } else if (outcome === 'FLAKED') {
      payoutNote = `You claimed ${fullPot} ETH. Their Ghost Score increased.`;
    } else {
      payoutNote = `Dispute resolved. Each receives ~75% of stake.`;
    }

    const result = { stake, payoutNote, ghostUpdates };
    Logger.success('CogcoinStakeEngine: resolveStake', result);
    return result;
  }

  function refundStake(stakeId) {
    const stake = _stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (!['proposed', 'awaiting_peer', 'locked'].includes(stake.status)) {
      throw new Error(`Cannot refund stake with status "${stake.status}"`);
    }

    if (stake.status === 'locked') {
      WalletManager.creditBalance(stake.amountPerSide);
    } else if (stake.status === 'awaiting_peer') {
      const posted = stake.contributions[0] + stake.contributions[1];
      if (posted > 0) WalletManager.creditBalance(posted);
    }

    stake.status = 'refunded';
    stake.resolvedAt = new Date().toISOString();
    _stakes.set(stakeId, stake);
    Logger.info('CogcoinStakeEngine: refundStake', { stakeId });
    return { stake, note: 'Stake refunded to both parties.' };
  }

  function getStakeStatus(stakeId) {
    return _stakes.get(stakeId) ?? null;
  }

  function getAllStakes() {
    return Array.from(_stakes.values());
  }

  return {
    createStake,
    lockStake,
    fundSide,
    claimPeerNeverFunded,
    resolveStake,
    refundStake,
    getStakeStatus,
    getAllStakes,
  };
})();

window.CogcoinStakeEngine = CogcoinStakeEngine;
