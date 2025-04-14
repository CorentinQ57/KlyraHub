import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'

/**
 * A hook for safely fetching data even when Supabase session times out.
 * It attempts to fetch data as soon as user ID is available, with fallback mechanisms.
 *
 * @param fetchFunction The function to call to fetch data
 * @param dependencies Additional dependencies that should trigger a refetch
 * @returns An object containing the fetched data, loading state, error state, and a refetch function
 */
export function useSafeFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { user, isAdmin, reloadAuthState } = useAuth()

  const fetchData = useCallback(async (withFallback = false) => {
    try {
      if (withFallback) {
        console.log(`🔁 Relance (${retryCount + 1}) du fetch de données car session échouée`)
      }
      
      setIsLoading(true)
      const result = await fetchFunction()
      setData(result)
      setError(null)
      // Reset retry count on success
      setRetryCount(0)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err : new Error('An unknown error occurred'))
      
      // Increment retry count to track failures
      setRetryCount(prev => prev + 1)
      
      // If we have multiple fetch failures, try to reload auth state
      if (retryCount >= 1) {
        console.log('🔄 Multiple fetch failures, attempting to reload auth state...')
        reloadAuthState().catch(e => console.error('Failed to reload auth state:', e))
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchFunction, retryCount, reloadAuthState])

  // Main fetch effect - triggers whenever user or dependencies change
  useEffect(() => {
    // For admin pages, we need to ensure isAdmin is true before fetching
    // For regular pages, just check for user ID
    if (user?.id) {
      fetchData()
    }
  }, [user?.id, isAdmin, fetchData, ...dependencies])

  // Fallback mechanism - if no data after 1.5 seconds despite having a user, try again
  useEffect(() => {
    if (!data && user?.id && !isLoading) {
      const fallbackTimer = setTimeout(() => {
        fetchData(true) // true = with fallback logs
      }, 1500)
      
      return () => clearTimeout(fallbackTimer)
    }
  }, [data, user?.id, isLoading, fetchData])

  // Additional retry for admin pages if first attempt fails
  useEffect(() => {
    // If we have user but no data and we're in error state, retry with backoff
    if (user?.id && !data && error && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`⏱️ Retry attempt ${retryCount + 1} after error...`)
        fetchData(true)
      }, Math.min(1000 * retryCount, 3000)) // Backoff: 1s, 2s, 3s
      
      return () => clearTimeout(retryTimer)
    }
  }, [user?.id, data, error, retryCount, fetchData])

  // Manual refetch function
  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch }
} 