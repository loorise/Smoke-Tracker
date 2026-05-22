import { getPricePerCigarette, isProfileComplete } from '../../onboarding/utils/profile.js'
import { isLocalToday } from './date.js'
import { getSecondsSince } from './timer.js'

export function countCigarettesToday(events) {
  return events.filter((event) => isLocalToday(event.smoked_at)).length
}

export function getLatestEvent(events) {
  if (!events?.length) return null
  return events[0]
}

export function calcSavedRubles(events, user) {
  if (!isProfileComplete(user)) {
    return 0
  }

  const dailyTarget = Number(user.daily_target)
  const packPrice = Number(user.pack_price)
  const cigsPerPack = Number(user.cigs_per_pack)
  const pricePerCigarette = getPricePerCigarette(packPrice, cigsPerPack)

  const cigarettesToday = countCigarettesToday(events)
  const latest = getLatestEvent(events)
  const secondsSince = getSecondsSince(latest?.smoked_at)

  const minutesPerCigarette = (24 * 60) / dailyTarget
  const fromTimer =
    Math.floor(secondsSince / 60 / minutesPerCigarette) * pricePerCigarette
  const fromDaily = Math.max(0, dailyTarget - cigarettesToday) * pricePerCigarette

  return Math.round(fromTimer + fromDaily)
}

export function buildSmokingStats(events, user) {
  const latest = getLatestEvent(events)
  const cigarettesToday = countCigarettesToday(events)

  return {
    latest,
    cigarettesToday,
    lastSmokedAt: latest?.smoked_at ?? null,
    savedRubles: calcSavedRubles(events, user),
  }
}
