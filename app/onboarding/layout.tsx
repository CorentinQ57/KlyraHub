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
  
  // Log de débogage pour suivre l'état de l'authentification
  useEffect(() => {
    console.log("OnboardingLayout - Auth State:", { 
      isLoading, 
      userExists: !!user, 
      userEmail: user?.email,
      userMetadata: user?.user_metadata
    })
  }, [user, isLoading])
  
  // Check if user has completed onboarding - Simplifié pour éviter les redirections
  useEffect(() => {
    // Ne rien faire si les données sont en cours de chargement
    if (isLoading) {
      console.log("OnboardingLayout - Chargement en cours...")
      return
    }
    
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!user) {
      console.log("OnboardingLayout - Redirection vers login (pas d'utilisateur)")
      router.push('/login')
      return
    }
    
    // Vérifier si l'utilisateur a déjà complété l'onboarding
    const isOnboarded = user.user_metadata?.onboarded === true
    
    if (isOnboarded) {
      console.log("OnboardingLayout - Redirection vers dashboard (déjà onboardé)")
      router.push('/dashboard')
    } else {
      console.log("OnboardingLayout - Affichage de l'onboarding pour", user.email)
    }
  }, [user, isLoading, router])
  
  // Si en cours de chargement, ne rien afficher encore
  // Cela évite les flashs de contenu avant redirection
  if (isLoading) {
    return (
      <AuroraBackground intensity="subtle" showRadialGradient={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7] mx-auto"></div>
            <p className="mt-4 text-[14px]">Chargement...</p>
          </div>
        </div>
      </AuroraBackground>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
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
    </div>
  )
} 