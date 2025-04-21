'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { SidebarNav } from '@/components/SidebarNav';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut, reloadAuthState } = useAuth();
  
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false);
  const [forceDisplay, setForceDisplay] = useState(false);
  const [userTypeError, setUserTypeError] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // NOUVEAU: État pour éviter un double affichage de l'UI pendant la transition
  const [contentReady, setContentReady] = useState(false);
  const hasInitialized = useRef(false);
  
  // Vérifier si le chemin actuel est dans la section documentation
  const isDocsRoute = pathname.startsWith('/dashboard/docs');
  
  // Vérifier si la sidebar est repliée
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier l'état initial
      const checkCollapsedState = () => {
        const savedState = localStorage.getItem('sidebar-collapsed');
        setIsSidebarCollapsed(savedState === 'true');
      };
      
      // Vérifier à l'initialisation
      checkCollapsedState();
      
      // Ajouter un écouteur d'événements pour les changements de localStorage
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sidebar-collapsed') {
          setIsSidebarCollapsed(e.newValue === 'true');
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Créer une fonction qui vérifie périodiquement l'état
      const interval = setInterval(checkCollapsedState, 1000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);
  
  // NOUVEAU: Écouter les événements d'authentification personnalisés
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAuthCompleted = (event: CustomEvent) => {
        console.log('[Dashboard Layout] Received auth verification completed event:', event.detail);
        // Permettre le rendu du contenu après vérification de l'authentification
        if (!hasInitialized.current) {
          setContentReady(true);
          hasInitialized.current = true;
        }
      };
      
      window.addEventListener('klyra:auth-verification-completed', handleAuthCompleted as EventListener);
      
      return () => {
        window.removeEventListener('klyra:auth-verification-completed', handleAuthCompleted as EventListener);
      };
    }
  }, []);
  
  // Vérifier que l'utilisateur est valide et rediriger si nécessaire
  useEffect(() => {
    // Si on est dans la documentation, pas besoin de vérification d'authentification
    if (isDocsRoute) {
      return;
    }
    
    // Vérifier si user est un objet ou une chaîne
    const userType = typeof user;
    const isValidUser = user && userType === 'object' && 'id' in user;
    
    if (userType === 'string' || (user && !isValidUser)) {
      console.error('Erreur critique: user n\'est pas un objet valide dans le dashboard layout', { 
        userType, 
        user,
        hasId: user && userType === 'object' ? 'id' in user : false,
      });
      setUserTypeError(true);
    } else {
      setUserTypeError(false);
    }
    
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    // et qu'il n'est pas sur une route de documentation
    if (!isLoading && !user) {
      router.push('/login');
    }
    
    // NOUVEAU: Si l'authentification est terminée et que l'utilisateur est valide, marquer comme prêt
    if (!isLoading && user && isValidUser && !contentReady) {
      setContentReady(true);
      hasInitialized.current = true;
    }
  }, [user, isLoading, router, pathname, isDocsRoute, contentReady]);
  
  // Timeout de sécurité pour éviter un loading infini - RÉDUIT À 4 SECONDES
  useEffect(() => {
    // Ignorer le timeout pour les pages de documentation
    if (isDocsRoute) {
      return;
    }
    
    // Log détaillé pour déboguer le type de user
    console.log('Dashboard layout - loading state:', {
      isLoading,
      userType: typeof user,
      userEmail: user && typeof user === 'object' ? user.email : null,
      hasId: user && typeof user === 'object' ? 'id' in user : false,
      pathname,
    });
    
    if (isLoading && !contentReady) {
      // Après 4 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log('Safety timeout triggered in dashboard layout (4s)');
        setSafetyTimeout(true);
        
        // NOUVEAU: Même sans action utilisateur, autoriser l'affichage après le timeout
        if (!hasInitialized.current) {
          console.log('Auto-initializing content display after timeout');
          setContentReady(true);
          hasInitialized.current = true;
        }
        
        // Vérifier l'état des tokens
        const accessToken = localStorage.getItem('sb-access-token');
        const refreshToken = localStorage.getItem('sb-refresh-token');
        console.log('Token state at timeout:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
        
        // Si aucun token n'est présent, rediriger vers la page de connexion
        if (!accessToken && !refreshToken) {
          console.log('No tokens found, redirecting to login');
          router.push('/login');
        }
      }, 4000); // RÉDUIT DE 8 À 4 SECONDES
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, user, isDocsRoute, router, pathname, contentReady]);
  
  // Fonction pour forcer la déconnexion en cas d'erreur de type
  const handleForceSignOut = async () => {
    console.log('Forcing sign out due to user type error');
    try {
      await signOut();
    } catch (error) {
      console.error('Error during forced sign out:', error);
      // Redirection manuelle en cas d'échec du signOut
      router.push('/login');
    }
  };
  
  // Fonction pour forcer l'affichage du dashboard
  const handleForceDisplay = () => {
    console.log('User forced display of dashboard');
    // Activer l'affichage forcé
    setForceDisplay(true);
    // Autoriser le rendu du contenu
    setContentReady(true);
    hasInitialized.current = true;
    // Si l'utilisateur est défini mais n'a pas de rôle, définir isAdmin par défaut à false
    if (user && typeof user === 'object' && 'id' in user) {
      console.log('Forcing default role assignment');
    }
  };
  
  // Fonction pour forcer le rafraîchissement de l'état d'authentification
  const handleForceReload = async () => {
    try {
      console.log('User requested auth state reload');
      setIsReloading(true);
      await reloadAuthState();
    } catch (error) {
      console.error('Error during force reload:', error);
      // En cas d'échec, forcer l'affichage quand même
      handleForceDisplay();
    } finally {
      setIsReloading(false);
    }
  };
  
  // MODIFIÉ: Afficher un indicateur de chargement non bloquant si on vérifie encore l'authentification
  const LoadingOverlay = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 p-2 text-center shadow-md animate-fadeIn">
      <div className="inline-flex items-center">
        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="text-sm">Vérification de l'authentification...</p>
      </div>
    </div>
  );
  
  // MODIFIÉ: Afficher le message de timeout comme un toast au lieu d'un écran bloquant
  const TimeoutMessage = () => (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-fadeIn">
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-4 flex items-start shadow-lg border border-yellow-100">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Vérification de la session en cours</p>
          <p className="text-sm mt-1">L'authentification prend plus de temps que prévu.</p>
          <div className="mt-2 flex space-x-2">
            <Button 
              onClick={handleForceReload}
              className="text-xs h-8 px-2"
              variant="outline"
              disabled={isReloading}
            >
              {isReloading ? '...' : 'Rafraîchir'}
            </Button>
            <Button 
              onClick={handleForceDisplay}
              className="text-xs h-8 px-2"
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // NOUVEAU: Cas particulier pour les erreurs de type d'utilisateur
  if (userTypeError && !isDocsRoute) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 shadow-lg max-w-md">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Erreur de session</h2>
          <p className="text-sm text-red-600 mb-4">Une erreur est survenue avec votre session. Veuillez vous reconnecter.</p>
          <div className="flex justify-end">
            <Button onClick={handleForceSignOut} variant="destructive">
              Se reconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // MODIFIÉ: Afficher le contenu principal même si isLoading est encore true
  // Seules les routes nécessitant une authentification stricte doivent être retardées
  const shouldShowContent = contentReady || forceDisplay || isDocsRoute;
  
  return (
    <>
      {isLoading && !isDocsRoute && <LoadingOverlay />}
      {safetyTimeout && !forceDisplay && !isDocsRoute && <TimeoutMessage />}
      
      {shouldShowContent && (
        <div className="flex min-h-screen">
          <SidebarNav />
          <main 
            className={cn(
              'flex-1 pt-16 lg:pt-0 transition-all duration-300 ease-in-out',
              isSidebarCollapsed ? 'lg:pl-[70px]' : 'lg:pl-[240px]'
            )}
          >
            {children}
          </main>
        </div>
      )}
    </>
  );
} 