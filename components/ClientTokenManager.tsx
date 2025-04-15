"use client"

import { useEffect, useState, useRef } from 'react'
import { enforceTokenStorage } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@supabase/supabase-js'

// Variable globale pour suivre si une tentative de récupération de session a été faite
let hasAttemptedPreloadSession = false;

// Fonction pour précharger la session avant même le démarrage de l'application
if (typeof window !== 'undefined' && !hasAttemptedPreloadSession) {
  hasAttemptedPreloadSession = true;
  
  // Ajouter une petite fonction pour précharger la session sans attendre
  (async () => {
    console.log("🔄 Preloading session from ClientTokenManager");
    try {
      // Vérifier si des tokens sont disponibles dans localStorage ou cookies
      const accessToken = localStorage.getItem('sb-access-token') || 
                       localStorage.getItem('supabase.auth.token') ||
                       localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      
      if (accessToken) {
        console.log("🔑 Found access token, enforcing storage before auth provider init");
        enforceTokenStorage();
        
        // Précharger la session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Error preloading session:", error);
        } else if (data?.session) {
          console.log("✅ Successfully preloaded session for:", data.session.user?.email);
        } else {
          console.log("⚠️ No valid session found in preload");
        }
      } else {
        console.log("⚠️ No access token found during preload");
      }
    } catch (error) {
      console.error("❌ Error in session preload:", error);
    }
  })();
}

export default function ClientTokenManager() {
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const sessionCheckInProgress = useRef(false)
  const mountedRef = useRef(false)
  const initializationAttempted = useRef(false)
  const retryCount = useRef(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000
  
  const checkSession = async () => {
    if (sessionCheckInProgress.current || !mountedRef.current) {
      console.error('[ClientTokenManager] Session check skipped:', {
        sessionCheckInProgress: sessionCheckInProgress.current,
        mounted: mountedRef.current
      })
      return
    }
    
    sessionCheckInProgress.current = true
    
    try {
      console.error('[ClientTokenManager] Starting session check')
      
      // Attendre que le DOM soit complètement chargé
      if (document.readyState !== 'complete') {
        console.error('[ClientTokenManager] DOM not ready, waiting...')
        await new Promise(resolve => {
          window.addEventListener('load', resolve, { once: true })
        })
      }
      
      // Vérifier si des tokens sont disponibles
      const accessToken = localStorage.getItem('sb-access-token') || 
                       localStorage.getItem('supabase.auth.token') ||
                       localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`)
      
      if (!accessToken) {
        console.error('[ClientTokenManager] No access token found')
        setSessionLoaded(true)
        return
      }
      
      console.error('[ClientTokenManager] Access token found, checking refresh')
      
      // Vérifier si le token a besoin d'être rafraîchi
      const lastRefresh = localStorage.getItem('sb-token-last-refresh')
      const now = Date.now()
      const refreshInterval = 30 * 60 * 1000
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > refreshInterval) {
        console.error('[ClientTokenManager] Token refresh needed')
        const tokenUpdated = enforceTokenStorage()
        if (!tokenUpdated) {
          throw new Error('Token refresh failed')
        }
        console.error('[ClientTokenManager] Token refreshed successfully')
      }
      
      // Vérifier la session avec un timeout plus long
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session check timeout'))
        }, 10000)
        return () => clearTimeout(timeout)
      })
      
      console.error('[ClientTokenManager] Checking session with Supabase')
      
      const sessionPromise = supabase.auth.getSession()
      
      const result = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as AuthResponse
      
      const { data, error } = result
      
      if (error) {
        console.error('[ClientTokenManager] Session check error:', error)
        throw error
      }
      
      if (data?.session) {
        console.error('[ClientTokenManager] Session verified successfully')
        setSessionLoaded(true)
      } else {
        console.error('[ClientTokenManager] No session data received')
        throw new Error('No session data')
      }
      
    } catch (error) {
      console.error('[ClientTokenManager] Error in session check:', error)
      
      // Gérer les retries
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++
        console.error(`[ClientTokenManager] Retrying (${retryCount.current}/${MAX_RETRIES})...`)
        setTimeout(checkSession, RETRY_DELAY)
      } else {
        console.error('[ClientTokenManager] Max retries reached')
        setSessionLoaded(true)
      }
    } finally {
      sessionCheckInProgress.current = false
    }
  }
  
  useEffect(() => {
    console.error('[ClientTokenManager] Component mounted')
    mountedRef.current = true
    
    if (!initializationAttempted.current) {
      console.error('[ClientTokenManager] Starting initial session check')
      initializationAttempted.current = true
      checkSession()
    }
    
    return () => {
      console.error('[ClientTokenManager] Component unmounting')
      mountedRef.current = false
    }
  }, [])
  
  return null
} 