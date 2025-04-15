"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/lib/auth'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Logo } from "@/components/Logo"

// Background Mesh Component
const BackgroundMesh = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E6EDFD] via-[#B8CBFC] to-[#7FA3F9] opacity-30" />
      <div className="absolute w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#467FF7] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#F7A6C1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#A6F0C6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Récupérer le paramètre returnTo pour redirection après login
  const [returnTo, setReturnTo] = useState('/dashboard')

  useEffect(() => {
    setMounted(true)
    // Vérifier si l'utilisateur est déjà connecté
    if (mounted && user) {
      router.push('/dashboard')
    }

    // Récupérer le paramètre returnTo de l'URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const returnPath = urlParams.get('returnTo')
      if (returnPath) {
        setReturnTo(decodeURIComponent(returnPath))
      }
    }
  }, [user, router, mounted])

  // Fonction de connexion
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await signIn(email, password)
      if (error) throw error

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })

      // Rediriger vers returnTo au lieu de /dashboard en dur
      router.push(returnTo)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Erreur de connexion')
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // If not mounted yet (server-side), don't show login content to prevent hydration errors
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <BackgroundMesh />
        <header className="px-4 lg:px-6 h-16 flex items-center relative z-10">
          <Logo />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
              <CardDescription>Chargement...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundMesh />
      <header className="px-4 lg:px-6 h-16 flex items-center relative z-10">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <div className="text-sm text-gray-500">
              Vous n&apos;avez pas de compte?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
} 
} 