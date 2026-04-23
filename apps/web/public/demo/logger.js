/**
 * logger.js — Centralized logging module for Bonded Demo
 * All modules import this. Never use console.log directly.
 */
const Logger = (() => {
  const LEVELS = { info: '🔵', warn: '🟡', error: '🔴', success: '✅', event: '⚡' };

  function _log(level, message, data) {
    const prefix = LEVELS[level] || '⬜';
    const ts = new Date().toISOString().slice(11, 23);
    const formatted = `[${ts}] ${prefix} [BONDED] ${message}`;
    if (data !== undefined) {
      console[level === 'error' ? 'error' : 'log'](formatted, data);
    } else {
      console[level === 'error' ? 'error' : 'log'](formatted);
    }
    // Append to in-memory log for tests.js to inspect
    Logger._buffer.push({ ts, level, message, data });
    if (Logger._buffer.length > 200) Logger._buffer.shift();
  }

  return {
    _buffer: [],
    info:    (msg, data) => _log('info', msg, data),
    warn:    (msg, data) => _log('warn', msg, data),
    error:   (msg, data) => _log('error', msg, data),
    success: (msg, data) => _log('success', msg, data),
    event:   (msg, data) => _log('event', msg, data),
    /** Returns the last N log entries */
    tail:    (n = 20) => Logger._buffer.slice(-n),
  };
})();

window.Logger = Logger;
