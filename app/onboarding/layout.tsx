"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AuroraBackground } from '@/components/ui/aurora-background'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [redirectionChecked, setRedirectionChecked] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [isOnboarded, setIsOnboarded] = useState(false)
  
  // Vérifier le statut d'onboarding directement depuis la table profiles
  useEffect(() => {
    if (!user || profileChecked) return;
    
    const checkProfileOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking profile onboarding status:', error);
          // En cas d'erreur, on reste prudent et on considère que l'utilisateur n'a pas fait l'onboarding
          setIsOnboarded(false);
        } else {
          console.log('Profile onboarding status:', data?.onboarded);
          setIsOnboarded(!!data?.onboarded);
        }
      } catch (err) {
        console.error('Exception checking profile:', err);
        setIsOnboarded(false);
      } finally {
        setProfileChecked(true);
      }
    };
    
    checkProfileOnboardingStatus();
  }, [user, profileChecked]);
  
  // Redirection basée sur le statut d'onboarding vérifié dans la table profiles
  useEffect(() => {
    if (redirectionChecked || !profileChecked || isLoading) return;
    
    if (!user) {
      // Rediriger vers la page de connexion si non connecté
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      setRedirectionChecked(true);
    } else if (isOnboarded) {
      // Rediriger vers le dashboard si l'onboarding est déjà complété selon la table profiles
      console.log('User already onboarded (from profiles table), redirecting to dashboard');
      router.push('/dashboard');
      setRedirectionChecked(true);
    } else {
      // L'utilisateur n'a pas complété l'onboarding, le laisser accéder
      console.log('User not onboarded, allowing access to onboarding page');
      setRedirectionChecked(true);
    }
  }, [user, isLoading, router, redirectionChecked, profileChecked, isOnboarded]);
  
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