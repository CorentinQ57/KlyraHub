"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { enforceTokenStorage, debugAuthState } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { AuthResponse } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { toast } from '@/components/ui/use-toast'
import { useSupabase } from '@/hooks/useSupabase'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useToast } from '@/components/ui/use-toast'

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
const PRIMARY_TIMEOUT = 8000; // Augmenté de 4000 à 8000ms
const FALLBACK_TIMEOUT = 5000; // Augmenté de 3000 à 5000ms
const SAFETY_TIMEOUT = 12000; // Timeout de sécurité
const CIRCUIT_BREAKER_TIMEOUT = 20000; // 20 secondes (augmenté pour plus de fiabilité)
const DEGRADED_MODE_ENABLED = true; // Activer le mode dégradé en cas d'échec
const MAX_RETRIES = 3; // Nombre maximum de tentatives
const INITIAL_BACKOFF = 1000; // Délai initial pour le backoff exponentiel

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
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  // État principal
  const [state, setState] = useState<TokenManagerState>('loading');
  
  // Références pour éviter les effets indésirables
  const circuitBreakerRef = useRef<boolean>(false);
  const circuitBreakerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const checkInProgressRef = useRef<boolean>(false);
  const hasRedirectedRef = useRef<boolean>(false);
  const inDegradedMode = useRef<boolean>(false);
  const latestSessionRef = useRef<Session | null>(null);
  
  // Protection contre les redirections en boucle - simplifiée
  useEffect(() => {
    try {
      // Utiliser localStorage pour un compteur de redirection plus persistant
      const redirectionCount = parseInt(localStorage.getItem('redirection_count') || '0');
      const lastRedirectionTime = parseInt(localStorage.getItem('last_redirection_time') || '0');
      const now = Date.now();
      
      // Si la dernière redirection était il y a plus de 30 secondes, réinitialiser le compteur
      if (now - lastRedirectionTime > 30000) {
        localStorage.setItem('redirection_count', '0');
        localStorage.setItem('last_redirection_time', now.toString());
      } 
      // Sinon, si trop de redirections récentes, activer le circuit breaker
      else if (redirectionCount > 3) {
        console.error('Circuit breaker: Maximum redirection limit reached');
        circuitBreakerRef.current = true;
        inDegradedMode.current = true;
        setState('degraded');
        toast({
          title: "Mode dégradé activé",
          description: "Trop de redirections détectées. L'application fonctionne en mode limité.",
          variant: "destructive"
        });
        
        // Forcer le mode dégradé pendant 2 minutes
        localStorage.setItem('auth_force_degraded', 'true');
        setTimeout(() => {
          localStorage.removeItem('auth_force_degraded');
        }, 120000);
        
        return;
      }
      
      // Garder trace du temps de dernière redirection
      localStorage.setItem('last_redirection_time', now.toString());
    } catch (error) {
      console.warn('Error accessing localStorage for redirection protection:', error);
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

  // Effet redirection avec protection améliorée
  useEffect(() => {
    // Si circuit breaker actif, ne pas rediriger
    if (circuitBreakerRef.current) return;
    
    // Ne pas rediriger en mode dégradé
    if (state === 'degraded') return;
    
    // Ne pas rediriger si en cours de chargement
    if (state === 'loading') return;
    
    // Protection: ne pas rediriger si déjà redirigé récemment
    if (hasRedirectedRef.current) return;
    
    try {
      const now = Date.now();
      const lastRedirectionTime = parseInt(localStorage.getItem('last_redirection') || '0');
      
      // Vérifie si une redirection a eu lieu dans les 5 dernières secondes
      if (now - lastRedirectionTime < 5000) {
        console.warn('Skipping redirection: too recent');
        return;
      }
      
      const isPublic = isPublicRoute(pathname || '');
      
      if (state === 'authenticated') {
        // Si connecté et sur une page de login, rediriger vers le dashboard
        if (loginRoutes.includes(pathname || '')) {
          console.log('Authenticated user on login page, redirecting to dashboard');
          hasRedirectedRef.current = true;
          localStorage.setItem('last_redirection', now.toString());
          
          // Incrémenter compteur pour le circuit breaker
          const count = parseInt(localStorage.getItem('redirection_count') || '0');
          localStorage.setItem('redirection_count', (count + 1).toString());
          
          router.push('/dashboard');
        }
      } else if (state === 'unauthenticated') {
        // Si non connecté et sur une page protégée, rediriger vers la connexion
        if (!isPublic) {
          console.log('Unauthenticated user on protected page, redirecting to login');
          hasRedirectedRef.current = true;
          localStorage.setItem('last_redirection', now.toString());
          
          // Incrémenter compteur pour le circuit breaker
          const count = parseInt(localStorage.getItem('redirection_count') || '0');
          localStorage.setItem('redirection_count', (count + 1).toString());
          
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error in redirection effect:', error);
    }
  }, [state, pathname, router]);

  // Vérification de session principale - simplifiée et robuste
  const checkSession = useCallback(async (options: { isRetry?: boolean, isInitial?: boolean } = {}) => {
    // Eviter les vérifications simultanées
    if (checkInProgressRef.current) {
      console.log('[ClientTokenManager] Session check already in progress, skipping');
      return;
    }
    
    // Respecter le circuit breaker
    if (circuitBreakerRef.current) {
      console.warn('[ClientTokenManager] Circuit breaker active, skipping session check');
      return;
    }
    
    try {
      checkInProgressRef.current = true;
      
      // Vérifier si nous sommes sur une route publique
      const isPublic = isPublicRoute(pathname || '');
      
      // Si l'utilisateur est déjà considéré comme authentifié et sur une route publique, 
      // on ne retente pas la vérification
      if (state === 'authenticated' && isPublic && !options.isRetry && !options.isInitial) {
        console.log('[ClientTokenManager] Already authenticated on public route, skipping check');
        checkInProgressRef.current = false;
        return;
      }
            
      console.log(`[ClientTokenManager] Checking session (retry: ${options.isRetry}, initial: ${options.isInitial})`);
      
      // Implémentation du timeout
      const timeoutId = setTimeout(() => {
        console.error('[ClientTokenManager] Session check timed out');
        checkInProgressRef.current = false;
        
        // Incrémenter les tentatives pour le backoff
        if (options.isRetry) {
          retryCountRef.current++;
        }
        
        // Si nous avons atteint le nombre maximum de tentatives
        if (retryCountRef.current >= MAX_RETRIES) {
          console.error(`[ClientTokenManager] Maximum retries (${MAX_RETRIES}) reached, activating circuit breaker`);
          circuitBreakerRef.current = true;
          
          // Active le circuit breaker pour 30 secondes
          if (circuitBreakerTimerRef.current) {
            clearTimeout(circuitBreakerTimerRef.current);
          }
          
          circuitBreakerTimerRef.current = setTimeout(() => {
            console.log('[ClientTokenManager] Resetting circuit breaker');
            circuitBreakerRef.current = false;
            retryCountRef.current = 0;
          }, 30000);
          
          // En mode dégradé après échec complet
          inDegradedMode.current = true;
          setState('degraded');
          
          // Notification du mode dégradé
          toast({
            title: "Mode dégradé activé",
            description: "L'application fonctionne en mode limité suite à un problème d'authentification.",
            variant: "destructive"
          });
          
          return;
        }
        
        // Sinon, réessayer avec backoff
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = getBackoffDelay(retryCountRef.current);
          console.log(`[ClientTokenManager] Retrying session check in ${delay}ms (attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`);
          
          setTimeout(() => {
            checkSession({ isRetry: true });
          }, delay);
        }
      }, PRIMARY_TIMEOUT);
      
      // Forcer l'utilisation correcte des tokens
      const tokensValid = await enforceTokenStorage();
      
      // Si mode forcé dégradé, l'activer
      if (localStorage.getItem('auth_force_degraded') === 'true') {
        setState('degraded');
        inDegradedMode.current = true;
        console.warn('[ClientTokenManager] Forced degraded mode active');
        clearTimeout(timeoutId);
        checkInProgressRef.current = false;
        return;
      }

      console.log('[ClientTokenManager] Getting user with auth state:', debugAuthState());
      
      // Récupérer l'utilisateur
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Annuler le timeout car la réponse est arrivée
      clearTimeout(timeoutId);
        
        if (error) {
        console.error('[ClientTokenManager] Error getting user:', error.message);
        
        // Réessayer avec backoff si ce n'est pas déjà une tentative
        if (!options.isRetry && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          const delay = getBackoffDelay(retryCountRef.current);
          console.log(`[ClientTokenManager] Will retry getUser in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          
          setTimeout(() => {
            checkSession({ isRetry: true });
          }, delay);
        } else {
          // Si c'était une tentative ou max retries atteint
          await emergencyRecovery();
        }
      } else if (user) {
        // Utilisateur trouvé, authentifié
        console.log('[ClientTokenManager] User is authenticated');
        setState('authenticated');
        retryCountRef.current = 0; // réinitialiser le compteur de tentatives
        dispatchAuthEvent('authenticated', user);
      } else {
        // Pas d'utilisateur, non authentifié
        console.log('[ClientTokenManager] User is not authenticated');
        setState('unauthenticated');
        retryCountRef.current = 0; // réinitialiser le compteur de tentatives
        dispatchAuthEvent('unauthenticated', null);
      }
    } catch (error) {
      console.error('[ClientTokenManager] Error during session check:', error);
      
      // Tentative de récupération d'urgence
      await emergencyRecovery();
    } finally {
      checkInProgressRef.current = false;
    }
  }, [supabase, state, pathname, isPublicRoute, getBackoffDelay, toast]);

  // Effet initial pour vérifier la session - simplifié avec protection supplémentaire
  useEffect(() => {
    let isMounted = true;
    
    try {
      // Une seule vérification par montage du composant
      const sessionCheckedBefore = sessionStorage.getItem('session_checked');
      if (sessionCheckedBefore === 'true') {
        console.log('Session already checked in this browser session, skipping');
        return;
      }
      
      sessionStorage.setItem('session_checked', 'true');
      
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
    
    // Nettoyer
    return () => {
      isMounted = false;
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

  // Fonction de récupération d'urgence
  const emergencyRecovery = useCallback(async () => {
    console.log('[ClientTokenManager] Attempting emergency recovery');
    
    // Si le circuit breaker est actif, ne pas tenter de récupération
    if (circuitBreakerRef.current) {
      console.warn('[ClientTokenManager] Circuit breaker active, skipping emergency recovery');
      inDegradedMode.current = true;
      setState('degraded');
      return;
    }
    
    try {
      // Implémentation du timeout pour la récupération d'urgence
      const emergencyTimeoutId = setTimeout(() => {
        console.error('[ClientTokenManager] Emergency recovery timed out');
        inDegradedMode.current = true;
        setState('degraded');
      }, FALLBACK_TIMEOUT);
      
      // Dernier essai pour récupérer l'utilisateur
      const { data: { user }, error } = await supabase.auth.getUser();
      
      clearTimeout(emergencyTimeoutId);
      
      if (error || !user) {
        console.error('[ClientTokenManager] Emergency getUser failed:', error?.message);
        
        // Tenter de forcer le stockage des tokens
        const tokensValid = await enforceTokenStorage();
        
        if (tokensValid) {
          console.log('[ClientTokenManager] Tokens enforced successfully during emergency');
          
          // Retry la récupération de l'utilisateur une dernière fois
          const { data: { user: recoveredUser }, error: retryError } = await supabase.auth.getUser();
          
          if (recoveredUser && !retryError) {
            console.log('[ClientTokenManager] Successfully recovered user session');
            setState('authenticated');
            dispatchAuthEvent('authenticated', recoveredUser);
            return;
          }
        }
        
        // Si tout échoue, passer en mode dégradé
        console.error('[ClientTokenManager] Complete authentication failure, switching to degraded mode');
        inDegradedMode.current = true;
        setState('degraded');
        
        // Notification du mode dégradé
        toast({
          title: "Mode dégradé activé",
          description: "L'application fonctionne en mode limité suite à un problème d'authentification.",
          variant: "destructive"
        });
      } else {
        // L'utilisateur a été récupéré avec succès
        console.log('[ClientTokenManager] Emergency recovery successful');
        setState('authenticated');
        dispatchAuthEvent('authenticated', user);
      }
    } catch (error) {
      console.error('[ClientTokenManager] Error during emergency recovery:', error);
      inDegradedMode.current = true;
      setState('degraded');
    }
  }, [supabase, toast]);
  
  // Déclencher un événement d'authentification
  const dispatchAuthEvent = useCallback((status: 'authenticated' | 'unauthenticated', user: any) => {
    // Créer et déclencher un événement global pour l'authentification
    const event = new CustomEvent('auth_state_change', { 
      detail: { status, user } 
    });
    window.dispatchEvent(event);
    
    // Stocker dans le localStorage pour la synchronisation entre onglets
    try {
      localStorage.setItem('auth_status', status);
      localStorage.setItem('auth_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Unable to write auth status to localStorage:', error);
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