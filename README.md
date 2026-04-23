# Bonded Project

Monorepo combining the **Bonded** stake-native dating experience (UI, staking logic, Bitcoin stack, stress tests) with the **crypto-dating** backend surface (Fastify API, Supabase SQL migrations for wallet/crypto/NFT flows, on-chain payment and mint intents).

## What you get

- **Next.js app** (`apps/web`): landing page, wallet onboarding, discovery, messaging, matchmaker, date staking, premium demo, dev **email + OTP** auth (terminal + optional Mailpit).
- **API** (`apps/web` + `apps/api`): browser EVM wallet **dev-login** session for NFT mint and ETH payment demo flows on the Premium page.
- **Workers / packages** (`services/*`, `packages/*`): indexer, notifications, AI compatibility, shared domain types.
- **Supabase**: config and **migrations** for Ethereum wallet + NFT metadata (from the legacy crypto-dating stack).

## Fresh Git repository

This folder is meant to be initialized as a **new** repository (no history from the old project names):

```bash
cd bonded-project-main
git init
git add .
git commit -m "Initial import: Bonded + crypto API and migrations"
git branch -M main
git remote add origin <your-new-remote-url>
git push -u origin main
```

## Prerequisites

- **Node.js** 20+ (22 LTS recommended)
- **npm** 10+
- Optional: **Docker** (for Mailpit or Supabase local), **Supabase CLI** for migrations

## Install

From the repository root:

```bash
npm install
```

This installs all workspaces (`apps/*`, `packages/*`, `services/*`).

## Environment variables

1. Copy the root template:

   ```bash
   cp .env.example .env
   ```

2. Copy web and API templates:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   ```

3. Fill values using the sections below. **Never commit** `.env`, `.env.local`, or real keys.

### Supabase

1. Create a project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **Project Settings → API**.
3. Copy **Project URL** → `SUPABASE_URL`.
4. Copy **service_role** key (server only) → `SUPABASE_SERVICE_ROLE_KEY` in `apps/api/.env`.  
   - The **anon** key is for client-side Supabase clients (not used by default in this API-first path).  
5. Run migrations from `supabase/migrations` with the Supabase CLI (`supabase db push` or linked project workflow). See `docs/operations/supabase-local.md`.

### API JWT (`apps/api`)

Set `API_JWT_SECRET` to a long random string (32+ bytes). The API issues bearer tokens to the web client after wallet dev-login or signature verification.

### Coinbase / CDP (optional)

If you integrate [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) for hosted wallets or data, create an API key in the portal and map keys to the variables expected in `apps/api/src/config/env.ts` (names vary by feature—search the codebase for `CDP` / `COINBASE`).

### Nunchuk (Bitcoin)

Nunchuk credentials come from your Nunchuk developer or organization setup. The web app uses a configurable wallet adapter; mock scripts live in `tools/nunchuk-mock.js` for local demos without real keys.

### Cogcoin / custom token mocks

Use `npm run cogcoin` from the repo root to run the mock described in existing docs/tools. Production token economics belong in environment-specific config, not in git.

### Next.js public API URL

In `apps/web/.env.local`:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` when the API runs locally.

---

## Development email + OTP (2FA-style, **dev only**)

**Not suitable for production.** Intended for hackathon / local work.

1. Set `AUTH_DEV_SECRET` in `apps/web/.env.local` (and optionally the same in root `.env` if you centralize).
2. Start the web app (`npm run dev`). OTPs are printed to the **terminal** running Next.js:

   `[Bonded dev auth] OTP for you@example.com: 123456`

3. Optional **local SMTP** (e.g. [Mailpit](https://github.com/axllent/mailpit)): run Mailpit, then set `SMTP_HOST`, `SMTP_PORT`, etc. in `apps/web/.env.local`. If SMTP fails, the OTP is still in the terminal.

4. Open **Email + OTP (dev only)** on the home page or go to `/auth/email`.

**Production:** replace this with a hosted identity provider (Auth0, Clerk, Cognito, Supabase Auth, etc.) and transactional email (Resend, Postmark, SES). Remove or gate `ALLOW_DEV_EMAIL_AUTH` so dev routes cannot run in prod.

---

## Run

**Terminal 1 — web**

```bash
npm run dev
```

Opens Next on port **3000** (see `scripts/ensure-port-free.js`).

**Terminal 2 — API** (needed for Premium on-chain demo + wallet dev-login)

```bash
npm run dev:api
```

Default API port is in `apps/api` config (commonly **4000**).

**Optional mocks** (from root `package.json`):

```bash
npm run cogcoin
npm run nunchuk
```

---

## Tests

```bash
npm run test:web
npm run test:api
```

The web app includes Vitest coverage for staking rules, trust, stress flows, and **dev email auth** helpers.

---

## Directory map

| Path | Role |
|------|------|
| `apps/web` | Next.js UI |
| `apps/api` | Fastify REST API |
| `apps/contracts` | Policies, scripts, fixtures (no npm package) |
| `packages/shared` | Shared types (placeholder manifest) |
| `services/indexer` | Chain event projections |
| `supabase` | Migrations, seed, CLI config |
| `docs` | Product, security, operations |
| `infra` | Docker, Terraform, Render, Vercel notes |

---

## License and credits

Built for demonstration and hackathon use. Review `docs/security/` before any production deployment. UI **Bonded** branding and flows are preserved alongside **crypto-dating** data and API capabilities in this merged tree.

## Legacy folders

If a leftover `crypto-dating` directory still appears next to `bonded-project-main` (for example `bonded-proj` locked by OneDrive or an editor), close every program using that path, pause OneDrive sync for the folder if needed, then delete it manually in Explorer or with `cmd /c rd /s /q "<path>"`. The canonical tree is **`bonded-project-main` only**.
