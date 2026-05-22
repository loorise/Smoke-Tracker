import { useState } from 'react'
import { useSmokingEvents } from '../smoking/hooks/useSmokingEvents.js'
import { formatSmokedAt } from '../smoking/utils/date.js'
import { hapticLight, hapticSuccess, hapticWarning } from '../../infra/telegram/telegramHaptic.js'
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.jsx'
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx'
import { Spinner } from '../../shared/ui/Spinner.jsx'
import { HistoryInsights } from './HistoryInsights.jsx'
import './HistoryPage.css'

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
        fill="currentColor"
      />
    </svg>
  )
}

export function HistoryPage() {
  const {
    events,
    insights,
    isLoading,
    isError,
    error,
    reload,
    deleteEvent,
    deletingId,
    isDeleting,
  } = useSmokingEvents()
  const [pendingDelete, setPendingDelete] = useState(null)

  const isConfirmLoading = pendingDelete !== null && deletingId === pendingDelete.id

  function handleRequestDelete(event) {
    hapticLight()
    setPendingDelete(event)
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || isDeleting) return

    hapticWarning()

    try {
      await deleteEvent(pendingDelete.id)
      hapticSuccess()
      setPendingDelete(null)
    } catch {
      // error surfaced via provider; keep dialog open for retry
    }
  }

  function handleCancelDelete() {
    if (isConfirmLoading) return
    hapticLight()
    setPendingDelete(null)
  }

  if (isLoading) {
    return (
      <section className="history history--centered">
        <Spinner label="Загрузка истории…" />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="history history--centered">
        <ErrorMessage
          message={error?.message ?? 'Не удалось загрузить историю'}
          onRetry={reload}
        />
      </section>
    )
  }

  return (
    <section className="history">
      <h1 className="page__title">История</h1>
      <p className="page__subtitle">
        {events.length > 0
          ? `${events.length} ${formatEventsLabel(events.length)}`
          : 'Пока нет записей'}
      </p>

      <HistoryInsights insights={insights} />

      {events.length === 0 ? (
        <div className="card history__empty">
          <p className="card__text">Нажмите «Покурил» на главной, чтобы добавить запись</p>
        </div>
      ) : (
        <ul className="history__list">
          {events.map((event) => {
            const isItemDeleting = deletingId === event.id

            return (
              <li key={event.id} className="history__item">
                <span className="history__item-time">{formatSmokedAt(event.smoked_at)}</span>
                <button
                  type="button"
                  className="history__delete-btn"
                  onClick={() => handleRequestDelete(event)}
                  disabled={isDeleting}
                  aria-label={`Удалить запись ${formatSmokedAt(event.smoked_at)}`}
                >
                  {isItemDeleting ? (
                    <span aria-hidden="true">…</span>
                  ) : (
                    <DeleteIcon />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить запись?"
        message={
          pendingDelete
            ? `Запись от ${formatSmokedAt(pendingDelete.smoked_at)} будет удалена без возможности восстановления.`
            : ''
        }
        confirmLabel="Удалить"
        isLoading={isConfirmLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  )
}

function formatEventsLabel(count) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return 'запись'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'записи'
  return 'записей'
}
