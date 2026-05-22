import { useCallback, useEffect, useState } from 'react'
import { findUserByTelegramId } from '../../features/auth/services/usersService.js'
import { AuthContext } from '../../features/auth/hooks/useAuth.js'
import { useAuthBootstrap } from '../../features/auth/hooks/useAuthBootstrap.js'
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx'
import { Spinner } from '../../shared/ui/Spinner.jsx'
import './AuthProvider.css'

function BootstrapGate({ children, bootstrap }) {
  if (bootstrap.isReady) {
    return children
  }

  if (bootstrap.isError) {
    return (
      <div className="bootstrap-gate">
        <ErrorMessage
          message={bootstrap.error?.message ?? 'Не удалось войти'}
          onRetry={bootstrap.retry}
        />
      </div>
    )
  }

  return (
    <div className="bootstrap-gate">
      <Spinner label="Подключение…" />
    </div>
  )
}

export function AuthProvider({ children }) {
  const bootstrap = useAuthBootstrap()
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (bootstrap.isReady && bootstrap.user) {
      setUser(bootstrap.user)
      return
    }

    if (!bootstrap.isReady) {
      setUser(null)
    }
  }, [bootstrap.isReady, bootstrap.user])

  const contextUser = user ?? (bootstrap.isReady ? bootstrap.user : null)
  const isAuthReady = bootstrap.isReady && Boolean(contextUser?.telegram_id)

  const refreshUser = useCallback(async () => {
    const telegramId = contextUser?.telegram_id ?? bootstrap.user?.telegram_id

    if (!telegramId) {
      return null
    }

    const nextUser = await findUserByTelegramId(telegramId)
    setUser(nextUser)
    return nextUser
  }, [contextUser?.telegram_id, bootstrap.user?.telegram_id])

  return (
    <AuthContext.Provider value={{ user: contextUser, isAuthReady, refreshUser }}>
      <BootstrapGate bootstrap={bootstrap}>{children}</BootstrapGate>
    </AuthContext.Provider>
  )
}
