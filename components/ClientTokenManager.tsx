"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { enforceTokenStorage, debugAuthState } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { toast } from '@/components/ui/use-toast'

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

// Types pour le suivi d'authentification
export type AuthVerificationState = 'not_started' | 'in_progress' | 'completed' | 'timed_out' | 'failed';

// TIMEOUTS & RETRY CONSTANTS
const RETRY_COUNT = 3;
const RETRY_DELAY_BASE = 1000; // 1 seconde (augmenté de 800ms)
const RETRY_DELAY_FACTOR = 1.5; // Facteur de backoff exponentiel
const RETRY_DELAY_JITTER = 300; // Jitter pour éviter les requêtes simultanées
const PRIMARY_TIMEOUT = 8000; // 8 secondes (augmenté de 4000ms)
const FALLBACK_TIMEOUT = 6000; // 6 secondes (augmenté de 3000ms)
const SAFETY_TIMEOUT = 10000; // 10 secondes (augmenté de 5000ms)
const CIRCUIT_BREAKER_TIMEOUT = 10000; // 10 secondes (augmenté de 5000ms)
const DEGRADED_MODE_ENABLED = true; // Activer le mode dégradé en cas d'échec

// Liste des routes publiques
const publicRoutes = [
  '/login', 
  '/register',
  '/forgot-password',
  '/reset-password',
  '/services',
  '/contact',
  '/about',
  '/legal',
  '/pricing',
  '/terms',
  '/privacy',
  '/',
  '/blog',
  '/docs',
];

// Routes qui nécessitent une redirection vers le dashboard si connecté
const loginRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Vérifier si la route est publique
function isPublicRoute(pathname: string) {
  // Vérifier les routes exactes
  if (publicRoutes.includes(pathname)) return true;
  
  // Vérifier les patterns de routes
  for (const route of publicRoutes) {
    if (route.endsWith('*') && pathname.startsWith(route.slice(0, -1))) {
      return true;
    }
  }
  
  // Vérifier les routes dynamiques de blog
  if (pathname.startsWith('/blog/')) return true;
  if (pathname.startsWith('/docs/')) return true;
  
  return false;
}

// Fonction pour générer un délai de backoff exponentiel avec jitter
function getBackoffDelay(attempt: number) {
  // Calcul du délai de base avec backoff exponentiel
  const exponentialDelay = RETRY_DELAY_BASE * Math.pow(RETRY_DELAY_FACTOR, attempt);
  
  // Ajout d'un jitter aléatoire pour éviter les tempêtes de requêtes
  const jitter = Math.random() * RETRY_DELAY_JITTER;
  
  return Math.min(exponentialDelay + jitter, 10000); // Maximum 10 secondes
}

// État du gestionnaire de token
type TokenManagerState = 'loading' | 'authenticated' | 'unauthenticated' | 'degraded';

export default function ClientTokenManager() {
  const [state, setState] = useState<TokenManagerState>('loading');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const retryCountRef = useRef(0);
  const circuitBreakerRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  const inDegradedMode = useRef(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Protection contre les redirections en boucle
  useEffect(() => {
    const redirectionCount = parseInt(sessionStorage.getItem('redirection_count') || '0');
    if (redirectionCount > 5) {
      console.error('Maximum redirection limit reached');
      circuitBreakerRef.current = true;
      setShowFallbackUI(true);
      setState('degraded');
      localStorage.setItem('auth_degraded_mode', 'true');
      localStorage.setItem('auth_degraded_reason', 'circuit_breaker');
      return;
    }
    
    // Incrémenter le compteur de redirections
    sessionStorage.setItem('redirection_count', (redirectionCount + 1).toString());
    
    // Réinitialiser après 10 secondes
    const timer = setTimeout(() => {
      sessionStorage.setItem('redirection_count', '0');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Vérification du cache d'authentification
  const checkCachedAuthStatus = useCallback(() => {
    // Vérifier si on force le mode dégradé
    if (localStorage.getItem('auth_force_degraded') === 'true') {
      console.info('Forced degraded mode activated');
      inDegradedMode.current = true;
      setState('degraded');
      return true;
    }
    
    const cachedStatus = localStorage.getItem('cached_auth_status');
    const cachedTime = localStorage.getItem('cached_auth_time');
    
    if (cachedStatus && cachedTime) {
      const cachedTimeMs = parseInt(cachedTime);
      const now = Date.now();
      
      // Le cache est valide pendant 5 minutes (300000ms)
      if (now - cachedTimeMs < 300000) {
        console.log('Using cached auth status:', cachedStatus);
        if (cachedStatus === 'authenticated') {
          setState('authenticated');
          return true;
        } else if (cachedStatus === 'unauthenticated') {
          setState('unauthenticated');
          return true;
        }
      }
    }
    
    return false;
  }, []);

  // Mise à jour du cache d'authentification
  const updateAuthCache = useCallback((status: 'authenticated' | 'unauthenticated' | 'degraded') => {
    localStorage.setItem('cached_auth_status', status);
    localStorage.setItem('cached_auth_time', Date.now().toString());
  }, []);

  // Mise en place des écouteurs pour le mode dégradé
  useEffect(() => {
    if (state === 'degraded' && DEGRADED_MODE_ENABLED) {
      // Notifier l'utilisateur qu'il est en mode dégradé
      const hasNotified = sessionStorage.getItem('degraded_mode_notified');
      
      if (!hasNotified) {
        toast({
          title: 'Mode limité activé',
          description: 'Certaines fonctionnalités peuvent être limitées en raison de problèmes de connexion.',
          variant: 'destructive',
          duration: 10000,
        });
        
        sessionStorage.setItem('degraded_mode_notified', 'true');
      }
    }
  }, [state]);

  // Redirection en fonction de l'état d'authentification
  useEffect(() => {
    if (hasRedirectedRef.current) return;
    
    // Ne pas rediriger si en mode dégradé
    if (state === 'degraded') {
      // En mode dégradé, on redirige uniquement depuis la page de connexion vers le dashboard
      if (loginRoutes.includes(pathname || '')) {
        console.log('[Degraded] Redirecting from login to dashboard');
        router.push('/dashboard');
        hasRedirectedRef.current = true;
      }
      return;
    }
    
    if (state === 'loading' || isCheckingSession) return;
    
    const isPublic = isPublicRoute(pathname || '');
    console.log(`Route ${pathname} is ${isPublic ? 'public' : 'protected'}`);
    
    if (state === 'authenticated') {
      // Si connecté et sur une page de login, rediriger vers le dashboard
      if (loginRoutes.includes(pathname || '')) {
        console.log('Authenticated user on login page, redirecting to dashboard');
        router.push('/dashboard');
        hasRedirectedRef.current = true;
      }
    } else if (state === 'unauthenticated') {
      // Si non connecté et sur une page protégée, rediriger vers la connexion
      if (!isPublic) {
        console.log('Unauthenticated user on protected page, redirecting to login');
        router.push('/login');
        hasRedirectedRef.current = true;
      }
    }
  }, [state, pathname, router, isCheckingSession]);

  // Vérification de session principale
  const checkSession = useCallback(async () => {
    if (circuitBreakerRef.current) {
      console.warn('Circuit breaker active, skipping session check');
      setIsCheckingSession(false);
      return;
    }
    
    // Vérifier d'abord le cache
    if (checkCachedAuthStatus()) {
      setIsCheckingSession(false);
      return;
    }

    console.log(`Starting session check (attempt ${retryCountRef.current + 1}/${RETRY_COUNT})`);
    
    // Mise en place du safety timeout
    const safetyTimeout = setTimeout(() => {
      console.warn(`Safety timeout triggered (${SAFETY_TIMEOUT}ms)`);
      
      // Vérifier s'il existe un token
      const hasToken = debugAuthState();
      
      if (hasToken) {
        console.log('Token found but session check timed out, entering degraded mode');
        setState('degraded');
        inDegradedMode.current = true;
        updateAuthCache('degraded');
        localStorage.setItem('auth_degraded_mode', 'true');
        localStorage.setItem('auth_degraded_reason', 'timeout');
      } else {
        console.log('No token found after timeout, setting as unauthenticated');
        setState('unauthenticated');
        updateAuthCache('unauthenticated');
      }
      
      setIsCheckingSession(false);
    }, SAFETY_TIMEOUT);
    
    try {
      // Première tentative: getSession avec timeout
      const sessionPromise = new Promise(async (resolve, reject) => {
        const sessionTimeout = setTimeout(() => {
          console.warn('getSession timeout');
          reject(new Error('Session timeout'));
        }, PRIMARY_TIMEOUT);
        
        try {
          const { data, error } = await supabase.auth.getSession();
          clearTimeout(sessionTimeout);
          
          if (error) {
            console.error('getSession error:', error);
            reject(error);
          } else {
            console.log('getSession success');
            resolve(data);
          }
        } catch (err) {
          clearTimeout(sessionTimeout);
          console.error('getSession exception:', err);
          reject(err);
        }
      });
      
      // Exécuter la promesse avec timeout
      try {
        const { session } = await sessionPromise as { session: any };
        clearTimeout(safetyTimeout);
        
        if (session) {
          console.log('Valid session found');
          enforceTokenStorage();
          setState('authenticated');
          updateAuthCache('authenticated');
        } else {
          console.log('No active session found');
          setState('unauthenticated');
          updateAuthCache('unauthenticated');
        }
        
        retryCountRef.current = 0;
        setIsCheckingSession(false);
        return;
      } catch (error) {
        console.warn('Session verification failed, trying fallback getUser');
      }
      
      // Fallback: getUser avec timeout
      const userPromise = new Promise(async (resolve, reject) => {
        const userTimeout = setTimeout(() => {
          console.warn('getUser timeout');
          reject(new Error('User check timeout'));
        }, FALLBACK_TIMEOUT);
        
        try {
          const { data, error } = await supabase.auth.getUser();
          clearTimeout(userTimeout);
          
          if (error) {
            console.error('getUser error:', error);
            reject(error);
          } else {
            console.log('getUser success');
            resolve(data);
          }
        } catch (err) {
          clearTimeout(userTimeout);
          console.error('getUser exception:', err);
          reject(err);
        }
      });
      
      // Exécuter la promesse avec timeout
      try {
        const { user } = await userPromise as { user: any };
        clearTimeout(safetyTimeout);
        
        if (user) {
          console.log('Valid user found');
          enforceTokenStorage();
          setState('authenticated');
          updateAuthCache('authenticated');
        } else {
          console.log('No active user found');
          setState('unauthenticated');
          updateAuthCache('unauthenticated');
        }
        
        retryCountRef.current = 0;
        setIsCheckingSession(false);
        return;
      } catch (error) {
        console.warn('User verification failed');
        
        // Vérifier s'il existe un token malgré les échecs
        const hasToken = debugAuthState();
        
        if (hasToken && DEGRADED_MODE_ENABLED) {
          console.log('Token found despite verification failures, entering degraded mode');
          clearTimeout(safetyTimeout);
          setState('degraded');
          inDegradedMode.current = true;
          updateAuthCache('degraded');
          localStorage.setItem('auth_degraded_mode', 'true');
          localStorage.setItem('auth_degraded_reason', 'error');
          setIsCheckingSession(false);
          return;
        }
        
        // Retry logic
        retryCountRef.current += 1;
        
        if (retryCountRef.current < RETRY_COUNT) {
          // Calculer le délai avec backoff exponentiel
          const delay = getBackoffDelay(retryCountRef.current);
          console.log(`Retrying session check in ${delay}ms (attempt ${retryCountRef.current + 1}/${RETRY_COUNT})`);
          
          clearTimeout(safetyTimeout);
          setTimeout(checkSession, delay);
        } else {
          // Maximum d'essais atteint
          console.error('Maximum retry count reached');
          clearTimeout(safetyTimeout);
          
          // Déclencher le circuit breaker
          circuitBreakerRef.current = true;
          setTimeout(() => {
            console.log('Resetting circuit breaker');
            circuitBreakerRef.current = false;
          }, CIRCUIT_BREAKER_TIMEOUT);
          
          // Vérifier la présence d'un token pour le mode dégradé
          if (hasToken && DEGRADED_MODE_ENABLED) {
            console.log('Token found, entering degraded mode after retries');
            setState('degraded');
            inDegradedMode.current = true;
            updateAuthCache('degraded');
            localStorage.setItem('auth_degraded_mode', 'true');
            localStorage.setItem('auth_degraded_reason', 'circuit_breaker');
          } else {
            console.log('No token found after retries, setting as unauthenticated');
            setState('unauthenticated');
            updateAuthCache('unauthenticated');
          }
          
          setIsCheckingSession(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error during session check:', error);
      clearTimeout(safetyTimeout);
      
      // Gérer les erreurs inattendues
      setState('unauthenticated');
      updateAuthCache('unauthenticated');
      setIsCheckingSession(false);
    }
  }, [checkCachedAuthStatus, updateAuthCache]);

  // Effet initial pour vérifier la session
  useEffect(() => {
    if (pathname !== undefined) {
      const isPublic = isPublicRoute(pathname);
      if (isPublic) {
        console.log('Public route detected, lightweight auth check');
      }
      
      // Vérifier s'il existe un mode dégradé forcé
      if (localStorage.getItem('auth_force_degraded') === 'true') {
        console.info('Forced degraded mode detected');
        inDegradedMode.current = true;
        setState('degraded');
        setIsCheckingSession(false);
        return;
      }
      
      checkSession();
    }
  }, [pathname, checkSession]);

  // Affichage de l'écran de chargement
  if (state === 'loading' || (isCheckingSession && !isPublicRoute(pathname || ''))) {
    return (
      <LoadingScreen 
        message="Vérification de votre session" 
        subtitle="Merci de patienter..."
        duration={30000}
        isAuthentication={true}
      />
    );
  }
  
  // Affichage de l'interface en cas de problème
  if (showFallbackUI) {
    return (
      <LoadingScreen 
        message="Problème de connexion" 
        subtitle="Nous rencontrons des difficultés pour vérifier votre session."
        hideSpinner={true}
        isAuthentication={true}
      />
    );
  }

  return null;
}

// Ajouter le style CSS pour l'animation de fondu et le délai d'affichage
// (Non utilisé ici mais conservé pour d'autres composants qui pourraient l'utiliser)
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