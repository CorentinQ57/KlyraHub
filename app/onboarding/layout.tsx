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
  const [redirectionChecked, setRedirectionChecked] = useState(false)
  
  // Check if user has completed onboarding
  useEffect(() => {
    // Avoid multiple checks
    if (redirectionChecked) return;
    
    if (!isLoading) {
      // Log user details for debugging
      console.log('Onboarding Layout - User info:', {
        user: user?.email,
        isLoading,
        userMetadata: user?.user_metadata,
        hasOnboardedFlag: user?.user_metadata?.onboarded
      });
      
      if (!user) {
        // Rediriger vers la page de connexion si non connecté
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
        setRedirectionChecked(true);
      } else if (user?.user_metadata?.onboarded === true) {
        // Rediriger vers le dashboard si l'onboarding est déjà complété
        console.log('User already onboarded, redirecting to dashboard');
        router.push('/dashboard');
        setRedirectionChecked(true);
      } else {
        // Check if user_metadata exists, if not, the user is new and needs onboarding
        if (!user.user_metadata) {
          console.log('New user detected (no metadata), staying on onboarding');
          setRedirectionChecked(true);
        } else {
          console.log('Onboarding in progress for user', user?.email);
          setRedirectionChecked(true);
        }
      }
    }
  }, [user, isLoading, router, redirectionChecked]);
  
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