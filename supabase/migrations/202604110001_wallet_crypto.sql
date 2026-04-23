-- Initial wallet backend schema for RelationHack.
-- Creates the shared app user table used by the Ethereum wallet/auth migration that follows.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  primary_wallet_address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
