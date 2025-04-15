"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AuroraBackground } from '@/components/ui/aurora-background'
import Link from 'next/link'
import Image from 'next/image'
import { getProfileData } from '@/lib/supabase'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!isLoading) {
        if (!user) {
          // Rediriger vers la page de connexion si non connecté
          router.push('/login')
          return
        }
        
        // Vérifie d'abord si l'onboarding est complété dans les métadonnées utilisateur
        if (user?.user_metadata?.onboarded === true) {
          console.log('Utilisateur déjà onboardé selon les métadonnées, redirection vers le dashboard')
          router.push('/dashboard')
          return
        }
        
        // Si pas dans les métadonnées, vérifier dans la table profiles
        try {
          const profileData = await getProfileData(user.id)
          if (profileData && profileData.onboarded === true) {
            console.log('Utilisateur déjà onboardé selon la table profiles, redirection vers le dashboard')
            router.push('/dashboard')
            return
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du profil:', error)
        }
        
        // Si on arrive ici, l'utilisateur n'a pas complété l'onboarding
        console.log('Onboarding en cours pour l\'utilisateur', user?.email)
        setIsChecking(false)
      }
    }
    
    checkOnboardingStatus()
  }, [user, isLoading, router])
  
  // Afficher un état de chargement pendant la vérification
  if (isLoading || isChecking) {
    return (
      <AuroraBackground intensity="subtle" showRadialGradient={true}>
        <div className="flex flex-col min-h-screen justify-center items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#467FF7]"></div>
          <p className="mt-4 text-[14px]">Chargement...</p>
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