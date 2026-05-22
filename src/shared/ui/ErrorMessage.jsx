export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Повторить
        </button>
      ) : null}
    </div>
  )
}
