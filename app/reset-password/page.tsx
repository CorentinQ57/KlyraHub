"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!password || !confirmPassword) {
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
      
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        console.error("Reset password error:", error)
        toast({
          title: "Erreur",
          description: `Erreur lors de la réinitialisation: ${error.message}`,
          variant: "destructive",
          duration: 5000,
        })
        setIsLoading(false)
        return
      }
      
      setIsSuccess(true)
      toast({
        title: "Succès",
        description: 'Votre mot de passe a été réinitialisé avec succès',
        duration: 5000,
      })
      
      // Redirection après un court délai
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (error: any) {
      console.error("Unexpected reset password error:", error)
      toast({
        title: "Erreur",
        description: 'Une erreur inattendue est survenue',
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If not mounted yet (server-side), don't show content to prevent hydration errors
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
              <CardTitle className="text-2xl font-bold">Réinitialisation du mot de passe</CardTitle>
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
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#467FF7] to-[#7FA3F9]">Réinitialisation du mot de passe</CardTitle>
              <CardDescription className="text-gray-600">
                {isSuccess 
                  ? "Votre mot de passe a été réinitialisé avec succès"
                  : "Veuillez définir un nouveau mot de passe"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Nouveau mot de passe</Label>
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
                    {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="bg-green-100 text-green-700 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <p className="text-center text-gray-600">
                    Votre mot de passe a été réinitialisé avec succès.<br/>
                    Vous allez être redirigé vers la page de connexion.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-gray-600">
                <Link href="/login" className="text-[#467FF7] hover:text-[#3A6FE0] transition-colors">
                  Retour à la connexion
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 