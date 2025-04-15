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

// SUPPRESSION DE L'INITIALISATION SYNCHRONE PROBLÉMATIQUE

// Types pour le suivi d'authentification
export type AuthVerificationState = 'not_started' | 'in_progress' | 'completed' | 'timed_out' | 'failed';

// TIMEOUTS & RETRY CONSTANTS
const RETRY_COUNT = 3;
const RETRY_DELAY_BASE = 1500; // 1,5 secondes (augmenté pour plus de fiabilité)
const RETRY_DELAY_FACTOR = 1.5; // Facteur de backoff exponentiel
const RETRY_DELAY_JITTER = 300; // Jitter pour éviter les requêtes simultanées
const PRIMARY_TIMEOUT = 12000; // 12 secondes (augmenté pour connexions lentes)
const FALLBACK_TIMEOUT = 10000; // 10 secondes (augmenté pour connexions lentes)
const SAFETY_TIMEOUT = 15000; // 15 secondes (augmenté pour plus de sécurité)
const CIRCUIT_BREAKER_TIMEOUT = 20000; // 20 secondes (augmenté pour plus de fiabilité)
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
  
  return Math.min(exponentialDelay + jitter, 15000); // Maximum 15 secondes
}

// État du gestionnaire de token
type TokenManagerState = 'loading' | 'authenticated' | 'unauthenticated' | 'degraded';

export default function ClientTokenManager() {
  const [state, setState] = useState<TokenManagerState>('loading');
  const [isCheckingSession, setIsCheckingSession] = useState(false); // Modifié pour ne pas bloquer au démarrage
  const retryCountRef = useRef(0);
  const circuitBreakerRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  const inDegradedMode = useRef(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Protection contre les redirections en boucle - simplifiée
  useEffect(() => {
    try {
      const redirectionCount = parseInt(sessionStorage.getItem('redirection_count') || '0');
      if (redirectionCount > 5) {
        console.error('Maximum redirection limit reached');
        circuitBreakerRef.current = true;
        setShowFallbackUI(true);
        setState('degraded');
        return;
      }
      
      // Incrémenter le compteur de redirections
      sessionStorage.setItem('redirection_count', (redirectionCount + 1).toString());
      
      // Réinitialiser après 10 secondes
      const timer = setTimeout(() => {
        sessionStorage.setItem('redirection_count', '0');
      }, 10000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.warn('Error accessing sessionStorage:', error);
      // Continue without setting redirection count
    }
  }, []);

  // Vérification du cache d'authentification - simplifiée et sécurisée
  const checkCachedAuthStatus = useCallback(() => {
    try {
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
        if (!isNaN(cachedTimeMs) && now - cachedTimeMs < 300000) {
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
    } catch (error) {
      console.warn('Error checking cached auth status:', error);
      return false;
    }
  }, []);

  // Mise à jour du cache d'authentification - sécurisée
  const updateAuthCache = useCallback((status: 'authenticated' | 'unauthenticated' | 'degraded') => {
    try {
      localStorage.setItem('cached_auth_status', status);
      localStorage.setItem('cached_auth_time', Date.now().toString());
    } catch (error) {
      console.warn('Error updating auth cache:', error);
    }
  }, []);

  // Redirection en fonction de l'état d'authentification - simplifiée
  useEffect(() => {
    if (hasRedirectedRef.current) return;
    
    // Ne pas rediriger si en cours de chargement
    if (state === 'loading') return;
    
    try {
      const isPublic = isPublicRoute(pathname || '');
      
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
    } catch (error) {
      console.error('Error in redirection effect:', error);
      // Continuer sans redirection en cas d'erreur
    }
  }, [state, pathname, router]);

  // Vérification de session principale - simplifiée et robuste
  const checkSession = useCallback(async () => {
    // Éviter les vérifications multiples
    if (isCheckingSession) return;
    setIsCheckingSession(true);
    
    // Vérifier le circuit breaker
    if (circuitBreakerRef.current) {
      console.warn('Circuit breaker active, skipping session check');
      setState('unauthenticated'); // Fallback à unauthenticated pour permettre la connexion
      setIsCheckingSession(false);
      return;
    }
    
    // Vérifier d'abord le cache
    if (checkCachedAuthStatus()) {
      setIsCheckingSession(false);
      return;
    }

    console.log(`Starting session check (attempt ${retryCountRef.current + 1}/${RETRY_COUNT})`);
    
    // Mise en place du safety timeout - plus simple
    const safetyTimer = setTimeout(() => {
      console.warn(`Safety timeout triggered (${SAFETY_TIMEOUT}ms)`);
      setState('unauthenticated'); // Fallback simple pour permettre la connexion
      setIsCheckingSession(false);
    }, SAFETY_TIMEOUT);
    
    try {
      // Méthode simple avec un seul try/catch
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        clearTimeout(safetyTimer);
        console.log('Valid session found');
        try {
          enforceTokenStorage();
        } catch (storageError) {
          console.warn('Error enforcing token storage:', storageError);
        }
        setState('authenticated');
        updateAuthCache('authenticated');
        setIsCheckingSession(false);
        return;
      }
      
      // Si pas de session, essayer getUser
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userData?.user) {
        clearTimeout(safetyTimer);
        console.log('Valid user found');
        try {
          enforceTokenStorage();
        } catch (storageError) {
          console.warn('Error enforcing token storage:', storageError);
        }
        setState('authenticated');
        updateAuthCache('authenticated');
        setIsCheckingSession(false);
        return;
      }
      
      // Si ni session ni user n'est trouvé
      clearTimeout(safetyTimer);
      console.log('No active session or user found');
      setState('unauthenticated');
      updateAuthCache('unauthenticated');
      setIsCheckingSession(false);
      
    } catch (error) {
      console.error('Error during session check:', error);
      
      // Retry logic - simplifiée
      retryCountRef.current += 1;
      
      if (retryCountRef.current < RETRY_COUNT) {
        const delay = getBackoffDelay(retryCountRef.current);
        console.log(`Retrying session check in ${delay}ms (attempt ${retryCountRef.current + 1}/${RETRY_COUNT})`);
        
        clearTimeout(safetyTimer);
        setTimeout(() => {
          setIsCheckingSession(false);
          checkSession();
        }, delay);
      } else {
        // Maximum d'essais atteint - simplifier à 'unauthenticated'
        clearTimeout(safetyTimer);
        console.error('Maximum retry count reached, setting as unauthenticated');
        setState('unauthenticated');
        setIsCheckingSession(false);
      }
    }
  }, [checkCachedAuthStatus, updateAuthCache, isCheckingSession]);

  // Effet initial pour vérifier la session - simplifié
  useEffect(() => {
    try {
      // Vérifier si nous devrions utiliser une authentification plus légère pour les routes publiques
      const isPublic = pathname ? isPublicRoute(pathname) : false;
      
      if (isPublic) {
        console.log('Public route detected, setting as unauthenticated by default');
        setState('unauthenticated');
      } else {
        // Lancer la vérification complète
        checkSession();
      }
    } catch (error) {
      console.error('Error during initial auth check:', error);
      setState('unauthenticated'); // Fallback pour permettre la connexion
    }
    
    // Vérifier l'authentification à chaque changement de route
    return () => {
      hasRedirectedRef.current = false;
    };
  }, [pathname, checkSession]);

  // ÉCOUTEUR DE STOCKAGE LOCAL SIMPLIFIÉ
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes('auth') || event.key?.includes('sb-')) {
        console.log('Auth-related storage changed, checking status');
        checkSession();
      }
    };
    
    try {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.warn('Error setting up storage listener:', error);
    }
  }, [checkSession]);

  // ÉVÉNEMENT PERSONNALISÉ POUR LE RAFRAÎCHISSEMENT DU TOKEN
  useEffect(() => {
    const handleTokenRefreshed = () => {
      console.log('Token refreshed event received, checking status');
      checkSession();
    };
    
    try {
      window.addEventListener('klyra:token-refreshed', handleTokenRefreshed);
      return () => window.removeEventListener('klyra:token-refreshed', handleTokenRefreshed);
    } catch (error) {
      console.warn('Error setting up token refresh listener:', error);
    }
  }, [checkSession]);

  // CIRCUIT BREAKER TIMER
  useEffect(() => {
    if (circuitBreakerRef.current) {
      const timer = setTimeout(() => {
        console.log('Resetting circuit breaker');
        circuitBreakerRef.current = false;
      }, CIRCUIT_BREAKER_TIMEOUT);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Simple rendering - retourne null pour ne pas bloquer le rendu
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