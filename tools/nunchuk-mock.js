const args = process.argv.slice(2).map(a => a.replace(/^--/, ''));
const command = args[0] || 'help';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSign() {
  console.log(`\n===========================================`);
  console.log(`        NUNCHUK MULTISIG PIPELINE        `);
  console.log(`===========================================\n`);
  
  // Extract mock values from args or provide defaults
  let walletId = '<id>';
  let txId = '<id>';
  let fingerprint = '<xfp>';

  for(let i = 0; i < args.length; i++) {
    if(args[i] === 'wallet' && args[i+1]) walletId = args[i+1];
    if(args[i] === 'tx-id' && args[i+1]) txId = args[i+1];
    if(args[i] === 'fingerprint' && args[i+1]) fingerprint = args[i+1];
  }

  console.log(`> Target Wallet Config: [${walletId}] (2-of-3 Multisig)`);
  console.log(`> Target TXID: [${txId}]`);
  console.log(`> Key Fingerprint: [${fingerprint}]\n`);
  
  await sleep(800);
  console.log(`[+] Initializing hardware device communication protocols...`);
  await sleep(1200);
  console.log(`[+] Device with fingerprint ${fingerprint} detected successfully (Coldcard Mk4).`);
  await sleep(800);
  
  // Fake Progress Bar Simulation
  const total = 100;
  for(let i = 0; i <= 20; i++) {
    const filled = '█'.repeat(i);
    const empty = '░'.repeat(20 - i);
    const progressText = `\r[${filled}${empty}] Transmitting PSBT Data... ${i*5}% `;
    process.stdout.write(progressText);
    await sleep(Math.floor(Math.random() * 100) + 50);
  }
  
  console.log(`\n\n[+] Awaiting manual signature confirmation on hardware device...`);
  await sleep(2500); // Simulate user clicking button on hardware wallet
  
  console.log(`\n[+] Signature verified! Partial PSBT securely assembled.`);
  await sleep(500);
  console.log(`[+] Multisig Quorum Status: 1/2 signatures obtained.`);
  console.log(`[+] Ready to broadcast once quorum (2/2) is satisfied.`);
  console.log(`\nSuccess! Nunchuk pipeline execution complete.`);
  process.exit(0);
}

async function main() {
  switch(command) {
    case 'tx':
      if(args[1] === 'sign') {
        await runSign();
      } else {
        console.log('Unrecognized tx action. Try `tx sign`.');
      }
      break;
    default:
      console.log('Mock Nunchuk CLI for Hackathon');
      console.log('Usage: nunchuk tx sign --wallet <id> --tx-id <id> --fingerprint <xfp>');
      break;
  }
}

main().catch(console.error);
