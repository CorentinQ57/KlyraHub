'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook pour préserver la session lors des redirections importantes
 * comme après l'onboarding ou lors d'un paiement
 */
export function useSessionPreservation() {
  useEffect(() => {
    // Fonction pour vérifier et renforcer la session
    const checkAndPreserveSession = async () => {
      try {
        // Vérifier si la session est active
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('⚠️ No active session detected, attempting to recover');
          
          // Tenter de récupérer les tokens depuis localStorage
          const accessToken = localStorage.getItem('sb-access-token');
          const refreshToken = localStorage.getItem('sb-refresh-token');
          
          if (accessToken && refreshToken) {
            console.log('🔄 Found tokens in localStorage, attempting to restore session');
            
            // Tenter de restaurer la session avec les tokens existants
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('❌ Failed to restore session:', error);
            } else if (data.session) {
              console.log('✅ Session successfully restored');
              
              // S'assurer que les tokens sont correctement stockés dans tous les formats
              const supabaseKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '')}-auth-token`;
              const tokenData = {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                expires_in: 3600,
                token_type: 'bearer',
                user: data.session.user
              };
              
              localStorage.setItem(supabaseKey, JSON.stringify(tokenData));
              localStorage.setItem('sb-access-token', data.session.access_token);
              localStorage.setItem('sb-refresh-token', data.session.refresh_token);
            }
          }
        } else {
          console.log('✅ Active session detected, no restoration needed');
        }
      } catch (error) {
        console.error('❌ Error in checkAndPreserveSession:', error);
      }
    };
    
    // Exécuter immédiatement et configurer une vérification périodique
    checkAndPreserveSession();
    
    // Configurer une vérification toutes les 5 minutes pour les sessions longues
    const interval = setInterval(checkAndPreserveSession, 5 * 60 * 1000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, []);
}

export default useSessionPreservation; 