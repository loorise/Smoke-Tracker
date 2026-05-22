# Smoke Tracker — Telegram Mini App

Трекинг курения. React + Vite + Supabase + Telegram WebApp SDK.

## Архитектура

- **Source of truth:** только Supabase
- **Паттерн:** `await request` → `fetch fresh data` → `rerender`
- Без realtime, optimistic updates, Redux, TypeScript

```
src/
  app/
    layout/      — AppLayout, BottomNav
    routes.jsx   — React Router
    styles/      — global.css (темы light/dark)
    providers/
  features/
    home/        — HomePage
    history/     — HistoryPage
  lib/           — supabase client, env validation
  features/auth/     — bootstrap, users service
  features/smoking/  — events service, stats, hooks
  infra/telegram/telegramAuthService.js — Telegram user profile
  shared/        — hooks, ui (на следующих шагах)
  app/styles/theme/tokens.css — semantic CSS tokens (light/dark)
  app/styles/theme/themeBridge.js — data-theme (без React Context)
  infra/telegram/telegramWebAppService.js — SDK init, тема, safe area
```

## Быстрый старт

```bash
cp .env.example .env
# заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Переменные (Vite):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Project URL из Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

Клиент: `src/lib/supabase.js`.

### Supabase migration

```bash
# примените миграции в SQL Editor:
# supabase/migrations/20240522000000_users.sql
# supabase/migrations/20240522000001_smoking_events.sql
# supabase/migrations/20240522000002_smoking_events_delete.sql
# supabase/migrations/20240522000003_user_preferences.sql
```

### Auth bootstrap

При старте: Telegram user → `users` по `telegram_id` → create если нет.

- **Telegram:** user из WebApp SDK
- **localhost dev:** mock user (`telegram_id: 999000001`), только `import.meta.env.DEV`

Откройте в Telegram через BotFather → Menu Button / Web App URL (для локальной разработки используйте ngrok/cloudflared).

## Скрипты

| Команда        | Описание        |
|----------------|-----------------|
| `npm run dev`  | dev-сервер      |
| `npm run build`| production build|
| `npm run preview` | preview build |
