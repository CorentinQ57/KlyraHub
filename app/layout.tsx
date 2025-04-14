"use client"

import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth'
import { enforceTokenStorage } from '@/lib/supabase'
import { ThemeProvider } from '@/components/theme-provider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Klyra',
  description: 'Plateforme de services de design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Set up the router
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Ensure token storage is properly enforced on every page navigation
    if (typeof window !== 'undefined') {
      try {
        enforceTokenStorage();
      } catch (error) {
        console.error("Error enforcing token storage in layout:", error);
      }
    }
  }, [])

  return (
    <html lang="fr" suppressHydrationWarning className={poppins.variable}>
      <body className={poppins.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
} 