"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { HeaderNav } from '@/components/HeaderNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  // Afficher un état de chargement si on vérifie encore l'authentification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }
  
  // Ne rien afficher si l'utilisateur n'est pas authentifié (redirection en cours)
  if (!user) return null
  
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