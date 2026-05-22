import { useCallback, useEffect, useState } from 'react'

/**
 * Загрузка данных: request → set state → rerender.
 * После мутации вызывайте reload() для свежих данных из Supabase.
 */
export function useAsyncResource(loadFn, deps = []) {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const result = await loadFn()
      setData(result)
      setStatus('success')
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setData(null)
      setStatus('error')
      throw err
    }
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  const runMutation = useCallback(
    async (mutateFn) => {
      await mutateFn()
      return reload()
    },
    [reload],
  )

  return {
    data,
    error,
    status,
    isLoading: status === 'loading' || status === 'idle',
    isError: status === 'error',
    isSuccess: status === 'success',
    reload,
    runMutation,
  }
}
