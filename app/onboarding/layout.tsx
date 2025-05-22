'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuroraBackground } from '@/components/ui/aurora-background';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useSessionPreservation } from '@/hooks/use-session-preservation';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirectionChecked, setRedirectionChecked] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  // Logs détaillés de l'état utilisateur
  useEffect(() => {
    console.log('Onboarding Layout - Detailed User info:', {
      userExists: !!user,
      userType: typeof user,
      userId: user?.id,
      userEmail: user?.email,
      userMetadata: user?.user_metadata,
      isLoadingAuth: isLoading,
      redirectionState: redirectionChecked,
      profileState: profileChecked,
      onboardedState: isOnboarded,
    });
  }, [user, isLoading, redirectionChecked, profileChecked, isOnboarded]);
  
  // Vérifier le statut d'onboarding directement depuis la table profiles
  useEffect(() => {
    if (isLoading) {
      console.log('Auth is still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('No user detected, skipping profile check');
      return;
    }
    
    if (profileChecked) {
      console.log('Profile already checked, skipping check');
      return;
    }
    
    if (!user.id) {
      console.error('User exists but has no ID! User object:', user);
      return;
    }
    
    console.log('Starting profile check for user ID:', user.id);
    
    const checkProfileOnboardingStatus = async () => {
      try {
        console.log('Querying profiles table for user ID:', user.id);
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
          console.log('Profile onboarding query result:', data);
          // Conversion explicite à boolean
          const onboardedStatus = data?.onboarded === true;
          console.log('Profile onboarded status (converted):', onboardedStatus);
          setIsOnboarded(onboardedStatus);
        }
      } catch (err) {
        console.error('Exception checking profile:', err);
        setIsOnboarded(false);
      } finally {
        console.log('Profile check completed');
        setProfileChecked(true);
      }
    };
    
    checkProfileOnboardingStatus();
  }, [user, profileChecked, isLoading]);
  
  // Redirection basée sur le statut d'onboarding vérifié dans la table profiles
  useEffect(() => {
    console.log('Redirect check triggered with states:', {
      redirectionChecked,
      profileChecked,
      isLoading,
      isOnboarded,
    });
    
    if (redirectionChecked) {
      console.log('Redirection already handled, skipping');
      return;
    }
    
    if (!profileChecked && user) {
      console.log('Profile not checked yet but user exists, waiting for profile check');
      return;
    }
    
    if (isLoading) {
      console.log('Auth still loading, skipping redirection');
      return;
    }
    
    console.log('Deciding redirection with user:', !!user, 'and onboarded:', isOnboarded);
    
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
  
  // Utiliser le hook de préservation de session
  useSessionPreservation();
  
  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true}>
      <div className="flex flex-col min-h-screen">
        {/* Header removed */}
        
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
  );
} 