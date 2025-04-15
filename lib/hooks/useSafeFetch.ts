import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { verifyTokenExpiration, refreshSession } from '@/lib/supabase'

// Global counter to track fetch attempts per session
// This helps prevent infinite loops in development or due to race conditions
const globalFetchCounter = {
  count: 0,
  maxPerSession: 10,
  reset() {
    this.count = 0;
  }
};

// Reset counter on page load
if (typeof window !== 'undefined') {
  globalFetchCounter.reset();
  
  // Écouter l'événement de rafraîchissement de token pour réinitialiser les compteurs
  window.addEventListener('klyra:token-refreshed', () => {
    console.log('🔄 Réinitialisation des compteurs après rafraîchissement de token');
    globalFetchCounter.reset();
  });
}

/**
 * A hook for safely fetching data even when Supabase session times out.
 * It attempts to fetch data as soon as user ID is available, with fallback mechanisms.
 *
 * Version améliorée: Vérifie proactivement l'expiration du token et le rafraîchit si nécessaire
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
  
  // Use refs to track fetch status and prevent unnecessary re-fetches
  const hasFetchedRef = useRef(false)
  const activeFetchRef = useRef(false)
  const lastFetchTimeRef = useRef(0)
  const userIdRef = useRef<string | null>(null)
  const fetchCountRef = useRef(0)
  const tokenRefreshedRef = useRef(false)
  
  // Extract only the user ID to avoid re-renders with full user object changes
  const userId = user?.id || null
  
  // Update the userIdRef when userId changes
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])
  
  // Écouter les événements de rafraîchissement de token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleTokenRefreshed = () => {
        console.log('🔄 Token rafraîchi, prêt à réessayer les requêtes');
        tokenRefreshedRef.current = true;
        // Réinitialiser les compteurs
        fetchCountRef.current = 0;
        setRetryCount(0);
        // Si nous avons déjà essayé de récupérer des données mais échoué, réessayer automatiquement
        if (error && userId) {
          setTimeout(() => {
            fetchData(true);
          }, 500);
        }
      };
      
      window.addEventListener('klyra:token-refreshed', handleTokenRefreshed);
      
      return () => {
        window.removeEventListener('klyra:token-refreshed', handleTokenRefreshed);
      };
    }
  }, [error, userId]);

  const fetchData = useCallback(async (withFallback = false) => {
    // Session-wide fetch limit to prevent infinite loops
    if (fetchCountRef.current > 5) {
      console.warn(`⚠️ Fetch count exceeded for this component instance (${fetchCountRef.current}), skipping to prevent loops`);
      return;
    }
    
    // Global fetch limit for all hooks to prevent app-wide fetch storms
    if (globalFetchCounter.count >= globalFetchCounter.maxPerSession) {
      console.error(`🛑 CRITICAL: Global fetch limit reached (${globalFetchCounter.count}/${globalFetchCounter.maxPerSession}). Possible infinite loop detected.`);
      return;
    }
    
    // Prevent concurrent fetches
    if (activeFetchRef.current) {
      console.log('🔄 Fetch already in progress, skipping');
      return;
    }
    
    // Rate limiting - don't fetch more than once per second unless it's a manual refetch
    const now = Date.now();
    if (!withFallback && now - lastFetchTimeRef.current < 1000) {
      console.log('🔄 Rate limiting fetch, skipping');
      return;
    }
    
    try {
      if (withFallback) {
        console.log(`🔁 Relance (${retryCount + 1}) du fetch de données car session échouée`);
      }
      
      activeFetchRef.current = true;
      lastFetchTimeRef.current = now;
      fetchCountRef.current += 1;
      globalFetchCounter.count += 1;
      
      console.log(`🔄 Fetch attempt ${fetchCountRef.current} (global: ${globalFetchCounter.count})`);
      
      // AMÉLIORATION: Vérifier proactivement l'expiration du token avant de récupérer les données
      if (typeof window !== 'undefined' && !tokenRefreshedRef.current) {
        const isTokenValid = verifyTokenExpiration();
        if (!isTokenValid) {
          console.log('⚠️ Token expiré ou proche de l\'expiration, tentative de rafraîchissement préventif');
          try {
            const refreshed = await refreshSession();
            if (refreshed) {
              console.log('✅ Token rafraîchi avec succès avant la requête');
              tokenRefreshedRef.current = true;
            } else {
              console.warn('⚠️ Échec du rafraîchissement préventif, tentative de requête quand même');
            }
          } catch (refreshError) {
            console.error('❌ Erreur lors du rafraîchissement préventif:', refreshError);
          }
        }
      }
      
      setIsLoading(true);
      
      const result = await fetchFunction();
      setData(result);
      setError(null);
      hasFetchedRef.current = true;
      tokenRefreshedRef.current = false;
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      
      // Increment retry count to track failures
      setRetryCount(prev => prev + 1);
      
      // AMÉLIORATION: En cas d'erreur, tenter un rafraîchissement du token avant de réessayer
      if (typeof window !== 'undefined' && retryCount === 0 && !tokenRefreshedRef.current) {
        console.log('🔄 Tentative de rafraîchissement de token après échec de requête');
        try {
          const refreshed = await refreshSession();
          if (refreshed) {
            console.log('✅ Token rafraîchi après échec, nouveau test dans 1s');
            tokenRefreshedRef.current = true;
            // Réessayer après un court délai
            setTimeout(() => {
              fetchData(true);
            }, 1000);
          } else {
            // Si le rafraîchissement échoue, tenter de recharger complètement l'état d'auth
            console.log('🔄 Rafraîchissement échoué, tentative de reloadAuthState');
            reloadAuthState().catch(e => console.error('Failed to reload auth state:', e));
          }
        } catch (refreshError) {
          console.error('❌ Erreur lors du rafraîchissement après échec:', refreshError);
        }
      } else if (retryCount >= 1) {
        console.log('🔄 Multiple fetch failures, attempting to reload auth state...');
        reloadAuthState().catch(e => console.error('Failed to reload auth state:', e));
      }
    } finally {
      setIsLoading(false);
      activeFetchRef.current = false;
    }
  }, [fetchFunction, retryCount, reloadAuthState]);

  // Main fetch effect - triggers when userId or stringified dependencies change
  // Using a dependency string to avoid re-fetching when only object references change
  const depsString = JSON.stringify(dependencies);
  
  useEffect(() => {
    // For admin pages, we need to ensure isAdmin is true before fetching
    // For regular pages, just check for user ID
    if (userId && !activeFetchRef.current && !hasFetchedRef.current) {
      fetchData();
    }
  }, [userId, depsString, fetchData]);

  // Fallback mechanism - if no data after 1.5 seconds despite having a user, try again
  useEffect(() => {
    // Only run one fallback fetch
    if (!data && userId && !isLoading && hasFetchedRef.current && fetchCountRef.current < 3) {
      const fallbackTimer = setTimeout(() => {
        fetchData(true); // true = with fallback logs
      }, 1500);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [data, userId, isLoading, fetchData]);

  // Additional retry for admin pages if first attempt fails
  useEffect(() => {
    // If we have user but no data and we're in error state, retry with backoff
    // But limit to max 3 retries
    if (userId && !data && error && retryCount < 3 && fetchCountRef.current < 5) {
      const retryTimer = setTimeout(() => {
        console.log(`⏱️ Retry attempt ${retryCount + 1} after error...`);
        fetchData(true);
      }, Math.min(1000 * retryCount, 3000)); // Backoff: 1s, 2s, 3s
      
      return () => clearTimeout(retryTimer);
    }
  }, [userId, data, error, retryCount, fetchData]);

  // Manual refetch function that always forces a new fetch
  const refetch = useCallback(() => {
    // Reset counters on manual refetch
    fetchCountRef.current = 0;
    hasFetchedRef.current = false;
    tokenRefreshedRef.current = false;
    // Allow a new set of fetches
    if (globalFetchCounter.count >= globalFetchCounter.maxPerSession) {
      console.log('🔄 Resetting global fetch counter after limit reached');
      globalFetchCounter.reset();
    }
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
} 