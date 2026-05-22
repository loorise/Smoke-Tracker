function getHaptic() {
  return window.Telegram?.WebApp?.HapticFeedback ?? null
}

export function hapticLight() {
  getHaptic()?.impactOccurred('light')
}

export function hapticMedium() {
  getHaptic()?.impactOccurred('medium')
}

export function hapticSuccess() {
  getHaptic()?.notificationOccurred('success')
}

export function hapticWarning() {
  getHaptic()?.notificationOccurred('warning')
}

export function hapticSelection() {
  getHaptic()?.selectionChanged()
}
