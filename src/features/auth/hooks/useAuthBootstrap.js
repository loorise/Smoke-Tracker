import { useCallback, useEffect, useRef, useState } from 'react'
import { initTelegramWebApp } from '../../../infra/telegram/telegramWebAppService.js'
import { getTelegramUserProfile } from '../../../infra/telegram/telegramAuthService.js'
import { bootstrapCurrentUser } from '../services/authBootstrapService.js'

const BOOTSTRAP_TIMEOUT_MS = 15_000

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Превышено время ожидания подключения'))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

async function executeBootstrap() {
  initTelegramWebApp()
  const profile = getTelegramUserProfile()
  return bootstrapCurrentUser(profile)
}

export function useAuthBootstrap() {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  const mountedRef = useRef(true)
  const runIdRef = useRef(0)

  const runBootstrap = useCallback(async () => {
    const runId = ++runIdRef.current

    const isActive = () => mountedRef.current && runIdRef.current === runId

    const finish = (updater) => {
      if (!isActive()) return
      updater()
    }

    finish(() => {
      setStatus('loading')
      setError(null)
    })

    try {
      const currentUser = await withTimeout(executeBootstrap(), BOOTSTRAP_TIMEOUT_MS)

      finish(() => {
        setUser(currentUser)
        setStatus('ready')
      })
    } catch (err) {
      finish(() => {
        setUser(null)
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus('error')
      })
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    runBootstrap()

    return () => {
      mountedRef.current = false
      runIdRef.current += 1
    }
  }, [runBootstrap])

  const isReady = status === 'ready' && Boolean(user)
  const isLoading = status === 'loading' || (status === 'ready' && !user)

  return {
    user,
    error,
    status,
    isLoading,
    isReady,
    isError: status === 'error',
    retry: runBootstrap,
  }
}
