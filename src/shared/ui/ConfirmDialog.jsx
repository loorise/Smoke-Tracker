import './ConfirmDialog.css'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button
        type="button"
        className="confirm-dialog__backdrop"
        aria-label="Закрыть"
        onClick={onCancel}
        disabled={isLoading}
      />
      <div className="confirm-dialog__panel">
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--ghost confirm-dialog__btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn confirm-dialog__btn confirm-dialog__btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Удаление…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
