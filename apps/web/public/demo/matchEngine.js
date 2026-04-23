/**
 * matchEngine.js — Business logic layer for swiping and matching
 *
 * Wraps the existing MatchingEngine class from matching.js.
 * index.html must ONLY call MatchEngine.*
 */
const MatchEngine = (() => {
  let _queue     = [];
  let _liked     = [];
  let _rejected  = [];
  let _listeners = new Set();

  function _emit() {
    _listeners.forEach(fn => fn({ queue: _queue, liked: _liked }));
  }

  /** (Re)load and rank the full match queue */
  function loadQueue(userPrefs) {
    if (!window.DEMO_USERS) {
      Logger.error('MatchEngine: DEMO_USERS not loaded');
      return [];
    }
    const matches = MatchingEngine.getTopMatches(userPrefs);
    _queue   = matches.slice(0, 20).sort(() => Math.random() - 0.5);
    _liked   = [];
    _rejected = [];
    Logger.success(`MatchEngine: Loaded ${_queue.length} candidates`);
    StateManager.writeState({ matchQueue: _queue, currentMatch: _queue[0] ?? null });
    _emit();
    return _queue;
  }

  /** Get the current top-of-deck match */
  function getCurrentCard() {
    return _queue[0] ?? null;
  }

  /**
   * Swipe left (reject) or right (like).
   * @param {'left'|'right'} direction
   * @returns {{ direction, match, newTop }}
   */
  function swipe(direction) {
    const top = _queue[0];
    if (!top) {
      Logger.warn('MatchEngine: No cards left');
      return null;
    }

    _queue.shift();

    if (direction === 'right') {
      _liked.push(top);
      Logger.event(`MatchEngine: Liked ${top.profile.displayName}`);
      StateManager.addNotification(`You liked ${top.profile.displayName}! 💛`, 'success');
    } else {
      _rejected.push(top);
      Logger.info(`MatchEngine: Passed ${top.profile.displayName}`);
    }

    StateManager.writeState({ matchQueue: _queue, currentMatch: _queue[0] ?? null });
    _emit();

    return { direction, match: top, newTop: _queue[0] ?? null };
  }

  function getLiked()    { return [..._liked]; }
  function getQueue()    { return [..._queue]; }
  function isExhausted() { return _queue.length === 0; }

  function subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }

  return { loadQueue, getCurrentCard, swipe, getLiked, getQueue, isExhausted, subscribe };
})();

window.MatchEngine = MatchEngine;
