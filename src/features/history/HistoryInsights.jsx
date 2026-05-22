import { formatDuration } from '../smoking/utils/duration.js'

function formatRubles(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function StatItem({ label, value }) {
  return (
    <div className="history-insights__item">
      <span className="history-insights__label">{label}</span>
      <span className="history-insights__value">{value}</span>
    </div>
  )
}

export function HistoryInsights({ insights }) {
  const averageInterval = insights.hasEnoughForAverage
    ? formatDuration(insights.averageSmokingIntervalSeconds)
    : '—'

  const longestFree = insights.hasEvents
    ? formatDuration(insights.longestSmokeFreeSeconds)
    : '—'

  const totalFree = insights.hasEvents
    ? formatDuration(insights.totalSmokeFreeSeconds)
    : '—'

  const bestFree = insights.hasEvents
    ? formatDuration(insights.bestSmokeFreeSeconds)
    : '—'

  return (
    <section className="history-insights" aria-label="Статистика">
      <div className="history-insights__hero">
        <p className="history-insights__hero-label">Лучший результат</p>
        <p className="history-insights__hero-value">{bestFree}</p>
        <p className="history-insights__hero-hint">без курения</p>
      </div>

      <div className="history-insights__panel">
        <p className="history-insights__title">Статистика</p>
        <div className="history-insights__grid">
          <StatItem label="Средний интервал" value={averageInterval} />
          <StatItem label="Самый долгий период" value={longestFree} />
          <StatItem label="Всего без курения" value={totalFree} />
          <StatItem label="Сэкономлено сегодня" value={formatRubles(insights.savedTodayRubles)} />
          <StatItem label="Сэкономлено всего" value={formatRubles(insights.savedTotalRubles)} />
        </div>
      </div>
    </section>
  )
}
