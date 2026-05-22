import { SmokingEventsContext, useSmokingEventsState } from '../../features/smoking/hooks/useSmokingEvents.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { Spinner } from '../../shared/ui/Spinner.jsx'
import './AuthProvider.css'

function SmokingEventsProviderReady({ user, children }) {
  const value = useSmokingEventsState(user.telegram_id, user)

  return (
    <SmokingEventsContext.Provider value={value}>{children}</SmokingEventsContext.Provider>
  )
}

export function SmokingEventsProvider({ children }) {
  const { user, isAuthReady } = useAuth()

  if (!isAuthReady || !user?.telegram_id) {
    return (
      <div className="bootstrap-gate">
        <Spinner label="Загрузка данных…" />
      </div>
    )
  }

  return <SmokingEventsProviderReady user={user}>{children}</SmokingEventsProviderReady>
}
