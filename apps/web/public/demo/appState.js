/**
 * appState.js — Centralized observable state store
 * Single source of truth. All modules read/write state through StateManager.
 * Never use raw sessionStorage or global variables for app state.
 */
const StateManager = (() => {
  // ── Internal State ──────────────────────────────────────────────
  let _state = {
    loggedInUser:        null,   // { username, displayName, balance, ghostScore }
    walletState:         { status: 'disconnected', address: null, balance: 0 },
    stakeState:          null,   // active StakeRecord | null
    activeConversation:  null,   // thread index
    currentMatch:        null,   // ScoredMatch
    matchQueue:          [],     // ScoredMatch[]
    notifications:       [],     // { id, text, type }[]
  };

  const _listeners = new Set();

  // ── Private helpers ─────────────────────────────────────────────
  function _persist() {
    try {
      sessionStorage.setItem('bonded_state', JSON.stringify({
        loggedInUser: _state.loggedInUser,
        walletState:  _state.walletState,
      }));
    } catch (_) { /* ignore quota errors */ }
  }

  function _hydrate() {
    try {
      const saved = sessionStorage.getItem('bonded_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        _state.loggedInUser = parsed.loggedInUser ?? null;
        _state.walletState  = parsed.walletState  ?? _state.walletState;
      }
    } catch (_) { /* ignore */ }
  }

  // ── Public API ───────────────────────────────────────────────────
  function readState() {
    return Object.freeze({ ..._state });
  }

  function writeState(patch) {
    const prev = _state;
    _state = { ...prev, ...patch };
    Logger.event('State updated', Object.keys(patch));
    _persist();
    _listeners.forEach(fn => fn(_state, prev));
  }

  function subscribe(fn) {
    _listeners.add(fn);
    fn(_state, null); // immediate call with current state
    return () => _listeners.delete(fn); // returns unsubscribe fn
  }

  function addNotification(text, type = 'info') {
    const id = Date.now();
    writeState({ notifications: [..._state.notifications, { id, text, type }] });
    // Auto-dismiss after 4s
    setTimeout(() => {
      writeState({ notifications: _state.notifications.filter(n => n.id !== id) });
    }, 4000);
  }

  function reset() {
    sessionStorage.removeItem('bonded_state');
    _state = {
      loggedInUser: null,
      walletState: { status: 'disconnected', address: null, balance: 0 },
      stakeState: null,
      activeConversation: null,
      currentMatch: null,
      matchQueue: [],
      notifications: [],
    };
    _listeners.forEach(fn => fn(_state, null));
  }

  _hydrate(); // boot: restore persisted fields

  return { readState, writeState, subscribe, addNotification, reset };
})();

window.StateManager = StateManager;
