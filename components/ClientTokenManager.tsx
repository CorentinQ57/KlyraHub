"use client"

import { useEffect, useState, useRef } from 'react'
import { enforceTokenStorage } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

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
  
  const checkSession = async () => {
    if (sessionCheckInProgress.current) return;
    sessionCheckInProgress.current = true;
    
    try {
      // Vérifier si le token a besoin d'être rafraîchi
      const lastRefresh = localStorage.getItem('sb-token-last-refresh');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 1 jour en millisecondes
      
      if (!lastRefresh || (now - parseInt(lastRefresh)) > oneDay) {
        console.log("🔄 Token refresh needed");
        const tokenUpdated = enforceTokenStorage();
        if (!tokenUpdated) {
          console.log("⚠️ No valid token found to refresh");
          return;
        }
      }
      
      // Vérifier la session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Error checking session:", error);
        return;
      }
      
      if (data?.session) {
        console.log("✅ Valid session found:", data.session.user?.email);
        // Rafraîchir la session si nécessaire
        await supabase.auth.refreshSession();
      } else {
        console.log("⚠️ No valid session");
      }
    } catch (error) {
      console.error("❌ Error in session check:", error);
    } finally {
      sessionCheckInProgress.current = false;
    }
  };
  
  useEffect(() => {
    mountedRef.current = true;
    
    const initialize = async () => {
      if (!sessionLoaded) {
        await checkSession();
        if (mountedRef.current) {
          setSessionLoaded(true);
        }
      }
    };
    
    initialize();
    
    // Configurer le rafraîchissement périodique
    const tokenRefreshInterval = setInterval(() => {
      if (mountedRef.current) {
        checkSession();
      }
    }, 30 * 60 * 1000); // Toutes les 30 minutes
    
    return () => {
      mountedRef.current = false;
      clearInterval(tokenRefreshInterval);
    };
  }, [sessionLoaded]);
  
  return null;
} 