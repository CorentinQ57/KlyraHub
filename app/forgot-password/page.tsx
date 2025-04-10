"use client"

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')

    if (!email) {
      setError('Veuillez entrer votre adresse email')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await resetPassword(email)
      
      if (error) {
        setError(error.message || 'Une erreur est survenue lors de la demande de réinitialisation du mot de passe')
      } else {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse email')
        setEmail('')
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
            <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
            <CardDescription className="text-center">
              Entrez votre email pour recevoir un lien de réinitialisation
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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