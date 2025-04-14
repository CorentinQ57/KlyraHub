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
  
  // Check if user has completed onboarding
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Rediriger vers la page de connexion si non connecté
        router.push('/login')
      } else if (user?.user_metadata?.onboarded === true) {
        // Rediriger vers le dashboard si l'onboarding est déjà complété
        console.log('Utilisateur déjà onboardé, redirection vers le dashboard')
        router.push('/dashboard')
      } else {
        console.log('Onboarding en cours pour l\'utilisateur', user?.email)
      }
    }
  }, [user, isLoading, router])
  
  return (
    <AuroraBackground intensity="subtle" showRadialGradient={true}>
      <div className="flex flex-col min-h-screen">
        {/* En-tête supprimée à la demande de l'utilisateur */}
        
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