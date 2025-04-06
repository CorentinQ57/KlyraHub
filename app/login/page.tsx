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
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: 'Veuillez remplir tous les champs',
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("Login attempt with email:", email)
      
      const { data, error } = await signIn(email, password)
      
      if (error) {
        console.error("Login error:", error)
        
        // Provide specific error messages based on error type
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Erreur",
            description: 'Email ou mot de passe incorrect',
            variant: "destructive",
            duration: 5000,
          })
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Erreur",
            description: 'Veuillez confirmer votre email avant de vous connecter',
            variant: "destructive",
            duration: 5000,
          })
        } else {
          toast({
            title: "Erreur",
            description: `Erreur de connexion: ${error.message}`,
            variant: "destructive",
            duration: 5000,
          })
        }
        setIsLoading(false)
        return
      }
      
      // Debug - Log session and cookies
      console.log("Session data:", data?.session)
      console.log("Session token:", data?.session?.access_token)
      console.log("All cookies:", document.cookie)
      console.log("Cookies split:", document.cookie.split(';').map(c => c.trim()))
      
      toast({
        title: "Succès",
        description: 'Connexion réussie',
        variant: "default",
        duration: 5000,
      })
      
      // Réinitialiser isLoading avant la redirection
      setIsLoading(false)
      
      // Add a small delay before redirecting to ensure auth state is fully updated
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error("Unexpected login error:", error)
      toast({
        title: "Erreur",
        description: 'Une erreur inattendue est survenue',
        variant: "destructive",
        duration: 5000,
      })
      setIsLoading(false)
    }
  }

  // If not mounted yet (server-side), don't show login content to prevent hydration errors
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <BackgroundMesh />
        <header className="px-4 lg:px-6 h-16 flex items-center relative z-10">
          <Link className="flex items-center justify-center" href="/">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">Klyra Design</span>
          </Link>
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
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">Klyra Design</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-opacity-50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">Connexion</CardTitle>
              <CardDescription className="text-gray-600">Entrez vos identifiants pour accéder à votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50 border-opacity-50 focus:border-[#467FF7] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
                    <Link href="/forgot-password" className="text-sm text-[#467FF7] hover:text-[#3A6FE0] transition-colors">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 border-opacity-50 focus:border-[#467FF7] transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#467FF7] to-[#7FA3F9] hover:from-[#3A6FE0] hover:to-[#6A8FE5] transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-gray-600">
                Vous n&apos;avez pas de compte?{' '}
                <Link href="/signup" className="text-[#467FF7] hover:text-[#3A6FE0] transition-colors">
                  Créer un compte
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 