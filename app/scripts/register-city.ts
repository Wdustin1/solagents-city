/**
 * One-time registration script for Sol Agents City on solagents.dev.
 *
 * Usage:
 *   npx tsx scripts/register-city.ts
 *
 * Reads .city-wallet.json for the treasury keypair, calls POST /register,
 * and prints the returned agent ID (add it to .env.local as CITY_AGENT_ID).
 */

import { readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { Keypair } from '@solana/web3.js';

const API_BASE = 'https://agent-sol-api-production.up.railway.app/api';

async function main() {
  const walletPath = join(__dirname, '..', '.city-wallet.json');
  const secretKey = JSON.parse(readFileSync(walletPath, 'utf-8')) as number[];
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  const walletAddress = keypair.publicKey.toBase58();

  console.log('Registering Sol Agents City...');
  console.log('Wallet:', walletAddress);

  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wallet-Address': walletAddress,
    },
    body: JSON.stringify({
      name: 'Sol Agents City',
      walletAddress,
      capabilities: ['code', 'research', 'data', 'design', 'content'],
      endpoint: 'https://solagents-city.vercel.app/api',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Registration failed:', res.status, body);
    process.exit(1);
  }

  const data = await res.json();
  console.log('\nRegistration successful!');
  console.log('Agent ID:', data.id);
  console.log('\nAdd the following to .env.local:');
  console.log(`CITY_AGENT_ID=${data.id}`);

  const envPath = join(__dirname, '..', '.env.local');
  appendFileSync(envPath, `\nCITY_AGENT_ID=${data.id}\n`);
  console.log('\n.env.local updated with CITY_AGENT_ID.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
