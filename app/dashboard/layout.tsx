"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { SidebarNav } from '@/components/SidebarNav'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, signOut, reloadAuthState, isAdmin } = useAuth()
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false)
  const [forceDisplay, setForceDisplay] = useState(false)
  const [userTypeError, setUserTypeError] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  // Nouvel état pour détecter un chargement trop long avec user valide
  const [userDetectedButStillLoading, setUserDetectedButStillLoading] = useState(false)
  // Nouvel état pour suivre si l'utilisateur authentifié est sur la page suffisamment longtemps
  const [authConfirmed, setAuthConfirmed] = useState(false)
  
  // Vérifier si le chemin actuel est dans la section documentation
  const isDocsRoute = pathname.startsWith('/dashboard/docs')
  
  // Vérifier si la sidebar est repliée
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Vérifier l'état initial
      const checkCollapsedState = () => {
        const savedState = localStorage.getItem('sidebar-collapsed')
        setIsSidebarCollapsed(savedState === 'true')
      }
      
      // Vérifier à l'initialisation
      checkCollapsedState()
      
      // Ajouter un écouteur d'événements pour les changements de localStorage
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sidebar-collapsed') {
          setIsSidebarCollapsed(e.newValue === 'true')
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      // Créer une fonction qui vérifie périodiquement l'état
      const interval = setInterval(checkCollapsedState, 1000)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }
  }, [])
  
  // Vérifier que l'utilisateur est valide et rediriger si nécessaire
  useEffect(() => {
    // Si on est dans la documentation, pas besoin de vérification d'authentification
    if (isDocsRoute) return
    
    // Vérifier si user est un objet ou une chaîne
    const userType = typeof user
    const isValidUser = user && userType === 'object' && 'id' in user
    
    if (userType === 'string' || (user && !isValidUser)) {
      console.error("Erreur critique: user n'est pas un objet valide dans le dashboard layout", { 
        userType, 
        user,
        hasId: user && userType === 'object' ? 'id' in user : false
      })
      setUserTypeError(true)
    } else {
      setUserTypeError(false)
    }
    
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    // et qu'il n'est pas sur une route de documentation
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router, pathname, isDocsRoute])
  
  // Timeout de sécurité pour éviter un loading infini
  useEffect(() => {
    // Ignorer le timeout pour les pages de documentation
    if (isDocsRoute) return
    
    // Log détaillé pour déboguer le type de user
    console.log("Dashboard layout - loading state:", isLoading, 
                "user type:", typeof user, 
                "user email:", user && typeof user === 'object' ? user.email : user,
                "has id:", user && typeof user === 'object' ? 'id' in user : false)
    
    if (isLoading) {
      // Après 5 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered in dashboard layout")
        setSafetyTimeout(true)
      }, 5000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, user, isDocsRoute])
  
  // Détecter si l'utilisateur est valide mais que isLoading reste bloqué
  useEffect(() => {
    // Si on a un utilisateur valide mais que isLoading reste à true
    if (isLoading && user && typeof user === 'object' && 'id' in user) {
      // Après 500ms, considérer que c'est un bug de isLoading
      const timeoutId = setTimeout(() => {
        console.log("👨‍💻 User détecté mais isLoading toujours actif, autorisant l'affichage du dashboard");
        setUserDetectedButStillLoading(true);
      }, 500); // Réduit à 500ms pour plus de réactivité
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, user]);
  
  // Confirmer l'authentification après un certain temps pour éviter les clignotements
  useEffect(() => {
    if (user && typeof user === 'object' && 'id' in user) {
      const timeoutId = setTimeout(() => {
        setAuthConfirmed(true);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setAuthConfirmed(false);
    }
  }, [user]);
  
  // Ajouter des logs pour mieux comprendre l'état de l'authentification
  useEffect(() => {
    console.log("📊 Dashboard Auth State:", { 
      isLoading, 
      isAdmin, 
      userEmail: user?.email || 'none',
      userDetectedButStillLoading,
      authConfirmed,
      forceDisplay,
      safetyTimeout,
      isValidUser: user && typeof user === 'object' && 'id' in user
    });
  }, [isLoading, user, isAdmin, userDetectedButStillLoading, authConfirmed, forceDisplay, safetyTimeout]);
  
  // Fonction pour forcer la déconnexion en cas d'erreur de type
  const handleForceSignOut = async () => {
    console.log("Forcing sign out due to user type error")
    try {
      await signOut()
    } catch (error) {
      console.error("Error during forced sign out:", error)
      // Redirection manuelle en cas d'échec du signOut
      router.push('/login')
    }
  }
  
  // Fonction pour forcer l'affichage du dashboard
  const handleForceDisplay = () => {
    console.log("User forced display of dashboard");
    // Activer l'affichage forcé
    setForceDisplay(true);
    // Si l'utilisateur est défini mais n'a pas de rôle, définir isAdmin par défaut à false
    if (user && typeof user === 'object' && 'id' in user) {
      console.log("Forcing default role assignment");
    }
  }
  
  // Fonction pour forcer le rafraîchissement de l'état d'authentification
  const handleForceReload = async () => {
    try {
      console.log("User requested auth state reload");
      setIsReloading(true);
      await reloadAuthState();
    } catch (error) {
      console.error("Error during force reload:", error);
      // En cas d'échec, forcer l'affichage quand même
      handleForceDisplay();
    } finally {
      setIsReloading(false);
    }
  }
  
  // Déterminer si l'utilisateur est valide pour l'affichage
  const isValidUser = user && typeof user === 'object' && 'id' in user;
  
  // Déterminer si on doit afficher le dashboard
  // 1. Si c'est une route de documentation, toujours afficher
  // 2. Si l'utilisateur a été détecté (même si on attend encore le rôle)
  // 3. Si forceDisplay est actif
  // 4. Si userDetectedButStillLoading est actif
  const shouldDisplayDashboard = 
    isDocsRoute || 
    isValidUser || 
    forceDisplay || 
    userDetectedButStillLoading ||
    authConfirmed;
  
  // Afficher un état de chargement si on vérifie encore l'authentification
  // et qu'aucune des conditions pour afficher le dashboard n'est remplie
  if (isLoading && !shouldDisplayDashboard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
          
          {safetyTimeout && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Le chargement prend plus de temps que prévu</p>
                  <p className="text-sm mt-1">Vous pouvez essayer de rafraîchir l'authentification ou forcer l'affichage du dashboard.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleForceReload}
                  className="w-full"
                  variant="outline"
                  disabled={isReloading}
                >
                  {isReloading ? "Rafraîchissement..." : "Rafraîchir l'authentification"}
                </Button>
                <Button 
                  onClick={handleForceDisplay}
                  className="w-full"
                >
                  Continuer vers le dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Ne rien afficher et rediriger si l'utilisateur n'est pas authentifié
  // et qu'on ne force pas l'affichage
  if (!shouldDisplayDashboard) {
    // Si on n'est plus en état de chargement et qu'il n'y a pas d'utilisateur,
    // on redirige vers la page de connexion
    if (!isLoading && !user && !isDocsRoute) {
      router.push('/login');
    }
    return null;
  }
  
  // Si on arrive ici, l'une des conditions pour afficher le dashboard est remplie
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main 
        className={cn(
          "flex-1 pt-16 lg:pt-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
        )}
      >
        {children}
      </main>
    </div>
  )
} 