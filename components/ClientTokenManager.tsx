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
  const MAX_RETRIES = 3; // Augmenté à 3 pour plus de tentatives
  const MAX_REDIRECTS = 2;
  const RETRY_DELAY_BASE = 800; // Délai de base pour le backoff exponentiel
  const MIN_AUTH_CHECK_INTERVAL = 1200;
  const PRIMARY_TIMEOUT = 8000; // Augmenté à 8000ms
  const FALLBACK_TIMEOUT = 6000; // Augmenté à 6000ms
  const SAFETY_TIMEOUT = 10000; // Augmenté à 10000ms
  const AUTH_CACHE_TTL = 30000; // 30 secondes de cache
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
  
  // Méthode de récupération d'urgence de session
  const emergencyRecovery = async (accessToken: string) => {
    console.log('[ClientTokenManager] Attempting emergency session recovery');
    
    // Tracking pour savoir quelle méthode a réussi
    let recoveryMethod = 'none';
    
    // 1. D'abord, essayer getUser directement (le plus rapide)
    try {
      const { data } = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Get user timeout')), 3000))
      ]) as AuthResponse;
      
      if (data?.user) {
        console.log('[ClientTokenManager] Emergency recovery with direct getUser successful');
        recoveryMethod = 'direct_get_user';
        
        // Mettre à jour le cache
        localStorage.setItem('cached_auth_status', 'authenticated');
        localStorage.setItem('cached_auth_time', Date.now().toString());
        
        return { success: true, method: recoveryMethod };
      }
    } catch (error) {
      console.warn('[ClientTokenManager] Emergency direct getUser failed:', error);
    }
    
    // 2. Forcer le stockage des tokens
    try {
      const tokenUpdated = enforceTokenStorage();
      if (tokenUpdated) {
        console.log('[ClientTokenManager] Token storage enforced');
        
        // Attendre un peu pour que les tokens soient appliqués
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Réessayer getUser
        const { data } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Get user after enforce timeout')), 3000))
        ]) as AuthResponse;
        
        if (data?.user) {
          console.log('[ClientTokenManager] Recovery successful after token enforce');
          recoveryMethod = 'token_enforce';
          return { success: true, method: recoveryMethod };
        }
      }
    } catch (error) {
      console.warn('[ClientTokenManager] Recovery with token enforce failed:', error);
    }
    
    // 3. Essayer setSession comme dernier recours
    try {
      await Promise.race([
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: localStorage.getItem('sb-refresh-token') || ''
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Set session timeout')), 4000))
      ]);
      
      // Vérifier si la session a été établie
      const { data } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Get session timeout')), 4000))
      ]) as AuthResponse;
      
      if (data?.session) {
        console.log('[ClientTokenManager] Emergency recovery with setSession successful');
        recoveryMethod = 'set_session';
        return { success: true, method: recoveryMethod };
      }
    } catch (error) {
      console.warn('[ClientTokenManager] Emergency recovery with setSession failed:', error);
    }

    // 4. Dernière tentative - vérifier s'il y a des signes d'authentification
    const hasTokens = !!getAccessToken();
    const hasLocalUserData = localStorage.getItem('supabase.auth.user') || 
                            localStorage.getItem('sb-user') || 
                            localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-user`);
    
    if (hasTokens && hasLocalUserData) {
      console.log('[ClientTokenManager] Semi-authenticated state detected, proceeding with caution');
      recoveryMethod = 'partial_auth';
      return { success: true, method: recoveryMethod, partial: true };
    }
    
    console.log('[ClientTokenManager] All emergency recovery methods failed');
    return { success: false, method: 'none' };
  };
  
  const checkSession = async () => {
    // Vérifier si nous avons un cache d'authentification récent
    const now = Date.now();
    const cachedAuthStatus = localStorage.getItem('cached_auth_status');
    const cachedAuthTime = localStorage.getItem('cached_auth_time');
    
    // Utiliser le cache si disponible et récent
    if (cachedAuthStatus && cachedAuthTime && (now - parseInt(cachedAuthTime)) < AUTH_CACHE_TTL) {
      console.log('[ClientTokenManager] Using cached auth status:', cachedAuthStatus);
      setAuthStatus(cachedAuthStatus as 'authenticated' | 'unauthenticated');
      setSessionLoaded(true);
      sessionCheckInProgress.current = false;
      return;
    }
    
    // Éviter les vérifications trop fréquentes
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
      // Récupérer le token d'accès
      const accessToken = getAccessToken();
      const isOnPublicRoute = isPublicRoute();
      
      console.log(`[ClientTokenManager] Starting session check: Route=${pathname}, Public=${isOnPublicRoute}, HasToken=${Boolean(accessToken)}`);
      
      // Si nous sommes sur une route publique et qu'il n'y a pas de token, on peut continuer directement
      if (isOnPublicRoute && !accessToken) {
        console.log('[ClientTokenManager] Public route without token, proceeding as unauthenticated');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        sessionCheckInProgress.current = false;
        
        // Mettre à jour le cache
        localStorage.setItem('cached_auth_status', 'unauthenticated');
        localStorage.setItem('cached_auth_time', now.toString());
        return;
      }
      
      // Forcer le stockage des tokens pour garantir la cohérence
      if (accessToken) {
        const tokenUpdated = enforceTokenStorage();
        console.log('[ClientTokenManager] Enforced token storage result:', tokenUpdated);
      }
      
      // ORDRE INVERSÉ: Essayer getUser d'abord (généralement plus rapide)
      try {
        console.log('[ClientTokenManager] Trying getUser with timeout:', FALLBACK_TIMEOUT);
        
        const userResult = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('User check timeout')), FALLBACK_TIMEOUT))
        ]) as AuthResponse;
        
        if (userResult.data?.user) {
          console.log('[ClientTokenManager] User found, proceeding as authenticated');
          setAuthStatus('authenticated');
          setSessionLoaded(true);
          
          // Mettre à jour le cache
          localStorage.setItem('cached_auth_status', 'authenticated');
          localStorage.setItem('cached_auth_time', now.toString());
          
          // Publier un événement pour notifier les autres composants
          window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
            detail: { status: 'authenticated', user: userResult.data.user } 
          }));
          
          // Réinitialiser le compteur de tentatives
          retryCount.current = 0;
          sessionCheckInProgress.current = false;
          return;
        }
      } catch (userError) {
        console.warn('[ClientTokenManager] Initial getUser check failed:', userError);
        // Continuer avec getSession
      }
      
      // Si getUser échoue, essayer getSession comme fallback
      let sessionData = null;
      try {
        console.log('[ClientTokenManager] Trying getSession with timeout:', PRIMARY_TIMEOUT);
        
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timeout')), PRIMARY_TIMEOUT))
        ]) as AuthResponse;
        
        sessionData = sessionResult.data;
        
        if (sessionData?.session) {
          console.log('[ClientTokenManager] Session verified successfully');
          setAuthStatus('authenticated');
          setSessionLoaded(true);
          
          // Mettre à jour le cache
          localStorage.setItem('cached_auth_status', 'authenticated');
          localStorage.setItem('cached_auth_time', now.toString());
          
          // Publier un événement pour notifier les autres composants
          window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', { 
            detail: { status: 'authenticated', session: sessionData.session } 
          }));
          
          // Réinitialiser le compteur de tentatives
          retryCount.current = 0;
          sessionCheckInProgress.current = false;
          return;
        }
      } catch (error) {
        console.error('[ClientTokenManager] Session check failed:', error);
      }
      
      // Sur une route publique, on peut être moins strict sur l'authentification
      if (isOnPublicRoute) {
        console.log('[ClientTokenManager] On public route, proceeding without full authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        sessionCheckInProgress.current = false;
        
        // Mettre à jour le cache
        localStorage.setItem('cached_auth_status', 'unauthenticated');
        localStorage.setItem('cached_auth_time', now.toString());
        return;
      }
      
      // Si ni getUser ni getSession n'ont réussi, essayer la récupération d'urgence
      if (accessToken) {
        console.log('[ClientTokenManager] Attempting emergency recovery');
        
        const recoveryResult = await emergencyRecovery(accessToken);
        
        if (recoveryResult.success) {
          console.log(`[ClientTokenManager] Emergency recovery successful with method: ${recoveryResult.method}`);
          setAuthStatus('authenticated');
          setSessionLoaded(true);
          
          // Mettre à jour le cache
          localStorage.setItem('cached_auth_status', 'authenticated');
          localStorage.setItem('cached_auth_time', now.toString());
          
          // Publier un événement pour notifier les autres composants
          window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', {
            detail: { 
              status: 'authenticated',
              partial: recoveryResult.partial || false
            }
          }));
          
          // Réinitialiser le compteur de tentatives
          retryCount.current = 0;
          sessionCheckInProgress.current = false;
          return;
        }
      }
      
      // Si on arrive ici, toutes les tentatives ont échoué
      console.log('[ClientTokenManager] All authentication attempts failed, retry count:', retryCount.current);
      
      // Traiter les erreurs différemment selon qu'elles sont des timeouts ou d'autres types d'erreurs
      if (retryCount.current < MAX_RETRIES) {
        // Si on n'a pas atteint le nombre max de tentatives, réessayer avec backoff exponentiel
        retryCount.current++;
        const retryDelay = RETRY_DELAY_BASE * Math.pow(1.5, retryCount.current - 1);
        console.log(`[ClientTokenManager] Retrying (${retryCount.current}/${MAX_RETRIES}) in ${retryDelay}ms...`);
        setTimeout(checkSession, retryDelay);
        sessionCheckInProgress.current = false;
        return;
      }
      
      // Nettoyer les tokens obsolètes ou corrompus si max retries atteint
      console.log('[ClientTokenManager] Max retries reached, cleaning up tokens');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Définir l'état final comme non authentifié
      setAuthStatus('unauthenticated');
      setSessionLoaded(true);
      
      // Mettre à jour le cache
      localStorage.setItem('cached_auth_status', 'unauthenticated');
      localStorage.setItem('cached_auth_time', now.toString());
      
      window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', {
        detail: { status: 'unauthenticated' }
      }));
    } catch (error) {
      console.error('[ClientTokenManager] Error in session check:', error);
      
      // Distinguer les erreurs de timeout des autres erreurs
      const isTimeoutError = error instanceof Error && error.message.includes('timeout');
      
      // Sur route publique, permettre de continuer même après erreur
      if (isPublicRoute()) {
        console.log('[ClientTokenManager] Error on public route, proceeding without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        sessionCheckInProgress.current = false;
        return;
      }
      
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        // Utiliser backoff exponentiel
        const retryDelay = RETRY_DELAY_BASE * Math.pow(1.5, retryCount.current - 1);
        console.log(`[ClientTokenManager] Retrying after error (${retryCount.current}/${MAX_RETRIES}) in ${retryDelay}ms...`);
        setTimeout(checkSession, retryDelay);
      } else {
        console.log('[ClientTokenManager] Max retries reached after error - proceeding without authentication');
        setAuthStatus('unauthenticated');
        setSessionLoaded(true);
        
        // Mettre à jour le cache
        localStorage.setItem('cached_auth_status', 'unauthenticated');
        localStorage.setItem('cached_auth_time', now.toString());
        
        // Ne nettoyer les tokens qu'en cas d'erreur non-timeout
        if (!isTimeoutError) {
          localStorage.removeItem('sb-access-token');
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
          document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
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
        // Enregistrer cet événement pour l'analyse
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_safety_triggered', 'true');
          localStorage.setItem('auth_safety_time', new Date().toISOString());
          localStorage.setItem('auth_safety_path', pathname || '');
        }
        
        setSessionLoaded(true);
        
        // Si on est sur une route publique, ne pas rediriger
        if (isPublicRoute()) {
          console.log('[ClientTokenManager] On public route, continuing without authentication');
          setAuthStatus('unauthenticated');
        } else {
          // Dernière tentative de récupération
          const accessToken = getAccessToken();
          if (accessToken) {
            console.log('[ClientTokenManager] Safety timeout with token - attempting streamlined recovery');
            
            // Version simplifiée et plus rapide de la vérification
            Promise.race([
              supabase.auth.getUser(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Safety user check timeout')), 2000))
            ]).then((result: any) => {
              if (result.data?.user) {
                console.log('[ClientTokenManager] User found in safety check');
                setAuthStatus('authenticated');
                
                // Mettre à jour le cache pour les futures vérifications
                localStorage.setItem('cached_auth_status', 'authenticated');
                localStorage.setItem('cached_auth_time', Date.now().toString());
              } else {
                handleSafetyFailure();
              }
            }).catch(() => {
              handleSafetyFailure();
            });
          } else {
            handleSafetyFailure();
          }
        }
      }
    }, SAFETY_TIMEOUT);
    
    // Fonction pour gérer l'échec de la vérification de sécurité
    const handleSafetyFailure = () => {
      console.log('[ClientTokenManager] Safety recovery failed');
      
      // Tentative de détection d'un état d'authentification partiel
      const hasTokens = !!getAccessToken();
      const hasLocalUserData = localStorage.getItem('supabase.auth.user') || 
                              localStorage.getItem('sb-user');
      
      if (hasTokens && hasLocalUserData) {
        console.log('[ClientTokenManager] Partial auth detected, trying to continue');
        setAuthStatus('authenticated');
        // Marquer comme authentification partielle
        window.dispatchEvent(new CustomEvent('klyra:auth-status-changed', {
          detail: { status: 'authenticated', partial: true }
        }));
      } else {
        console.log('[ClientTokenManager] Safety redirect to login page');
        setAuthStatus('unauthenticated');
        
        // Ajouter un délai court avant la redirection
        setTimeout(() => {
          // Stocker l'URL actuelle pour y revenir après login
          if (typeof window !== 'undefined' && pathname && !isPublicRoute()) {
            localStorage.setItem('auth_redirect_url', pathname);
          }
          redirectIfNeeded();
        }, 100);
      }
    };
    
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
      mountedRef.current = false;
      // Nettoyer le timeout de sécurité
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, []);
  
  if (!sessionLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
          <p className="mt-4 text-[16px] font-medium text-gray-700">Vérification de la session...</p>
          <p className="mt-2 text-[14px] text-gray-500">Nous vérifions votre authentification</p>
          
          {/* Message pour les chargements prolongés */}
          <div className="mt-8 opacity-0 animate-fadeIn text-[14px] text-gray-500 delayed-display">
            Le chargement prend plus de temps que prévu. 
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline ml-1 font-medium"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

// Ajouter le style CSS pour l'animation de fondu et le délai d'affichage
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-fadeIn {
      animation: fadeIn 1s ease-in-out forwards;
    }
    
    .delayed-display {
      animation-delay: 3s;
    }
  `;
  document.head.appendChild(style);
} 