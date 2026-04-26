import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCached, getCached, invalidate } from '../apiCache.js'

export function useApi(url, { refreshInterval } = {}) {
  const [data, setData] = useState(() => getCached(url))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!getCached(url))
  const intervalRef = useRef(null)

  const run = useCallback(async (force = false) => {
    if (force) invalidate(url)
    setLoading(prev => prev || !getCached(url))
    try {
      const result = await fetchCached(url)
      setData(result)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    run()
    if (!refreshInterval) return
    intervalRef.current = setInterval(() => run(), refreshInterval)
    return () => clearInterval(intervalRef.current)
  }, [run, refreshInterval])

  const refresh = useCallback(() => run(true), [run])

  return { data, error, loading, refresh }
}
