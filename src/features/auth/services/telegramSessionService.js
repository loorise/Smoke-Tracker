import { supabase } from '../../../lib/supabase.js'
import { getInitData, isBrowserFallback, isDevLocalhost } from '../../../infra/telegram/telegramWebAppService.js'

function canUseDevAuth(profile) {
  return (
    import.meta.env.DEV &&
    isBrowserFallback() &&
    isDevLocalhost() &&
    Number.isFinite(profile?.telegramId)
  )
}

export async function authenticateTelegramSession(profile) {
  const initData = getInitData()
  const useDevAuth = canUseDevAuth(profile)

  if (!useDevAuth && !initData) {
    throw new Error('Telegram initData is missing. Open the app inside Telegram.')
  }

  const body = useDevAuth
    ? { devTelegramId: profile.telegramId }
    : { initData }

  const { data, error } = await supabase.functions.invoke('verify-telegram', {
    body,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data?.error) {
    throw new Error(String(data.error))
  }

  if (!data?.access_token) {
    throw new Error('Telegram session token was not returned')
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? data.access_token,
  })

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  return data
}
