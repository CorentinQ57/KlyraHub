"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check if there's a valid token in the URL
  useEffect(() => {
    // This logic assumes Supabase handles the token verification automatically
    // but we need to check that we have the necessary parameters in the URL
    if (!searchParams || !searchParams.has('type') || searchParams.get('type') !== 'recovery') {
      setError('Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')

    // Basic validation
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    try {
      // Use Supabase's built-in function to update the password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe')
      } else {
        setMessage('Votre mot de passe a été réinitialisé avec succès')
        // Clear the form
        setPassword('')
        setConfirmPassword('')
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <main className="w-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Réinitialiser le mot de passe</CardTitle>
            <CardDescription className="text-center">
              Créez un nouveau mot de passe pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className="mb-4 p-3 rounded bg-green-50 text-green-800 border border-green-200">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-500">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
} 