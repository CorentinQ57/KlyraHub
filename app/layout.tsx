import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import AuthProvider from '@/lib/auth'
import { NavigationProvider } from '@/contexts/navigation-context'

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
  return (
    <html lang="fr" suppressHydrationWarning className={poppins.variable}>
      <body className={poppins.className}>
        <AuthProvider>
          <NavigationProvider>
            {children}
            <Toaster />
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 