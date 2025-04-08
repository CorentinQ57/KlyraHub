"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { HeaderNav } from '@/components/HeaderNav'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false)
  const [forceDisplay, setForceDisplay] = useState(false)
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  // Timeout de sécurité pour éviter un loading infini
  useEffect(() => {
    console.log("Dashboard layout - loading state:", isLoading, "user:", user?.email)
    
    if (isLoading) {
      // Après 8 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered in dashboard layout")
        setSafetyTimeout(true)
      }, 8000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, user])
  
  // Fonction pour forcer l'affichage du dashboard
  const handleForceDisplay = () => {
    console.log("User forced display of dashboard")
    setForceDisplay(true)
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
  
  // Ne rien afficher si l'utilisateur n'est pas authentifié (redirection en cours)
  if (!user && !forceDisplay) return null
  
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