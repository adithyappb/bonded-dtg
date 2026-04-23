/**
 * walletManager.js — Provider-agnostic wallet singleton
 *
 * UI must ONLY call WalletManager.*  — never raw wallet logic directly.
 *
 * In demoMode (default true) all responses are instant mock confirmations.
 * When demoMode = false, a real EIP-1193 browser wallet is used.
 */
const WalletManager = (() => {
  const DEMO_MODE = true; // flip to false for real wallet

  // ── Demo Wallet Adapter ──────────────────────────────────────────
  const _demoAdapter = {
    id: 'demo',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance:  2.00, // ETH-equivalent

    connectWallet() {
      Logger.info('WalletManager: Demo wallet connecting…');
      return Promise.resolve({ address: this.address, balance: this.balance });
    },
    disconnectWallet() {
      Logger.info('WalletManager: Demo wallet disconnected');
      return Promise.resolve();
    },
    getAddress()  { return Promise.resolve(this.address); },
    getBalance()  { return Promise.resolve(this.balance); },
    signTransaction(txData) {
      Logger.info('WalletManager: Signing tx (demo)', txData);
      const fakeTxId = '0x' + Math.random().toString(16).slice(2, 18).padEnd(16, '0');
      return Promise.resolve({ txId: fakeTxId, status: 'signed' });
    },
    getTransactionStatus(txId) {
      Logger.info('WalletManager: Fetching tx status (demo)', txId);
      return Promise.resolve({ txId, status: 'confirmed', confirmations: 6 });
    },
    deduct(amount) {
      if (amount > this.balance) throw new Error('Insufficient balance');
      this.balance = parseFloat((this.balance - amount).toFixed(4));
      return this.balance;
    },
    credit(amount) {
      this.balance = parseFloat((this.balance + amount).toFixed(4));
      return this.balance;
    },
  };

  // ── Browser EIP-1193 Adapter (real wallet, future use) ───────────
  const _browserAdapter = {
    id: 'browser',
    connectWallet() {
      if (!window.ethereum) return Promise.reject(new Error('No browser wallet found.'));
      return window.ethereum.request({ method: 'eth_requestAccounts' }).then(accs => ({
        address: accs[0], balance: null,
      }));
    },
    disconnectWallet() { return Promise.resolve(); },
    getAddress() {
      return window.ethereum.request({ method: 'eth_accounts' }).then(a => a[0] ?? null);
    },
    getBalance() { return Promise.resolve(null); },
    signTransaction(txData) {
      const sig = window.ethereum.request({ method: 'eth_sendTransaction', params: [txData] });
      return sig.then(hash => ({ txId: hash, status: 'pending' }));
    },
    getTransactionStatus(txId) { return Promise.resolve({ txId, status: 'pending' }); },
  };

  // ── Active adapter selection ─────────────────────────────────────
  let _activeAdapter = DEMO_MODE ? _demoAdapter : _browserAdapter;
  let _connected = false;

  // ── Public API ───────────────────────────────────────────────────
  async function connectWallet() {
    try {
      StateManager.writeState({ walletState: { status: 'connecting', address: null, balance: 0 } });
      const result = await _activeAdapter.connectWallet();
      _connected = true;
      StateManager.writeState({
        walletState: { status: 'connected', address: result.address, balance: result.balance ?? _demoAdapter.balance },
      });
      Logger.success('WalletManager: Connected', result.address);
      return result;
    } catch (err) {
      StateManager.writeState({ walletState: { status: 'error', address: null, balance: 0 } });
      Logger.error('WalletManager: Connect failed', err.message);
      throw err;
    }
  }

  async function disconnectWallet() {
    await _activeAdapter.disconnectWallet();
    _connected = false;
    StateManager.writeState({ walletState: { status: 'disconnected', address: null, balance: 0 } });
  }

  function getAddress()               { return _activeAdapter.getAddress(); }
  function getBalance()               { return _activeAdapter.getBalance(); }
  function signTransaction(txData)    { return _activeAdapter.signTransaction(txData); }
  function getTransactionStatus(txId) { return _activeAdapter.getTransactionStatus(txId); }
  function isConnected()              { return _connected; }

  /** Deduct from demo balance and sync state */
  function deductBalance(amount) {
    if (!DEMO_MODE) throw new Error('deductBalance only available in demo mode');
    const newBal = _demoAdapter.deduct(amount);
    StateManager.writeState({ walletState: { ...StateManager.readState().walletState, balance: newBal } });
    Logger.info(`WalletManager: Deducted ${amount} ETH. New balance: ${newBal}`);
    return newBal;
  }

  function creditBalance(amount) {
    if (!DEMO_MODE) throw new Error('creditBalance only available in demo mode');
    const newBal = _demoAdapter.credit(amount);
    StateManager.writeState({ walletState: { ...StateManager.readState().walletState, balance: newBal } });
    Logger.info(`WalletManager: Credited ${amount} ETH. New balance: ${newBal}`);
    return newBal;
  }

  /** Switch adapter without changing UI */
  function setAdapter(adapterId) {
    _activeAdapter = adapterId === 'browser' ? _browserAdapter : _demoAdapter;
    Logger.info(`WalletManager: Switched adapter to "${adapterId}"`);
  }

  return {
    connectWallet, disconnectWallet,
    getAddress, getBalance, signTransaction, getTransactionStatus,
    isConnected, deductBalance, creditBalance, setAdapter,
    get currentBalance() { return DEMO_MODE ? _demoAdapter.balance : null; },
  };
})();

window.WalletManager = WalletManager;
