import {
  getTelegramWebAppRuntime,
  isBrowserFallback,
  isDevLocalhost,
} from './telegramWebAppService.js'

const DEV_MOCK_USER = {
  id: 999000001,
  first_name: 'Dev',
  last_name: 'Local',
  username: 'dev_local',
  language_code: 'ru',
}

function getWebApp() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function normalizeTelegramUser(tgUser) {
  return {
    telegramId: Number(tgUser.id),
    username: tgUser.username ?? null,
    firstName: tgUser.first_name ?? null,
    lastName: tgUser.last_name ?? null,
  }
}

function getUserFromTelegramSdk() {
  const user = getWebApp()?.initDataUnsafe?.user
  if (!user?.id) {
    throw new Error('Telegram user is not available')
  }
  return normalizeTelegramUser(user)
}

function getDevMockUser() {
  if (!import.meta.env.DEV) {
    throw new Error('Dev mock user is only available in development')
  }
  if (!isDevLocalhost()) {
    throw new Error('Dev mock user is only available on localhost')
  }
  if (!isBrowserFallback()) {
    throw new Error('Dev mock user is only available outside Telegram')
  }

  console.info('[auth] Using development mock Telegram user')
  return normalizeTelegramUser(DEV_MOCK_USER)
}

/**
 * Telegram user for bootstrap. Real SDK in Telegram, mock on localhost dev only.
 */
export function getTelegramUserProfile() {
  const runtime = getTelegramWebAppRuntime()

  if (runtime?.mode === 'telegram') {
    return getUserFromTelegramSdk()
  }

  if (isBrowserFallback()) {
    return getDevMockUser()
  }

  throw new Error('Unable to resolve Telegram user profile')
}

/**
 * Display profile for Settings UI (Telegram SDK fields).
 */
export function getTelegramDisplayInfo() {
  const runtime = getTelegramWebAppRuntime()
  let tgUser = getWebApp()?.initDataUnsafe?.user

  if (!tgUser?.id && runtime?.mode !== 'telegram' && isBrowserFallback()) {
    if (import.meta.env.DEV && isDevLocalhost()) {
      tgUser = DEV_MOCK_USER
    }
  }

  if (!tgUser?.id) {
    return null
  }

  const username = tgUser.username ? `@${tgUser.username}` : null

  return {
    firstName: tgUser.first_name ?? '',
    lastName: tgUser.last_name ?? '',
    username,
    photoUrl: tgUser.photo_url ?? null,
  }
}
