"use client"

import { useEffect, useState, useRef } from 'react'
import { enforceTokenStorage } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

// Routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/success', '/docs'];

// Initialisation synchrone au chargement du module
if (typeof window !== 'undefined') {
  try {
    // Essayer de récupérer le token à partir de plusieurs sources
    const accessToken = 
      localStorage.getItem('sb-access-token') || 
      localStorage.getItem('supabase.auth.token') ||
      localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`) ||
      document.cookie.split(';').find(c => c.trim().startsWith('sb-access-token='))?.split('=')[1];
    
    if (accessToken) {
      console.error('[ClientTokenManager] Found access token during init');
      enforceTokenStorage();
    } else {
      console.error('[ClientTokenManager] No token found during init - will proceed with app loading');
    }
  } catch (error) {
    console.error('[ClientTokenManager] Error during init:', error);
  }
}

export default function ClientTokenManager() {
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const sessionCheckInProgress = useRef(false);
  const mountedRef = useRef(false);
  const initializationAttempted = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const router = useRouter();
  const pathname = usePathname();
  
  // Fonction pour vérifier si la route actuelle est publique
  const isPublicRoute = () => {
    if (!pathname) return false;
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  };
  
  // Fonction pour rediriger vers la page de login si nécessaire
  const redirectIfNeeded = () => {
    if (authStatus === 'unauthenticated' && !isPublicRoute()) {
      console.error('[ClientTokenManager] User not authenticated, redirecting to login');
      // Ajouter un paramètre de redirection pour revenir à la page après login
      const returnTo = encodeURIComponent(pathname || '/dashboard');
      router.push(`/login?returnTo=${returnTo}`);
    }
  };
  
  const checkSession = async () => {
    if (sessionCheckInProgress.current || !mountedRef.current) {
      console.error('[ClientTokenManager] Session check skipped:', {
        sessionCheckInProgress: sessionCheckInProgress.current,
        mounted: mountedRef.current
      });
      return;
    }
    
    sessionCheckInProgress.current = true;
    
    try {
      console.error('[ClientTokenManager] Starting session check');
      
      // Vérifier si des tokens sont disponibles - essayer plusieurs sources
      const accessToken = 
        localStorage.getItem('sb-access-token') || 
        localStorage.getItem('supabase.auth.token') ||
        localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`) ||
        document.cookie.split(';').find(c => c.trim().startsWith('sb-access-token='))?.split('=')[1];
      
      if (!accessToken) {
        console.error('[ClientTokenManager] No access token found - user unauthenticated');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Publier un événement personnalisé pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
          detail: { status: 'unauthenticated' } 
        }));
        
        return;
      }
      
      console.error('[ClientTokenManager] Access token found, checking refresh');
      
      // Vérifier si le token a besoin d'être rafraîchi
      const lastRefresh = localStorage.getItem('sb-token-last-refresh');
      const now = Date.now();
      const refreshInterval = 30 * 60 * 1000;
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > refreshInterval) {
        console.error('[ClientTokenManager] Token refresh needed');
        const tokenUpdated = enforceTokenStorage();
        if (!tokenUpdated) {
          throw new Error('Token refresh failed');
        }
        console.error('[ClientTokenManager] Token refreshed successfully');
      }
      
      // Vérifier la session avec un timeout plus long
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session check timeout'));
        }, 10000);
        return () => clearTimeout(timeout);
      });
      
      console.error('[ClientTokenManager] Checking session with Supabase');
      
      const sessionPromise = supabase.auth.getSession();
      
      let result;
      try {
        result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as AuthResponse;
      } catch (error) {
        console.error('[ClientTokenManager] Session race error:', error);
        // En cas d'erreur dans Promise.race, on marque l'utilisateur comme non authentifié
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        return;
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error('[ClientTokenManager] Session check error:', error);
        throw error;
      }
      
      if (data?.session) {
        console.error('[ClientTokenManager] Session verified successfully');
        setAuthStatus('authenticated');
        setSessionLoaded(true);
        
        // Publier un événement personnalisé pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
          detail: { status: 'authenticated', session: data.session } 
        }));
      } else {
        console.error('[ClientTokenManager] No session data received');
        // Cas où getSession() retourne un objet mais pas de session
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Nettoyer les tokens obsolètes
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
        
        // Publier un événement
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
          detail: { status: 'unauthenticated' } 
        }));
        
        throw new Error('No session data');
      }
      
    } catch (error) {
      console.error('[ClientTokenManager] Error in session check:', error);
      
      // Gérer les retries
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        console.error(`[ClientTokenManager] Retrying (${retryCount.current}/${MAX_RETRIES})...`);
        setTimeout(checkSession, RETRY_DELAY);
      } else {
        console.error('[ClientTokenManager] Max retries reached - proceeding without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Forcer le nettoyage des tokens périmés après épuisement des tentatives
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      }
    } finally {
      sessionCheckInProgress.current = false;
    }
  };
  
  // Effect pour gérer la redirection si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (authStatus === 'unauthenticated' && sessionLoaded) {
      redirectIfNeeded();
    }
  }, [authStatus, sessionLoaded, pathname]);
  
  // Effect principal pour l'initialisation
  useEffect(() => {
    console.error('[ClientTokenManager] Component mounted');
    mountedRef.current = true;
    
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      if (!initializationAttempted.current) {
        console.error('[ClientTokenManager] Starting initial session check');
        initializationAttempted.current = true;
        checkSession();
      }
    } else {
      const handleLoad = () => {
        if (!initializationAttempted.current) {
          console.error('[ClientTokenManager] Starting initial session check after load');
          initializationAttempted.current = true;
          checkSession();
        }
      };
      window.addEventListener('load', handleLoad);
      
      // Définir un timeout de sécurité pour éviter les blocages infinis
      const safetyTimeout = setTimeout(() => {
        console.error('[ClientTokenManager] Safety timeout triggered - proceeding to load app');
        if (!sessionLoaded) {
          setSessionLoaded(true);
          setAuthStatus('unauthenticated');
          
          if (isPublicRoute()) {
            console.error('[ClientTokenManager] On public route, continuing without authentication');
          } else {
            console.error('[ClientTokenManager] Safety redirect to login page');
            router.push('/login');
          }
        }
      }, 8000); // 8 secondes
      
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(safetyTimeout);
      };
    }
    
    return () => {
      console.error('[ClientTokenManager] Component unmounting');
      mountedRef.current = false;
    };
  }, []);
  
  return null;
} 