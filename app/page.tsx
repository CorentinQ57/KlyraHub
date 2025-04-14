"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isSessionRestoring } = useAuth()
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Nettoyer le timer précédent si on recharge l'état
    if (redirectTimer) {
      clearTimeout(redirectTimer)
      setRedirectTimer(null)
    }
    
    // N'exécuter la logique de redirection que si l'authentification est chargée
    // et que la restauration de session est terminée
    if (!isLoading && !isSessionRestoring) {
      // Ajouter un délai de grâce avant la redirection
      const timer = setTimeout(() => {
        if (user) {
          console.log("✅ Redirection vers /dashboard après le délai de grâce")
          router.push('/dashboard')
        } else {
          console.log("⚠️ Redirection vers /login après le délai de grâce")
          router.push('/login')
        }
      }, 1500) // Délai de grâce de 1.5s
      
      setRedirectTimer(timer)
      
      return () => {
        clearTimeout(timer)
      }
    }
  }, [user, isLoading, isSessionRestoring, router, redirectTimer])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
} 