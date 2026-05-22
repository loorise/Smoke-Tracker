import {
  applyAppTheme,
  getSystemColorScheme,
  subscribeSystemTheme,
} from '../../app/styles/theme/themeBridge.js'

const DEFAULT_INSET = { top: 0, bottom: 0, left: 0, right: 0 }

let runtime = null

function getWebApp() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

export function isDevLocalhost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

function isInsideTelegram(webApp) {
  if (!webApp) return false
  if (webApp.initData?.length > 0) return true
  if (webApp.platform && webApp.platform !== 'unknown') return true
  return false
}

function applyChromeColors(webApp) {
  webApp.setHeaderColor('secondary_bg_color')
  webApp.setBackgroundColor('bg_color')
}

function applySafeAreaInsets(insets, contentInsets) {
  const root = document.documentElement
  const safe = { ...DEFAULT_INSET, ...insets }
  const content = { ...DEFAULT_INSET, ...contentInsets }

  root.style.setProperty('--tg-safe-top', `${safe.top}px`)
  root.style.setProperty('--tg-safe-right', `${safe.right}px`)
  root.style.setProperty('--tg-safe-bottom', `${safe.bottom}px`)
  root.style.setProperty('--tg-safe-left', `${safe.left}px`)
  root.style.setProperty('--tg-content-safe-top', `${content.top}px`)
  root.style.setProperty('--tg-content-safe-right', `${content.right}px`)
  root.style.setProperty('--tg-content-safe-bottom', `${content.bottom}px`)
  root.style.setProperty('--tg-content-safe-left', `${content.left}px`)
}

function applyBrowserSafeArea() {
  applySafeAreaInsets(DEFAULT_INSET, DEFAULT_INSET)
}

function bindTelegramEvents(webApp) {
  webApp.onEvent('themeChanged', () => {
    applyAppTheme(webApp.colorScheme)
    applyChromeColors(webApp)
  })

  webApp.onEvent('viewportChanged', () => {
    applySafeAreaInsets(webApp.safeAreaInset, webApp.contentSafeAreaInset)
  })
}

function setupTelegram(webApp) {
  document.documentElement.dataset.env = 'telegram'

  webApp.ready()
  webApp.expand()

  applyChromeColors(webApp)
  applyAppTheme(webApp.colorScheme)
  applySafeAreaInsets(webApp.safeAreaInset, webApp.contentSafeAreaInset)
  bindTelegramEvents(webApp)

  runtime = { mode: 'telegram', webApp, isLocalhost: isDevLocalhost() }
}

function setupBrowserFallback() {
  document.documentElement.dataset.env = 'browser'

  applyAppTheme(getSystemColorScheme())
  applyBrowserSafeArea()

  const unsubscribe = subscribeSystemTheme(applyAppTheme)

  runtime = {
    mode: 'browser',
    webApp: null,
    isLocalhost: isDevLocalhost(),
    dispose: unsubscribe,
  }
}

/**
 * Инициализация Telegram Mini App при старте приложения.
 * В обычном браузере (localhost) — fallback без auth и без Telegram API.
 */
export function initTelegramWebApp() {
  const webApp = getWebApp()

  if (webApp && isInsideTelegram(webApp)) {
    setupTelegram(webApp)
  } else {
    setupBrowserFallback()
  }

  document.documentElement.dataset.tgReady = 'true'
  return getTelegramWebAppRuntime()
}

export function getTelegramWebAppRuntime() {
  return runtime
}

export function isTelegramMiniApp() {
  return runtime?.mode === 'telegram'
}

export function isBrowserFallback() {
  return runtime?.mode === 'browser'
}
