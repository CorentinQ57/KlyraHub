"use client"

import { useEffect, useState } from 'react'
import { enforceTokenStorage, supabase } from '@/lib/supabase'

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
  
  useEffect(() => {
    // Marquer que nous commençons le chargement
    if (!sessionLoaded) {
      console.log("🔄 ClientTokenManager initializing session check");
    }
    
    // Premier chargement prioritaire au montage
    const loadSession = async () => {
      if (sessionLoaded) return;
      
      try {
        // Appliquer le stockage renforcé
        enforceTokenStorage();
        
        // Vérifier si nous avons une session valide
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error checking session in ClientTokenManager:", error);
        } else if (data?.session) {
          console.log("✅ Valid session found in ClientTokenManager:", data.session.user?.email);
        } else {
          console.log("⚠️ No valid session in ClientTokenManager");
        }
        
        // Même en cas d'erreur, on marque le chargement comme terminé
        setSessionLoaded(true);
      } catch (error) {
        console.error("❌ Error in ClientTokenManager session load:", error);
        setSessionLoaded(true);
      }
    };
    
    // Lancer le chargement immédiatement
    loadSession();

    // Configurer le rafraîchissement périodique
    const tokenRefreshInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        try {
          enforceTokenStorage();
        } catch (error) {
          console.error("Error in periodic token refresh:", error);
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [sessionLoaded]);

  // This component doesn't render anything visible
  return null;
} 