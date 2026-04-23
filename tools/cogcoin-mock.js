const fs = require('fs');

const args = process.argv.slice(2).map(a => a.replace(/^--/, ''));
const command = args[0] || 'help';

// Simulated delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSync() {
  console.log(` _____                                                                    _____ `);
  console.log(`( ___ )                   Here comes the mining train!                   ( ___ )`);
  console.log(` |   |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   | `);
  console.log(` |   |                                                                    |   |   `);
  console.log(` |   |                                                                    |   |   `);
  console.log(` |___|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|___|   `);
  console.log(`(_____)                Downloading snapshot to 910000..                  (_____)  `);
  console.log(` _____                                                                    _____   `);
  console.log(`( ___ )                       ⛭  C O G C O I N  ⛭                        ( ___ )  `);
  console.log(` |   |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|   |   `);
  console.log(` |   |                                                                    |   |   `);
  console.log(` |   |   "Any man who keeps working is not a failure. He may not be a     |   |   `);
  console.log(` |   |   great writer, but if he applies the old-fashioned virtues of     |   |   `);
  console.log(` |   |  hard, constant labor, he'll eventually make some kind of career   |   |   `);
  console.log(` |   |  for himself as a writer."                                         |   |   `);
  console.log(` |   |                                                                    |   |   `);
  console.log(` |   |                          - Ray Bradbury                            |   |   `);
  console.log(` |   |                                                                    |   |   `);
  console.log(` |___|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|___|   `);
  console.log(`(_____)                    Syncing Bitcoin Blocks.                       (_____)  `);
  console.log('');

  // Fake Progress Bar Simulation
  const total = 910000;
  for(let i = 0; i <= 20; i++) {
    const filled = '█'.repeat(i);
    const empty = '░'.repeat(20 - i);
    const progressText = `\r[${filled}${empty}] Headers ${(total * (i/20)).toLocaleString()} / ${total.toLocaleString()} Verified peers... `;
    process.stdout.write(progressText);
    await sleep(Math.floor(Math.random() * 200) + 100);
  }
  
  console.log('\n\nApplied blocks: 910000');
  console.log('Rewound blocks: 0');
  console.log('Indexed ending height: 910000');
  console.log('Node best height: 910000');
  console.log('Sync Complete! Hackathon mode initialized.');
  process.exit(0);
}

async function runMine() {
  console.log('⛭  C O G C O I N  ⛭ Mining Initialized');
  console.log('Generating Proof-of-Work locally... (HACKATHON MODE)');
  for(let i=1; i<=10; i++) {
    await sleep(500);
    console.log(`Found nonce: ${Math.floor(Math.random()*1000000000)} | OpReturn Candidate Generated`);
  }
}

async function main() {
  switch(command) {
    case 'sync':
      await runSync();
      break;
    case 'mine':
    case 'mine-start':
      await runMine();
      break;
    case 'status':
      console.log('Wallet: Locked\nBlock height: 910000\nPeers: 8\nStatus: Synced');
      break;
    case 'wallet':
      if (args[1] === 'address') {
        console.log('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
      } else {
        console.log('Wallet command recognized.');
      }
      break;
    default:
      console.log('Mock Cogcoin CLI for Hackathon');
      console.log('Available mock commands: sync, status, mine, wallet address');
      break;
  }
}

main().catch(console.error);
