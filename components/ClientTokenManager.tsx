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
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const sessionCheckInProgress = useRef(false);
  const mountedRef = useRef(false);
  const initializationAttempted = useRef(false);
  
  const checkSession = async () => {
    if (sessionCheckInProgress.current || !mountedRef.current) return;
    sessionCheckInProgress.current = true;
    
    try {
      console.log("🔄 Checking session in ClientTokenManager");
      
      // Vérifier si des tokens sont disponibles
      const accessToken = localStorage.getItem('sb-access-token') || 
                       localStorage.getItem('supabase.auth.token') ||
                       localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL}-auth-token`);
      
      if (!accessToken) {
        console.log("⚠️ No access token found in ClientTokenManager");
        return;
      }
      
      // Vérifier si le token a besoin d'être rafraîchi
      const lastRefresh = localStorage.getItem('sb-token-last-refresh');
      const now = Date.now();
      const refreshInterval = 30 * 60 * 1000; // 30 minutes
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > refreshInterval) {
        console.log("🔄 Token refresh needed in ClientTokenManager");
        const tokenUpdated = enforceTokenStorage();
        if (!tokenUpdated) {
          console.log("⚠️ Token refresh failed in ClientTokenManager");
          return;
        }
      }
      
      // Vérifier la session avec un timeout
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Session check timeout'));
        }, 5000);
        return () => clearTimeout(timeout);
      });
      
      const sessionPromise = supabase.auth.getSession();
      
      const result = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as AuthResponse;
      
      const { data, error } = result;
      
      if (error) {
        console.error("❌ Error checking session in ClientTokenManager:", error);
        return;
      }
      
      if (data?.session) {
        console.log("✅ Valid session found in ClientTokenManager:", data.session.user?.email);
      } else {
        console.log("⚠️ No valid session in ClientTokenManager");
      }
    } catch (error) {
      console.error("❌ Error in ClientTokenManager session check:", error);
    } finally {
      sessionCheckInProgress.current = false;
    }
  };
  
  useEffect(() => {
    mountedRef.current = true;
    
    const initialize = async () => {
      if (!initializationAttempted.current && !sessionLoaded) {
        initializationAttempted.current = true;
        await checkSession();
        if (mountedRef.current) {
          setSessionLoaded(true);
        }
      }
    };
    
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      initialize();
    } else {
      window.addEventListener('load', initialize);
    }
    
    // Configurer le rafraîchissement périodique
    const tokenRefreshInterval = setInterval(() => {
      if (mountedRef.current) {
        checkSession();
      }
    }, 30 * 60 * 1000); // Toutes les 30 minutes
    
    return () => {
      mountedRef.current = false;
      clearInterval(tokenRefreshInterval);
      window.removeEventListener('load', initialize);
    };
  }, [sessionLoaded]);
  
  return null;
} 