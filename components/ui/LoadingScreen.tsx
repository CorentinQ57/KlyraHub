import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  showAfterMs?: number;
  hideSpinner?: boolean;
  duration?: number; // Durée maximale après laquelle on affiche des options de récupération
  onTimeout?: () => void; // Callback en cas de timeout
  isAuthentication?: boolean; // Pour différencier les écrans de chargement d'authentification
}

export default function LoadingScreen({
  message = "Chargement en cours...",
  subtitle,
  showAfterMs = 300,
  hideSpinner = false,
  duration = 20000, // 20 secondes par défaut
  onTimeout,
  isAuthentication = false,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(false);
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    // Afficher l'écran de chargement après le délai de showAfterMs
    const timer = setTimeout(() => {
      setVisible(true);
    }, showAfterMs);

    // Afficher le message de retard après 5 secondes
    const delayTimer = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 5000);

    // Afficher les options de récupération après la durée maximale
    const durationTimer = setTimeout(() => {
      setShowRecoveryOptions(true);
      if (onTimeout) onTimeout();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(delayTimer);
      clearTimeout(durationTimer);
    };
  }, [showAfterMs, duration, onTimeout]);

  // Vérifier s'il y a des erreurs d'authentification dans le localStorage
  useEffect(() => {
    if (isAuthentication) {
      const degradedMode = localStorage.getItem('auth_degraded_mode');
      const degradedReason = localStorage.getItem('auth_degraded_reason');
      
      if (degradedMode === 'true') {
        setErrorState(degradedReason || 'unknown');
      }
    }
  }, [isAuthentication]);

  // Fonction pour rafraîchir la page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Fonction pour accéder en mode dégradé
  const handleContinueAnyway = () => {
    localStorage.setItem('auth_force_degraded', 'true');
    window.location.reload();
  };

  // Fonction pour effacer les données d'authentification
  const handleClearAuth = () => {
    // Supprimer tous les tokens liés à l'authentification
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('cached_auth_status');
    localStorage.removeItem('cached_auth_time');
    localStorage.removeItem('auth_degraded_mode');
    localStorage.removeItem('auth_degraded_reason');
    
    // Supprimer les cookies liés à l'authentification
    document.cookie = 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Rafraîchir la page
    window.location.href = '/login';
  };

  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50"
      >
        <div className="flex flex-col items-center justify-center space-y-8 max-w-md px-4 text-center">
          {!hideSpinner && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-12 h-12 text-primary" />
            </motion.div>
          )}
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">{message}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            
            {showDelayedMessage && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-muted-foreground mt-2"
              >
                Le chargement prend plus de temps que prévu...
              </motion.p>
            )}

            {errorState && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md"
              >
                <p className="font-medium">Problème d'authentification détecté</p>
                <p className="text-sm mt-1">
                  {errorState === 'circuit_breaker' && "Timeout lors de la vérification de votre session."}
                  {errorState === 'error' && "Une erreur est survenue lors de la connexion."}
                  {errorState === 'unknown' && "Problème de connexion détecté."}
                </p>
              </motion.div>
            )}
            
            {showRecoveryOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 space-y-4"
              >
                <p className="font-medium text-destructive">Le chargement semble bloqué</p>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Rafraîchir la page
                  </button>
                  
                  {isAuthentication && (
                    <>
                      <button
                        onClick={handleContinueAnyway}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors mt-2"
                      >
                        Continuer en mode limité
                      </button>
                      
                      <button
                        onClick={handleClearAuth}
                        className="px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors mt-2"
                      >
                        Se déconnecter
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 