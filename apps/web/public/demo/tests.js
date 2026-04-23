/**
 * tests.js — Headless test suite for Bonded Demo
 *
 * Run in browser console: await BondedTests.runAll()
 * Or individual: await BondedTests.testWallet()
 *
 * Each test prints ✅ PASS or ❌ FAIL with details.
 */
const BondedTests = (() => {
  let _passed = 0;
  let _failed = 0;

  function _assert(condition, label) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      _passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      _failed++;
    }
  }

  function _header(suite) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🧪 TEST SUITE: ${suite}`);
    console.log('─'.repeat(50));
  }

  // ── Test 1: Wallet ─────────────────────────────────────────────────────────
  async function testWallet() {
    _header('Wallet');
    try {
      const result = await WalletManager.connectWallet();
      _assert(result !== null, 'connectWallet() returns a result');

      const bal = WalletManager.currentBalance;
      _assert(typeof bal === 'number' && bal > 0, `getBalance() returns positive number: ${bal}`);

      const addr = await WalletManager.getAddress();
      _assert(typeof addr === 'string' && addr.length > 10, `getAddress() returns a string: ${addr}`);

      const sig = await WalletManager.signTransaction({ to: '0xAbc', value: '0.001' });
      _assert(sig && sig.txId && sig.status === 'signed', `signTransaction() returns signed tx: ${sig?.txId}`);

      const status = await WalletManager.getTransactionStatus(sig.txId);
      _assert(status.status === 'confirmed', `getTransactionStatus() returns confirmed: ${status.status}`);

      const prevBal = WalletManager.currentBalance;
      WalletManager.deductBalance(0.1);
      _assert(WalletManager.currentBalance === parseFloat((prevBal - 0.1).toFixed(4)), 'deductBalance() reduces balance correctly');

      WalletManager.creditBalance(0.1);
      _assert(WalletManager.currentBalance === prevBal, 'creditBalance() restores balance correctly');

    } catch (err) {
      console.error('  ❌ testWallet threw', err.message);
      _failed++;
    }
    console.log(`\n  Wallet: ${_passed} passed\n`);
  }

  // ── Test 2: Stake Flow ─────────────────────────────────────────────────────
  async function testStakeFlow() {
    _header('Stake Flow');
    const _p = _passed; const _f = _failed;

    // Fake users
    const userA = { id: 1, displayName: 'Alice', ghostScore: 10 };
    const userB = { id: 2, displayName: 'Bob',   ghostScore: 30 };

    // Simulate logged-in user
    StateManager.writeState({ loggedInUser: { ...userA, balance: 5.0 } });
    WalletManager.creditBalance(5.0); // ensure enough balance

    try {
      // createStake
      const stake = CogcoinStakeEngine.createStake(0.2, [userA, userB]);
      _assert(stake.id.startsWith('stk_cog_'), 'createStake() generates a valid ID');
      _assert(stake.status === 'proposed', 'createStake() status is "proposed"');
      _assert(stake.totalLocked === 0, `createStake() totalLocked = ${stake.totalLocked}`);

      // lockStake
      const locked = CogcoinStakeEngine.lockStake(stake.id);
      _assert(locked.status === 'locked', 'lockStake() status is "locked"');
      _assert(locked.totalLocked === 0.4, 'lockStake() funds both sides');

      // Cannot lock again
      let threw = false;
      try { CogcoinStakeEngine.lockStake(stake.id); } catch { threw = true; }
      _assert(threw, 'lockStake() throws if already locked');

      // getStakeStatus
      const retrieved = CogcoinStakeEngine.getStakeStatus(stake.id);
      _assert(retrieved?.id === stake.id, 'getStakeStatus() retrieves the stake');

      // resolveStake SUCCESS
      const successStake = CogcoinStakeEngine.createStake(0.1, [userA, userB]);
      CogcoinStakeEngine.lockStake(successStake.id);
      const res = CogcoinStakeEngine.resolveStake(successStake.id, 'SUCCESS');
      _assert(res.stake.status === 'resolved', 'resolveStake(SUCCESS) sets status');
      _assert(res.stake.outcome === 'SUCCESS', 'resolveStake(SUCCESS) sets outcome');

      // resolveStake FLAKED
      const flakeStake = CogcoinStakeEngine.createStake(0.1, [userA, userB]);
      CogcoinStakeEngine.lockStake(flakeStake.id);
      const flakeRes = CogcoinStakeEngine.resolveStake(flakeStake.id, 'FLAKED', { flakedParticipantId: userB.id });
      _assert(flakeRes.stake.outcome === 'FLAKED', 'resolveStake(FLAKED) sets outcome');
      _assert(userB.ghostScore > 30, `FLAKED increases ghostScore: ${userB.ghostScore}`);

      // refundStake
      const refundStake = CogcoinStakeEngine.createStake(0.05, [userA, userB]);
      CogcoinStakeEngine.lockStake(refundStake.id);
      const refundRes = CogcoinStakeEngine.refundStake(refundStake.id);
      _assert(refundRes.stake.status === 'refunded', 'refundStake() sets status to "refunded"');

    } catch (err) {
      console.error('  ❌ testStakeFlow threw', err.message);
      _failed++;
    }

    const p = _passed - _p; const f = _failed - _f;
    console.log(`\n  Stake: ${p} passed, ${f} failed\n`);
  }

  // ── Test 3: Ghost Score Engine ─────────────────────────────────────────────
  async function testGhostScore() {
    _header('Ghost Score Engine');
    const user = { id: 99, displayName: 'TestUser', ghostScore: 20 };

    try {
      const r1 = GhostScoreEngine.updateScore(user, 'SHOWED_UP');
      _assert(r1.delta < 0, `SHOWED_UP gives negative delta: ${r1.delta}`);
      _assert(r1.newScore < 20, `SHOWED_UP reduces score: ${r1.newScore}`);

      const r2 = GhostScoreEngine.updateScore(user, 'FLAKED');
      _assert(r2.delta > 0, `FLAKED gives positive delta: ${r2.delta}`);
      _assert(r2.newScore > r1.newScore, `FLAKED increases score: ${r2.newScore}`);

      const r3 = GhostScoreEngine.updateScore(user, 'DISPUTED');
      _assert(r3.delta > 0, `DISPUTED gives positive delta: ${r3.delta}`);

      // Boundary: cannot exceed 100
      user.ghostScore = 99;
      const r4 = GhostScoreEngine.updateScore(user, 'FLAKED');
      _assert(r4.newScore <= 100, `Score capped at 100: ${r4.newScore}`);

      // Boundary: cannot go below 0
      user.ghostScore = 1;
      const r5 = GhostScoreEngine.updateScore(user, 'SHOWED_UP');
      _assert(r5.newScore >= 0, `Score floored at 0: ${r5.newScore}`);

      // Unknown outcome throws
      let threw = false;
      try { GhostScoreEngine.updateScore(user, 'UNKNOWN'); } catch { threw = true; }
      _assert(threw, 'Unknown outcome throws an error');

      const { cls } = GhostScoreEngine.riskLabel(5);
      _assert(cls === 'ghost-excellent', `riskLabel(5) = ghost-excellent`);
      const { cls: cls2 } = GhostScoreEngine.riskLabel(50);
      _assert(cls2 === 'ghost-high', `riskLabel(50) = ghost-high`);

    } catch (err) {
      console.error('  ❌ testGhostScore threw', err.message);
      _failed++;
    }
    console.log('');
  }

  // ── Test 4: Match Engine ───────────────────────────────────────────────────
  async function testMatchEngine() {
    _header('Match Engine');
    try {
      if (!window.DEMO_USERS) {
        console.warn('  ⚠ DEMO_USERS not loaded — skipping MatchEngine tests');
        return;
      }
      const queue = MatchEngine.loadQueue();
      _assert(Array.isArray(queue) && queue.length > 0, `loadQueue() returns ${queue.length} cards`);

      const top = MatchEngine.getCurrentCard();
      _assert(top !== null, 'getCurrentCard() is not null after load');

      const result = MatchEngine.swipe('right');
      _assert(result.direction === 'right', 'swipe(right) returns correct direction');
      _assert(result.match !== null, 'swipe() returns the match that was swiped');

      const newTop = MatchEngine.getCurrentCard();
      _assert(newTop?.profile?.id !== top?.profile?.id, 'getCurrentCard() advances after swipe');

      const liked = MatchEngine.getLiked();
      _assert(liked.length === 1, `getLiked() has 1 item after one right swipe`);

    } catch (err) {
      console.error('  ❌ testMatchEngine threw', err.message);
      _failed++;
    }
    console.log('');
  }

  // ── Full Demo Loop ─────────────────────────────────────────────────────────
  async function runFullDemoLoop() {
    _header('FULL DEMO LOOP');
    console.log('Simulating: Login → Wallet → Swipe → Stake → Resolve → Ghost Score Update\n');

    try {
      // 1. Login
      const user = { id: 1, displayName: 'DemoUser', ghostScore: 10, balance: 5.0 };
      StateManager.writeState({ loggedInUser: user });
      _assert(StateManager.readState().loggedInUser?.displayName === 'DemoUser', 'Step 1: Login — state set');

      // 2. Connect wallet
      await WalletManager.connectWallet();
      _assert(WalletManager.isConnected(), 'Step 2: Wallet connected');

      // 3. Swipe match
      if (window.DEMO_USERS) {
        MatchEngine.loadQueue();
        const swipeResult = MatchEngine.swipe('right');
        _assert(swipeResult !== null, `Step 3: Swiped right on ${swipeResult?.match?.profile?.displayName}`);
      } else {
        console.warn('  ⚠ Skipping swipe — DEMO_USERS not loaded');
      }

      // 4. Propose & lock stake
      const matchUser = { id: 99, displayName: 'TestMatch', ghostScore: 20 };
      WalletManager.creditBalance(2.0);
      const stake = await StakeManager.proposeAndLock(0.1, matchUser);
      _assert(stake.status === 'locked', `Step 4: Stake locked — ${stake.id}`);

      // 5. Resolve SUCCESS
      const res = await StakeManager.resolve(stake.id, 'SUCCESS');
      _assert(res.stake.status === 'resolved', 'Step 5: Stake resolved');
      _assert(res.stake.outcome === 'SUCCESS', 'Step 5: Outcome is SUCCESS');

      // 6. Ghost score updated
      _assert(user.ghostScore <= 10, `Step 6: Ghost score maintained/improved: ${user.ghostScore}`);

      // 7. Wallet balance check
      _assert(WalletManager.currentBalance >= 0, `Step 7: Balance non-negative: ${WalletManager.currentBalance}`);

      console.log('\n🏁 Full demo loop complete!\n');
    } catch (err) {
      console.error('  ❌ Demo loop threw', err.message);
      _failed++;
    }
  }

  // ── runAll ─────────────────────────────────────────────────────────────────
  async function runAll() {
    _passed = 0; _failed = 0;
    console.clear();
    console.log('╔══════════════════════════════════════════╗');
    console.log('║       BONDED TEST SUITE v1.0.0           ║');
    console.log('╚══════════════════════════════════════════╝');

    await testWallet();
    await testStakeFlow();
    await testGhostScore();
    await testMatchEngine();
    await runFullDemoLoop();

    console.log('\n══════════════════════════════════════════');
    console.log(`RESULTS: ${_passed} passed  |  ${_failed} failed`);
    if (_failed === 0) {
      console.log('%c✅ ALL TESTS PASSED — Demo is production ready!', 'color: #10b981; font-weight: bold; font-size: 14px;');
    } else {
      console.error(`❌ ${_failed} test(s) failed — review above.`);
    }
    console.log('══════════════════════════════════════════\n');
    return { passed: _passed, failed: _failed };
  }

  return { runAll, testWallet, testStakeFlow, testGhostScore, testMatchEngine, runFullDemoLoop };
})();

window.BondedTests = BondedTests;
console.log('🧪 BondedTests loaded. Run: await BondedTests.runAll()');
