create table if not exists public.evm_payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_id uuid not null references public.evm_wallets(id) on delete cascade,
  purpose text not null check (purpose in (
    'premium_subscription',
    'profile_boost',
    'matchmaker_reward',
    'split_bill',
    'relationship_agreement',
    'date_stake',
    'generic_payment'
  )),
  related_id text,
  chain_id integer not null,
  from_address text not null,
  to_address text not null,
  amount_wei numeric(78, 0) not null check (amount_wei > 0),
  currency text not null default 'ETH',
  status text not null default 'created' check (status in ('created', 'broadcast', 'confirmed', 'failed')),
  tx_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evm_payment_intents_user_idx on public.evm_payment_intents(user_id, created_at desc);
create index if not exists evm_payment_intents_tx_idx on public.evm_payment_intents(chain_id, tx_hash);

create table if not exists public.nft_collections (
  id uuid primary key default gen_random_uuid(),
  chain_id integer not null,
  name text not null,
  symbol text not null,
  contract_address text,
  collection_type text not null check (collection_type in ('achievement_badge', 'reputation_anchor', 'relationship_agreement')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(chain_id, collection_type)
);

create table if not exists public.nft_mint_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  wallet_id uuid not null references public.evm_wallets(id) on delete cascade,
  profile_id text not null,
  achievement_id text,
  chain_id integer not null,
  recipient_address text not null,
  contract_address text,
  token_uri text not null,
  status text not null default 'created' check (status in ('created', 'broadcast', 'minted', 'failed')),
  mint_hash text,
  token_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nft_mint_intents_user_idx on public.nft_mint_intents(user_id, created_at desc);
create index if not exists nft_mint_intents_profile_idx on public.nft_mint_intents(profile_id, created_at desc);
create index if not exists nft_mint_intents_hash_idx on public.nft_mint_intents(chain_id, mint_hash);

create table if not exists public.nft_ownership_claims (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  wallet_address text not null,
  chain_id integer not null,
  contract_address text not null,
  token_id text not null,
  token_uri text not null,
  source_mint_intent_id uuid references public.nft_mint_intents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(chain_id, contract_address, token_id)
);

create index if not exists nft_ownership_claims_profile_idx on public.nft_ownership_claims(profile_id, created_at desc);
