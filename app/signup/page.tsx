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

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { signUp, user } = useAuth()
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
    
    // Basic form validation
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Erreur",
        description: 'Veuillez remplir tous les champs',
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: 'Les mots de passe ne correspondent pas',
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    try {
      setIsLoading(true)
      console.log("Signup attempt with email:", email)
      
      const { data, error } = await signUp(email, password, fullName)
      console.log("Signup response:", { data: !!data, error })
      
      if (error) {
        console.error("Signup error:", error)
        
        // Provide specific error messages based on error type
        if (error.message.includes('already registered')) {
          toast({
            title: "Erreur",
            description: 'Cet email est déjà utilisé',
            variant: "destructive",
            duration: 5000,
          })
        } else {
          toast({
            title: "Erreur",
            description: `Erreur d'inscription: ${error.message}`,
            variant: "destructive",
            duration: 5000,
          })
        }
        setIsLoading(false)
        return
      }
      
      console.log("Signup successful, redirecting to login page")
      toast({
        title: "Succès",
        description: 'Compte créé avec succès ! Veuillez vérifier votre email pour confirmer votre compte.',
        duration: 5000,
      })
      
      setIsLoading(false)
      // Redirection explicite vers la page de connexion
      router.push('/login')
    } catch (error) {
      console.error("Unexpected signup error:", error)
      toast({
        title: "Erreur",
        description: 'Une erreur inattendue est survenue',
        variant: "destructive",
        duration: 5000,
      })
      setIsLoading(false)
    }
  }

  // If not mounted yet (server-side), don't show signup content to prevent hydration errors
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
              <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
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
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">Créer un compte</CardTitle>
              <CardDescription className="text-gray-600">Entrez vos informations pour créer un compte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white/50 border-opacity-50 focus:border-[#467FF7] transition-colors"
                  />
                </div>
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
                  <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 border-opacity-50 focus:border-[#467FF7] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/50 border-opacity-50 focus:border-[#467FF7] transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#467FF7] to-[#7FA3F9] hover:from-[#3A6FE0] hover:to-[#6A8FE5] transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Création en cours...' : 'Créer un compte'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-gray-600">
                Vous avez déjà un compte?{' '}
                <Link href="/login" className="text-[#467FF7] hover:text-[#3A6FE0] transition-colors">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 