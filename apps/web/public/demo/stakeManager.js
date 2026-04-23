/**
 * stakeManager.js — Stake lifecycle manager
 *
 * Single point of entry for all stake operations from the UI.
 * Delegates to CogcoinStakeEngine and syncs state + notifications.
 *
 * UI must ONLY call StakeManager.*
 */
const StakeManager = (() => {
  let _activeEngine = CogcoinStakeEngine; // swappable engine

  /** Propose and immediately lock a stake. Returns the locked StakeRecord. */
  async function proposeAndLock(amount, matchUser) {
    const { loggedInUser } = StateManager.readState();
    if (!loggedInUser) throw new Error('Must be logged in to create a stake');

    // Validate balance
    const currentBal = WalletManager.currentBalance;
    if (currentBal < amount) {
      const msg = `Insufficient balance. You have ${currentBal.toFixed(2)} ETH, need ${amount} ETH.`;
      StateManager.addNotification(msg, 'error');
      throw new Error(msg);
    }

    // 1. Create
    const stake = _activeEngine.createStake(amount, [loggedInUser, matchUser]);
    Logger.info('StakeManager: Stake proposed', stake.id);
    StateManager.addNotification(`Stake proposal for ${amount} ETH created…`, 'info');

    // 2. Simulate tx confirmation delay
    await _sleep(600);

    // 3. Lock
    const locked = _activeEngine.lockStake(stake.id);
    StateManager.writeState({ stakeState: locked });
    StateManager.addNotification(`${amount * 2} ETH total locked in escrow ⚡`, 'success');
    Logger.success('StakeManager: Stake locked', locked);
    return locked;
  }

  /** Resolve with an outcome. Pass { flakedParticipantId } when outcome is FLAKED. */
  async function resolve(stakeId, outcome, opts) {
    const validOutcomes = ['SUCCESS', 'FLAKED', 'DISPUTED'];
    if (!validOutcomes.includes(outcome)) {
      throw new Error(`Invalid outcome "${outcome}". Must be one of: ${validOutcomes.join(', ')}`);
    }

    await _sleep(800); // Simulate on-chain confirmation
    const result = _activeEngine.resolveStake(stakeId, outcome, opts);
    StateManager.writeState({ stakeState: null });

    const { payoutNote } = result;
    StateManager.addNotification(payoutNote, outcome === 'FLAKED' ? 'success' : 'info');
    Logger.success('StakeManager: Resolved', { stakeId, outcome });
    return result;
  }

  /** Cancel and refund a stake. */
  async function refund(stakeId) {
    await _sleep(400);
    const result = _activeEngine.refundStake(stakeId);
    StateManager.writeState({ stakeState: null });
    StateManager.addNotification(result.note, 'info');
    Logger.info('StakeManager: Refunded', stakeId);
    return result;
  }

  function getActiveStake() {
    return StateManager.readState().stakeState;
  }

  function getHistory() {
    return _activeEngine.getAllStakes();
  }

  /** Swap staking engine (e.g. for future Lightning or on-chain engine) */
  function setEngine(engine) {
    _activeEngine = engine;
    Logger.info('StakeManager: Engine swapped to', engine.constructor?.name ?? 'custom');
  }

  function _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  return { proposeAndLock, resolve, refund, getActiveStake, getHistory, setEngine };
})();

window.StakeManager = StakeManager;
