import { useCallback, useEffect, useRef, useState } from 'react'

// Load data from an API call and re-run it whenever `deps` change or reload() is called.
// `loading` is derived (no synchronous setState in effects); while reloading, the previous
// data stays available so pages can keep showing it.
export function useApi(fetcher, deps = []) {
  const [reloadCount, setReloadCount] = useState(0)
  const key = JSON.stringify([...deps, reloadCount])
  const [result, setResult] = useState({ key: null, data: null, error: '' })
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    fetcherRef.current()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: '' })
      })
      .catch((error) => {
        if (!cancelled) setResult((prev) => ({ key, data: prev.data, error: error.message || 'Something went wrong' }))
      })
    return () => { cancelled = true }
  }, [key])

  const reload = useCallback(() => setReloadCount((n) => n + 1), [])

  // Local update after a successful action, without refetching
  const setData = useCallback(
    (update) => setResult((prev) => ({ ...prev, data: typeof update === 'function' ? update(prev.data) : update })),
    []
  )

  return {
    data: result.data,
    error: result.key === key ? result.error : '',
    loading: result.key !== key,
    reload,
    setData,
  }
}
