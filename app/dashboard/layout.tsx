"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { HeaderNav } from '@/components/HeaderNav'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false)
  const [forceDisplay, setForceDisplay] = useState(false)
  const [userTypeError, setUserTypeError] = useState(false)
  
  // Vérifier que l'utilisateur est valide et rediriger si nécessaire
  useEffect(() => {
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
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  // Timeout de sécurité pour éviter un loading infini
  useEffect(() => {
    // Log détaillé pour déboguer le type de user
    console.log("Dashboard layout - loading state:", isLoading, 
                "user type:", typeof user, 
                "user email:", user && typeof user === 'object' ? user.email : user,
                "has id:", user && typeof user === 'object' ? 'id' in user : false)
    
    if (isLoading) {
      // Après 8 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered in dashboard layout")
        setSafetyTimeout(true)
      }, 8000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, user])
  
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
    console.log("User forced display of dashboard")
    setForceDisplay(true)
  }
  
  // Afficher un message d'erreur si user n'est pas un objet valide
  if (userTypeError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erreur d'authentification</p>
              <p className="text-sm mt-1">Un problème est survenu avec votre session. Veuillez vous reconnecter.</p>
            </div>
          </div>
          <Button 
            onClick={handleForceSignOut}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    )
  }
  
  // Afficher un état de chargement si on vérifie encore l'authentification
  if (isLoading && !forceDisplay) {
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
                  <p className="text-sm mt-1">Vous pouvez forcer l'affichage du dashboard si vous êtes sûr d'être connecté.</p>
                </div>
              </div>
              <Button 
                onClick={handleForceDisplay}
                className="w-full"
              >
                Continuer vers le dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Vérifier que l'utilisateur existe et est valide avant d'afficher le contenu
  const isValidUser = user && typeof user === 'object' && 'id' in user
  
  // Ne rien afficher si l'utilisateur n'est pas authentifié (redirection en cours)
  if ((!isValidUser && !forceDisplay)) return null
  
  // Afficher le layout avec la navigation pour les utilisateurs authentifiés
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  )
} 