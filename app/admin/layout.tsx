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
  const { user, isAdmin, isLoading } = useAuth()
  // État pour gérer un timeout de sécurité
  const [safetyTimeout, setSafetyTimeout] = useState(false)
  const [forceDisplay, setForceDisplay] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isLoading, router])
  
  // Timeout de sécurité pour éviter un loading infini
  useEffect(() => {
    console.log("Admin layout - loading state:", isLoading, "user:", user?.email, "isAdmin:", isAdmin)
    
    if (isLoading) {
      // Après 8 secondes, montrer un bouton pour forcer l'affichage
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered in admin layout")
        setSafetyTimeout(true)
      }, 8000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, user, isAdmin])
  
  // Fonction pour forcer l'affichage du dashboard
  const handleForceDisplay = () => {
    console.log("User forced display of admin panel")
    setForceDisplay(true)
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
                  <p className="text-sm mt-1">Vous pouvez forcer l'affichage du panel admin si vous êtes sûr d'être connecté avec un compte administrateur.</p>
                </div>
              </div>
              <Button 
                onClick={handleForceDisplay}
                className="w-full"
              >
                Continuer vers le panel admin
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isAdmin && !forceDisplay) {
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