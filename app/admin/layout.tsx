'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAdmin, isLoading, signOut, reloadAuthState } = useAuth()
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false)
  const [forceDisplay, setForceDisplay] = useState(false)
  const [userTypeError, setUserTypeError] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  // Vérifier que l'utilisateur est valide et a les permissions
  useEffect(() => {
    // Vérifier si user est un objet ou une chaîne
    const userType = typeof user
    const isValidUser = user && userType === 'object' && 'id' in user
    
    if (userType === 'string' || (user && !isValidUser)) {
      console.error("Erreur critique: user n'est pas un objet valide dans le admin layout", { 
        userType, 
        user,
        hasId: user && userType === 'object' ? 'id' in user : false
      })
      setUserTypeError(true)
    } else {
      setUserTypeError(false)
    }
    
    // Vérifier les permissions d'admin
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isLoading, router])
  
  // Timeout de sécurité pour éviter un loading infini
  useEffect(() => {
    // Log détaillé pour déboguer le type de user
    console.log("Admin layout - loading state:", isLoading, 
                "user type:", typeof user, 
                "user email:", user && typeof user === 'object' ? user.email : user,
                "has id:", user && typeof user === 'object' ? 'id' in user : false,
                "isAdmin:", isAdmin)
    
    if (isLoading) {
      // Après 5 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered in admin layout")
        setSafetyTimeout(true)
      }, 5000) // Réduit de 8 à 5 secondes
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, user, isAdmin])
  
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
    console.log("User forced display of admin panel")
    setForceDisplay(true)
  }
  
  // Fonction pour forcer le rafraîchissement de l'état d'authentification
  const handleForceReload = async () => {
    try {
      console.log("User requested auth state reload in admin layout")
      setIsReloading(true)
      await reloadAuthState()
    } catch (error) {
      console.error("Error during force reload in admin layout:", error)
    } finally {
      setIsReloading(false)
    }
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
                  <p className="text-sm mt-1">Vous pouvez essayer de rafraîchir l'authentification ou forcer l'affichage du panel admin.</p>
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
                  Continuer vers le panel admin
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vérifier que l'utilisateur existe, est valide et a les droits admin avant d'afficher le contenu
  const isValidAdminUser = user && typeof user === 'object' && 'id' in user && isAdmin
  
  if (!isValidAdminUser && !forceDisplay) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <Link href="/admin" className="text-xl font-bold text-primary">
            Klyra Admin
          </Link>
        </div>
        <nav className="mt-8 px-4">
          <div className="space-y-4">
            <Link 
              href="/admin" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/projects" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Projets
            </Link>
            <Link 
              href="/admin/services" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Services
            </Link>
            <Link 
              href="/admin/users" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Utilisateurs
            </Link>
            <Link 
              href="/admin/categories" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Catégories
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 