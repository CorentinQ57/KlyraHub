import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'

/**
 * A hook for safely fetching data even when Supabase session times out.
 * It attempts to fetch data as soon as user ID is available, with fallback mechanisms.
 *
 * @param fetchFunction The function to call to fetch data, which should accept a user ID
 * @param dependencies Additional dependencies that should trigger a refetch
 * @returns An object containing the fetched data, loading state, error state, and a refetch function
 */
export function useSafeFetch<T>(
  fetchFunction: (userId: string) => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchData = useCallback(async (withFallback = false) => {
    if (!user?.id) return

    try {
      if (withFallback) {
        console.log("🔁 Relance manuelle du fetch de données car session échouée")
      }
      
      setIsLoading(true)
      const result = await fetchFunction(user.id)
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, fetchFunction])

  // Main fetch effect - triggers whenever user or dependencies change
  useEffect(() => {
    if (user?.id || user?.email) {
      fetchData()
    }
  }, [user?.id, user?.email, fetchData, ...dependencies])

  // Fallback mechanism - if no data after 2 seconds despite having a user, try again
  useEffect(() => {
    if (!data && user?.id && !isLoading) {
      const fallbackTimer = setTimeout(() => {
        fetchData(true) // true = with fallback logs
      }, 2000)
      
      return () => clearTimeout(fallbackTimer)
    }
  }, [data, user?.id, isLoading, fetchData])

  // Manual refetch function
  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch }
} 