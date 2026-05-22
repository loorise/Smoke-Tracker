import { useSmokingEvents } from '../smoking/hooks/useSmokingEvents.js'
import { useSmokeTimer } from '../smoking/hooks/useSmokeTimer.js'
import { hapticLight, hapticSuccess } from '../../infra/telegram/telegramHaptic.js'
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx'
import { Spinner } from '../../shared/ui/Spinner.jsx'
import './HomePage.css'

function formatRubles(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function TimerDisplay({ parts }) {
  return (
    <p className="home__timer" aria-live="polite" aria-label={`Таймер ${parts.label}`}>
      <span>{parts.hours}</span>
      <span className="home__timer-sep">:</span>
      <span>{parts.minutes}</span>
      <span className="home__timer-sep">:</span>
      <span>{parts.seconds}</span>
    </p>
  )
}

export function HomePage() {
  const {
    stats,
    isLoading,
    isError,
    isRecording,
    error,
    reload,
    recordSmoke,
  } = useSmokingEvents()

  const { parts } = useSmokeTimer(stats.lastSmokedAt)

  async function handleSmoke() {
    hapticLight()

    try {
      await recordSmoke()
      hapticSuccess()
    } catch {
      // error state handled in provider
    }
  }

  if (isLoading) {
    return (
      <div className="home home--centered">
        <Spinner label="Загрузка данных…" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="home home--centered">
        <ErrorMessage
          message={error?.message ?? 'Не удалось загрузить данные'}
          onRetry={reload}
        />
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home__top" aria-label={`Сигарет сегодня: ${stats.cigarettesToday}`}>
        <span className="home__top-label">Сегодня</span>
        <span className="home__top-value">{stats.cigarettesToday}</span>
      </div>

      <div className="home__hero">
        <TimerDisplay parts={parts} />
        <p className="home__saved">
          Сэкономлено <span className="home__saved-value">{formatRubles(stats.savedRubles)}</span>
        </p>
      </div>

      <div className="home__action-bar">
        <button
          type="button"
          className="home__action-btn"
          onClick={handleSmoke}
          disabled={isRecording}
        >
          {isRecording ? 'Сохранение…' : 'Покурил'}
        </button>
      </div>
    </div>
  )
}
