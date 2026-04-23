-- Ethereum/Base schema for RelationHack wallet auth, balance snapshots, transactions, and date stake intents.
-- Fresh migration timestamp ensures existing hackathon databases receive the EVM tables.

create extension if not exists "pgcrypto";

create table if not exists public.evm_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  address text not null,
  address_lower text not null,
  chain_id integer not null,
  is_primary boolean not null default false,
  display_wallet_value boolean not null default false,
  balance_visibility text not null default 'hidden' check (balance_visibility in ('hidden', 'range', 'exact')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chain_id, address_lower)
);

create unique index if not exists evm_wallets_one_primary_per_user
  on public.evm_wallets(user_id)
  where is_primary;

create table if not exists public.evm_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  address_lower text not null,
  chain_id integer not null,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (address_lower, chain_id, nonce)
);

create index if not exists evm_auth_challenges_lookup
  on public.evm_auth_challenges(address_lower, chain_id, nonce);

create table if not exists public.evm_auth_sessions (
  id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_id uuid not null references public.evm_wallets(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists evm_auth_sessions_user_active
  on public.evm_auth_sessions(user_id, expires_at)
  where revoked_at is null;

create table if not exists public.evm_balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_id uuid not null references public.evm_wallets(id) on delete cascade,
  address text not null,
  address_lower text not null,
  chain_id integer not null,
  wei text not null,
  ether text not null,
  symbol text not null,
  fetched_at timestamptz not null default now()
);

create index if not exists evm_balance_snapshots_recent
  on public.evm_balance_snapshots(user_id, wallet_id, chain_id, fetched_at desc);

create table if not exists public.evm_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  wallet_id uuid references public.evm_wallets(id) on delete set null,
  chain_id integer not null,
  hash text not null,
  hash_lower text not null,
  purpose text not null,
  related_id uuid,
  status text not null default 'submitted' check (status in ('submitted', 'pending', 'confirmed', 'failed')),
  block_number text,
  transaction_index integer,
  submitted_at timestamptz not null default now(),
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (chain_id, hash_lower)
);

create table if not exists public.evm_escrow_intents (
  id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_id uuid not null references public.evm_wallets(id) on delete cascade,
  date_id text not null,
  counterparty_address text not null,
  counterparty_address_lower text not null,
  chain_id integer not null,
  amount_wei text not null,
  escrow_address text not null,
  escrow_address_lower text not null,
  status text not null default 'created' check (status in ('created', 'submitted', 'pending', 'funded', 'failed')),
  funding_hash text,
  funding_hash_lower text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evm_escrow_intents_user_status
  on public.evm_escrow_intents(user_id, status, created_at desc);

create index if not exists evm_escrow_intents_transaction
  on public.evm_escrow_intents(chain_id, funding_hash_lower)
  where funding_hash_lower is not null;
