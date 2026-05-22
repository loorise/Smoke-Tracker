# Supabase Security

## Overview

The Mini App uses **Telegram `initData` verification** on the server and **Row Level Security (RLS)** scoped to `telegram_id` from the JWT.

Direct `anon` table access is **revoked**. Client requests must use an authenticated session from the `verify-telegram` Edge Function.

## Flow

1. Client sends `initData` (or `devTelegramId` in local dev) to `verify-telegram`
2. Edge Function validates HMAC with `TELEGRAM_BOT_TOKEN`
3. Function issues a Supabase JWT with claim `telegram_id`
4. Client calls `supabase.auth.setSession()`
5. PostgREST applies RLS: `telegram_id = current_telegram_id()`

## RLS policies

### `users` (includes profile/settings columns)

| Operation | Policy |
|-----------|--------|
| SELECT | own `telegram_id` only |
| INSERT | own `telegram_id` only |
| UPDATE | own `telegram_id` only |

### `smoking_events`

| Operation | Policy |
|-----------|--------|
| SELECT | own `telegram_id` only |
| INSERT | own `telegram_id` only |
| DELETE | own `telegram_id` only |

## Migrations

Apply in order, including:

- `20240522000004_harden_rls.sql` — removes unsafe anon policies, adds secure policies

## Edge Function secrets

Set in Supabase Dashboard → Edge Functions → Secrets:

| Secret | Required | Description |
|--------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes (prod) | Bot token from @BotFather |
| `JWT_SECRET` | Yes | Project JWT secret (Settings → API → JWT Secret) |
| `PROJECT_URL` | Yes | Project URL (e.g. `https://xxx.supabase.co`) |
| `ALLOW_DEV_TELEGRAM_AUTH` | Dev only | `true` to allow `devTelegramId` bypass on localhost |

## Deploy Edge Function

```bash
supabase functions deploy verify-telegram --no-verify-jwt
```

`--no-verify-jwt` is required so the client can call the function with the anon key before holding a user session.

## Security notes

- Never expose `TELEGRAM_BOT_TOKEN` or `JWT_SECRET` in the client
- `initData` older than 24 hours is rejected
- Cross-user reads/writes are blocked at the database layer
- Service role key must not ship in the Mini App bundle
