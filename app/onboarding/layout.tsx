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
  const { user, isLoading, isSessionRestoring } = useAuth()
  const router = useRouter()
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null)
  
  // Check if user has completed onboarding
  useEffect(() => {
    // Ne pas rediriger pendant la restauration de session
    if (isSessionRestoring) {
      console.log("🔄 Restauration de session en cours dans onboarding, pas de redirection");
      return;
    }
    
    if (!isLoading) {
      if (!user) {
        // Rediriger vers la page de connexion si non connecté après un délai
        console.log("⚠️ Onboarding: utilisateur non authentifié, préparation redirection vers login");
        setRedirectTarget('/login');
      } else if (user?.user_metadata?.onboarded === true) {
        // Rediriger vers le dashboard si l'onboarding est déjà complété après un délai
        console.log('✅ Utilisateur déjà onboardé, préparation redirection vers dashboard');
        setRedirectTarget('/dashboard');
      } else {
        console.log('ℹ️ Onboarding en cours pour l\'utilisateur', user?.email);
        setRedirectTarget(null);
      }
    }
  }, [user, isLoading, isSessionRestoring])
  
  // Effectuer la redirection avec un délai de grâce
  useEffect(() => {
    if (redirectTarget && !isSessionRestoring) {
      // Ajouter un délai de grâce avant la redirection
      const redirectTimer = setTimeout(() => {
        console.log(`✅ Redirection vers ${redirectTarget} après délai`);
        router.push(redirectTarget);
      }, 1500); // Délai de grâce de 1.5s
      
      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [redirectTarget, router, isSessionRestoring]);

  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true}>
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.svg" 
                alt="Klyra Logo" 
                width={32} 
                height={32} 
              />
              <span className="text-xl font-semibold">Klyra</span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </AuroraBackground>
  )
} 