import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.js'
import {
  createSmokingEvent,
  deleteAllSmokingEvents,
  deleteSmokingEvent,
  fetchSmokingEvents,
} from '../services/smokingEventsService.js'
import { buildSmokingInsights } from '../utils/insights.js'
import { buildSmokingStats } from '../utils/stats.js'

export const SmokingEventsContext = createContext(null)

export function useSmokingEvents() {
  const value = useContext(SmokingEventsContext)

  if (!value) {
    throw new Error('useSmokingEvents must be used within SmokingEventsProvider')
  }

  return value
}

export function useSmokingEventsState(telegramId, user) {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [isClearingHistory, setIsClearingHistory] = useState(false)

  const mountedRef = useRef(true)
  const loadIdRef = useRef(0)

  const reload = useCallback(async () => {
    if (!telegramId) return

    const loadId = ++loadIdRef.current

    const finish = (updater) => {
      if (!mountedRef.current || loadIdRef.current !== loadId) return
      updater()
    }

    finish(() => {
      setStatus((prev) => (prev === 'ready' ? 'refreshing' : 'loading'))
      setError(null)
    })

    try {
      const data = await fetchSmokingEvents(telegramId)
      finish(() => {
        setEvents(data)
        setStatus('ready')
      })
    } catch (err) {
      finish(() => {
        setEvents([])
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus('error')
      })
    }
  }, [telegramId])

  useEffect(() => {
    mountedRef.current = true

    if (!telegramId) {
      setEvents([])
      setStatus('loading')
      return () => {
        mountedRef.current = false
        loadIdRef.current += 1
      }
    }

    reload()

    return () => {
      mountedRef.current = false
      loadIdRef.current += 1
    }
  }, [telegramId, reload])

  const recordSmoke = useCallback(async () => {
    if (!telegramId || isRecording) return

    setIsRecording(true)
    setError(null)

    try {
      await createSmokingEvent(telegramId)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    } finally {
      setIsRecording(false)
    }
  }, [telegramId, isRecording, reload])

  const deleteEvent = useCallback(
    async (eventId) => {
      if (!telegramId || deletingId) return

      setDeletingId(eventId)
      setError(null)

      try {
        await deleteSmokingEvent(eventId, telegramId)
        await reload()
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        throw err
      } finally {
        setDeletingId(null)
      }
    },
    [telegramId, deletingId, reload],
  )

  const deleteAllEvents = useCallback(async () => {
    if (!telegramId || isClearingHistory) return

    setIsClearingHistory(true)
    setError(null)

    try {
      await deleteAllSmokingEvents(telegramId)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    } finally {
      setIsClearingHistory(false)
    }
  }, [telegramId, isClearingHistory, reload])

  const stats = useMemo(
    () => buildSmokingStats(events, user ?? null),
    [events, user],
  )

  const insights = useMemo(
    () => buildSmokingInsights(events, user ?? null),
    [events, user],
  )

  return {
    events,
    stats,
    insights,
    error,
    status,
    isRecording,
    deletingId,
    isDeleting: deletingId !== null,
    isClearingHistory,
    isLoading: status === 'loading',
    isRefreshing: status === 'refreshing',
    isReady: status === 'ready',
    isError: status === 'error',
    reload,
    recordSmoke,
    deleteEvent,
    deleteAllEvents,
  }
}
