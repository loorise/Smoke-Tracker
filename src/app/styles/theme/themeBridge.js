/**
 * Устанавливает light/dark на <html>.
 * В Telegram цвета приходят из --tg-theme-* (SDK), в браузере — из CSS palette.
 */
export function applyAppTheme(scheme) {
  const theme = scheme === 'light' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
}

export function getSystemColorScheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function subscribeSystemTheme(onChange) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (event) => onChange(event.matches ? 'dark' : 'light')
  media.addEventListener('change', handler)
  return () => media.removeEventListener('change', handler)
}
