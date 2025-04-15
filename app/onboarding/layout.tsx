"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AuroraBackground } from '@/components/ui/aurora-background'
import Link from 'next/link'
import Image from 'next/image'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  
  // Check if user has completed onboarding - avec protection contre les redirections en boucle
  useEffect(() => {
    // Ne faire les redirections que si l'état de chargement est terminé et qu'aucune redirection n'a été tentée
    if (!isLoading && !redirectAttempted) {
      if (!user) {
        // Rediriger vers la page de connexion si non connecté
        console.log('Utilisateur non connecté, redirection vers login')
        setRedirectAttempted(true)
        router.push('/login')
      } else if (user.user_metadata?.onboarded === true) {
        // Rediriger vers le dashboard si l'onboarding est déjà complété
        console.log('Utilisateur déjà onboardé, redirection vers le dashboard')
        setRedirectAttempted(true)
        router.push('/dashboard')
      } else {
        console.log('Onboarding en cours pour l\'utilisateur', user?.email, 'Metadata:', user.user_metadata)
      }
    }
  }, [user, isLoading, router, redirectAttempted])
  
  // Si en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <AuroraBackground intensity="subtle" showRadialGradient={true}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm">Chargement de votre profil...</p>
            </div>
          </main>
        </div>
      </AuroraBackground>
    )
  }
  
  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true}>
      <div className="flex flex-col min-h-screen">
        <header className="py-6 border-b border-[#E2E8F0] bg-white/60 backdrop-blur-sm sticky top-0 z-10 flex justify-center">
          <Link href="/" className="flex items-center justify-center">
            <Image 
              src="/images/logo.png" 
              alt="Klyra" 
              width={120} 
              height={36} 
              className="h-9 object-contain"
            />
          </Link>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 overflow-x-hidden">
          {children}
        </main>
        
        <footer className="py-6 border-t border-[#E2E8F0] bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center text-sm text-[#64748B]">
            &copy; {new Date().getFullYear()} Klyra Design. Tous droits réservés.
          </div>
        </footer>
      </div>
    </AuroraBackground>
  )
} 