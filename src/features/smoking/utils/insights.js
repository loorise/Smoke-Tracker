import { getPricePerCigarette, isProfileComplete } from '../../onboarding/utils/profile.js'
import { calcSavedRubles } from './stats.js'

function sortEventsAsc(events) {
  return [...events].sort(
    (a, b) => new Date(a.smoked_at).getTime() - new Date(b.smoked_at).getTime(),
  )
}

function getBetweenSmokeIntervalsSeconds(events) {
  const asc = sortEventsAsc(events)
  const intervals = []

  for (let i = 0; i < asc.length - 1; i += 1) {
    const start = new Date(asc[i].smoked_at).getTime()
    const end = new Date(asc[i + 1].smoked_at).getTime()
    intervals.push(Math.max(0, Math.floor((end - start) / 1000)))
  }

  return intervals
}

function getSmokeFreeGapsSeconds(events) {
  const between = getBetweenSmokeIntervalsSeconds(events)
  const asc = sortEventsAsc(events)

  if (asc.length === 0) {
    return []
  }

  const now = Date.now()
  const last = new Date(asc[asc.length - 1].smoked_at).getTime()
  const currentGap = Math.max(0, Math.floor((now - last) / 1000))

  return [...between, currentGap]
}

function calcMoneyFromSmokeFreeSeconds(seconds, user) {
  if (!isProfileComplete(user) || seconds <= 0) {
    return 0
  }

  const dailyTarget = Number(user.daily_target)
  const pricePerCigarette = getPricePerCigarette(
    Number(user.pack_price),
    Number(user.cigs_per_pack),
  )
  const secondsPerCigarette = (24 * 60 * 60) / dailyTarget
  const virtualCigarettes = seconds / secondsPerCigarette

  return Math.round(virtualCigarettes * pricePerCigarette)
}

export function buildSmokingInsights(events, user) {
  const list = events ?? []
  const betweenIntervals = getBetweenSmokeIntervalsSeconds(list)
  const smokeFreeGaps = getSmokeFreeGapsSeconds(list)

  const averageSmokingIntervalSeconds =
    betweenIntervals.length > 0
      ? Math.round(
          betweenIntervals.reduce((sum, value) => sum + value, 0) / betweenIntervals.length,
        )
      : null

  const longestSmokeFreeSeconds =
    smokeFreeGaps.length > 0 ? Math.max(...smokeFreeGaps) : 0

  const totalSmokeFreeSeconds = smokeFreeGaps.reduce((sum, value) => sum + value, 0)

  const savedTodayRubles = isProfileComplete(user) ? calcSavedRubles(list, user) : 0
  const savedTotalRubles = isProfileComplete(user)
    ? calcMoneyFromSmokeFreeSeconds(totalSmokeFreeSeconds, user)
    : 0

  return {
    averageSmokingIntervalSeconds,
    longestSmokeFreeSeconds,
    totalSmokeFreeSeconds,
    bestSmokeFreeSeconds: longestSmokeFreeSeconds,
    savedTodayRubles,
    savedTotalRubles,
    hasEnoughForAverage: betweenIntervals.length > 0,
    hasEvents: list.length > 0,
  }
}
