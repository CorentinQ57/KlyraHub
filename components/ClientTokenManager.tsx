"use client"

import { useEffect, useState, useRef } from 'react'
import { enforceTokenStorage, debugAuthState } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

// Routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/success', '/docs', '/', '/services', '/about', '/contact'];

// Initialisation synchrone au chargement du module
if (typeof window !== 'undefined') {
  try {
    // Vérifier si une session est déjà présente et l'afficher
    const hasSession = debugAuthState();
    
    if (hasSession) {
      console.log('[ClientTokenManager] Found auth tokens during init, enforcing storage');
      enforceTokenStorage();
    } else {
      console.log('[ClientTokenManager] No tokens found during init - will proceed with app loading');
    }
    
    // Stocker l'information sur la détection de session pour le débogage
    localStorage.setItem('auth_init_check', hasSession ? 'true' : 'false');
    localStorage.setItem('auth_init_time', new Date().toISOString());
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
  const redirectCount = useRef(0);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAuthCheckTime = useRef<number>(0);
  const isRedirecting = useRef(false);
  const MAX_RETRIES = 3;
  const MAX_REDIRECTS = 2; // Limite le nombre de redirections pour éviter les boucles
  const RETRY_DELAY = 1000;
  const MIN_AUTH_CHECK_INTERVAL = 2000; // Temps minimum entre deux vérifications d'auth
  const router = useRouter();
  const pathname = usePathname();
  
  // Fonction pour vérifier si la route actuelle est publique
  const isPublicRoute = () => {
    if (!pathname) return false;
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  };
  
  // Fonction pour rediriger vers la page de login si nécessaire
  const redirectIfNeeded = () => {
    // Éviter les redirections si on est déjà en train de rediriger
    if (isRedirecting.current) {
      return;
    }
    
    if (authStatus === 'unauthenticated' && !isPublicRoute()) {
      // Protection contre les boucles de redirection
      if (redirectCount.current >= MAX_REDIRECTS) {
        console.log(`[ClientTokenManager] Max redirections (${MAX_REDIRECTS}) reached - stopping redirect loop`);
        // Stocker dans le localStorage pour déboguer
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_redirect_blocked', 'true');
          localStorage.setItem('auth_redirect_time', new Date().toISOString());
          localStorage.setItem('auth_redirect_path', pathname || '');
        }
        return;
      }
      
      console.log(`[ClientTokenManager] User not authenticated on protected route (${pathname}), redirecting to login`);
      redirectCount.current++;
      isRedirecting.current = true;
      
      // Ajouter un paramètre de redirection pour revenir à la page après login
      const returnTo = encodeURIComponent(pathname || '/dashboard');
      router.push(`/login?returnTo=${returnTo}`);
      
      // Réinitialiser le statut de redirection après un délai
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
    }
  };
  
  // Fonction pour récupérer le token d'accès depuis différentes sources
  const getAccessToken = () => {
    try {
      // Essayer localStorage avec plusieurs clés
      const localStorageToken = 
        localStorage.getItem('sb-access-token') || 
        localStorage.getItem('supabase.auth.token') ||
        localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
        
      if (localStorageToken) {
        return localStorageToken;
      }
      
      // Essayer les cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('sb-access-token=')) {
          return trimmedCookie.substring('sb-access-token='.length);
        }
      }
      
      return null;
    } catch (e) {
      console.error('[ClientTokenManager] Error getting access token:', e);
      return null;
    }
  };
  
  const emergencyRecovery = async (accessToken: string) => {
    console.log('[ClientTokenManager] Attempting emergency session recovery');
    
    try {
      // Tenter de définir manuellement la session
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: localStorage.getItem('sb-refresh-token') || ''
      });
      
      // Vérifier si la session a été établie
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        console.log('[ClientTokenManager] Emergency recovery successful');
        return true;
      }
    } catch (error) {
      console.error('[ClientTokenManager] Emergency recovery failed:', error);
    }
    
    // Si toutes les tentatives échouent, essayer un dernier refresh du token
    try {
      const refreshed = enforceTokenStorage();
      if (refreshed) {
        console.log('[ClientTokenManager] Token refreshed in emergency recovery');
        // Donner du temps au système pour enregistrer les changements
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
    } catch (error) {
      console.error('[ClientTokenManager] Token refresh failed in emergency recovery:', error);
    }
    
    return false;
  };
  
  const checkSession = async () => {
    // Éviter les vérifications trop fréquentes
    const now = Date.now();
    if (now - lastAuthCheckTime.current < MIN_AUTH_CHECK_INTERVAL) {
      console.log('[ClientTokenManager] Auth check too frequent, skipping');
      return;
    }
    
    // Éviter les vérifications concurrentes ou si le composant est démonté
    if (sessionCheckInProgress.current || !mountedRef.current) {
      console.log('[ClientTokenManager] Session check skipped:', {
        sessionCheckInProgress: sessionCheckInProgress.current,
        mounted: mountedRef.current
      });
      return;
    }
    
    lastAuthCheckTime.current = now;
    sessionCheckInProgress.current = true;
    
    try {
      console.log('[ClientTokenManager] Starting session check');
      
      // Sur les routes publiques, on vérifie de manière moins agressive
      const isOnPublicRoute = isPublicRoute();
      console.log(`[ClientTokenManager] Current route (${pathname}) is ${isOnPublicRoute ? 'public' : 'protected'}`);
      
      // Vérifier si des tokens sont disponibles
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        console.log('[ClientTokenManager] No access token found - user unauthenticated');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Publier un événement personnalisé pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
          detail: { status: 'unauthenticated' } 
        }));
        
        return;
      }
      
      console.log('[ClientTokenManager] Access token found, checking refresh');
      
      // Vérifier si le token a besoin d'être rafraîchi
      const lastRefresh = localStorage.getItem('sb-token-last-refresh');
      const refreshInterval = 30 * 60 * 1000;
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > refreshInterval) {
        console.log('[ClientTokenManager] Token refresh needed');
        const tokenUpdated = enforceTokenStorage();
        if (!tokenUpdated) {
          throw new Error('Token refresh failed');
        }
        console.log('[ClientTokenManager] Token refreshed successfully');
      }
      
      // Approche multi-étapes pour vérifier la session
      let sessionData = null;
      
      // Temps d'attente plus court pour la vérification sur routes publiques
      const timeoutDuration = isOnPublicRoute ? 3000 : 5000;
      
      // Étape 1: Vérification principale avec un timeout
      try {
        console.log(`[ClientTokenManager] Checking session - primary attempt (timeout: ${timeoutDuration}ms)`);
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timeout')), timeoutDuration))
        ]) as AuthResponse;
        
        sessionData = sessionResult.data;
        
        if (sessionData?.session) {
          console.log('[ClientTokenManager] Session verified successfully');
          setAuthStatus('authenticated');
          setSessionLoaded(true);
          
          // Publier un événement pour notifier les autres composants
          window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
            detail: { status: 'authenticated', session: sessionData.session } 
          }));
          
          // Mettre à jour le timestamp du dernier refresh
          localStorage.setItem('sb-token-last-refresh', now.toString());
          
          // Réinitialiser le compteur de tentatives
          retryCount.current = 0;
          return;
        }
      } catch (error) {
        console.error('[ClientTokenManager] Primary session check failed:', error);
      }
      
      // Sur une route publique, on peut être moins strict sur l'authentification
      if (isOnPublicRoute && !sessionData?.session) {
        console.log('[ClientTokenManager] On public route, proceeding without full authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        return;
      }
      
      // Étape 2: Si getSession échoue, essayer getUser comme fallback
      if (!sessionData?.session) {
        try {
          console.log('[ClientTokenManager] Trying getUser as fallback');
          const timeoutDuration = isOnPublicRoute ? 2000 : 3000;
          const userResult = await Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('User check timeout')), timeoutDuration))
          ]) as AuthResponse;
          
          if (userResult.data?.user) {
            console.log('[ClientTokenManager] User found, attempting to reconstruct session');
            
            // Tentative de récupération d'urgence seulement si nécessaire
            if (!isOnPublicRoute) {
              const recovered = await emergencyRecovery(accessToken);
              
              if (recovered) {
                // Vérifier si la session a été récupérée
                const finalCheck = await supabase.auth.getSession();
                if (finalCheck.data?.session) {
                  console.log('[ClientTokenManager] Session reconstructed successfully');
                  setAuthStatus('authenticated');
                  setSessionLoaded(true);
                  
                  window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', {
                    detail: { status: 'authenticated', session: finalCheck.data.session }
                  }));
                  
                  return;
                }
              }
            } else {
              // Sur route publique avec utilisateur valide, considérer comme "suffisant" pour procéder
              console.log('[ClientTokenManager] On public route with valid user, proceeding');
              setAuthStatus('authenticated');
              setSessionLoaded(true);
              return;
            }
          }
        } catch (userError) {
          console.error('[ClientTokenManager] User fallback check failed:', userError);
        }
      }
      
      // Si on arrive ici, toutes les tentatives ont échoué
      console.log('[ClientTokenManager] All authentication attempts failed');
      
      // Sur route publique, permettre de continuer même sans authentification complète
      if (isOnPublicRoute) {
        console.log('[ClientTokenManager] Allowing access to public route without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        return;
      }
      
      // Nettoyer les tokens obsolètes ou corrompus
      if (retryCount.current >= MAX_RETRIES) {
        console.log('[ClientTokenManager] Max retries reached, cleaning up tokens');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Définir l'état final comme non authentifié
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', {
          detail: { status: 'unauthenticated' }
        }));
      } else {
        // Si on n'a pas atteint le nombre max de tentatives, réessayer
        retryCount.current++;
        console.log(`[ClientTokenManager] Retrying (${retryCount.current}/${MAX_RETRIES})...`);
        setTimeout(checkSession, RETRY_DELAY * retryCount.current);
      }
    } catch (error) {
      console.error('[ClientTokenManager] Error in session check:', error);
      
      // Sur route publique, permettre de continuer même après erreur
      if (isPublicRoute()) {
        console.log('[ClientTokenManager] Error on public route, proceeding without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        return;
      }
      
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        console.log(`[ClientTokenManager] Retrying after error (${retryCount.current}/${MAX_RETRIES})...`);
        setTimeout(checkSession, RETRY_DELAY * retryCount.current);
      } else {
        console.log('[ClientTokenManager] Max retries reached after error - proceeding without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Nettoyer les tokens après échec
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
    console.log('[ClientTokenManager] Component mounted');
    mountedRef.current = true;
    
    // Définir un timeout de sécurité pour éviter les blocages infinis
    safetyTimeoutRef.current = setTimeout(() => {
      console.log('[ClientTokenManager] Safety timeout triggered - proceeding to load app');
      if (!sessionLoaded) {
        setSessionLoaded(true);
        
        // Si on est sur une route publique, ne pas rediriger
        if (isPublicRoute()) {
          console.log('[ClientTokenManager] On public route, continuing without authentication');
          setAuthStatus('unauthenticated');
        } else {
          console.log('[ClientTokenManager] Safety redirect to login page');
          setAuthStatus('unauthenticated');
          
          // Ajouter un petit délai pour permettre au composant de se rendre compte qu'il est sur une route protégée
          setTimeout(() => {
            redirectIfNeeded();
          }, 100);
        }
      }
    }, 5000); // 5 secondes (réduit de 6 à 5 pour charger plus rapidement)
    
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      if (!initializationAttempted.current) {
        console.log('[ClientTokenManager] Starting initial session check');
        initializationAttempted.current = true;
        checkSession();
      }
    } else {
      const handleLoad = () => {
        if (!initializationAttempted.current) {
          console.log('[ClientTokenManager] Starting initial session check after load');
          initializationAttempted.current = true;
          checkSession();
        }
      };
      window.addEventListener('load', handleLoad);
      
      return () => {
        window.removeEventListener('load', handleLoad);
      };
    }
    
    return () => {
      console.log('[ClientTokenManager] Component unmounting');
      mountedRef.current = false;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);
  
  return null;
} 