export function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(seconds))

  if (safe < 60) {
    return `${safe} сек`
  }

  if (safe < 3600) {
    const minutes = Math.floor(safe / 60)
    return `${minutes} мин`
  }

  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)

  if (hours < 24) {
    return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`
  }

  const days = Math.floor(hours / 24)
  const restHours = hours % 24

  return restHours > 0 ? `${days} д ${restHours} ч` : `${days} д`
}
