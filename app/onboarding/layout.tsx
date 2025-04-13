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
    if (!isLoading && !user) {
      router.push('/login')
    } else if (!isLoading && user?.user_metadata?.onboarded) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])
  
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